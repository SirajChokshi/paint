import {
  normalizeHexColor,
  rgbFromHex,
  type Palette,
  type RgbColor,
} from "pixel-paint";
import { PAINT_APP_PALETTES } from "./palette";

export const AUTOPALETTE_COLOR_COUNT = 16;
export const AUTOPALETTE_MIN_DISTANCE = 0.08;

const MAX_SAMPLED_PIXELS = 12_000;
const SOURCE_MAX_DIMENSION = 96;
const CHANNEL_BUCKET_SHIFT = 3;
const FOCAL_GRID_SIZE = 12;
const BACKGROUND_SAMPLE_WEIGHT = 0.08;
const FOREGROUND_SAMPLE_WEIGHT = 7.5;
const FOREGROUND_RADIUS = 0.24;
const BACKGROUND_COLOR_LIMIT = 4;
const BACKGROUND_FOCUS_THRESHOLD = 0.5;

interface LabColor {
  l: number;
  a: number;
  b: number;
}

interface ColorCandidate extends RgbColor {
  count: number;
  focus: number;
  hex: string;
  lab: LabColor;
}

export interface AutopaletteFocalPoint {
  x: number;
  y: number;
}

export interface AutopaletteAnalysis {
  focalPoint: AutopaletteFocalPoint;
  palette: Palette;
}

function shouldUseAnonymousCors(source: string): boolean {
  return /^https?:\/\//i.test(source);
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function channelToHex(value: number): string {
  return clampChannel(value).toString(16).padStart(2, "0");
}

function rgbToHex(color: RgbColor): string {
  return `#${channelToHex(color.r)}${channelToHex(color.g)}${channelToHex(color.b)}`;
}

function getPixelOffset(imageData: ImageData, x: number, y: number): number {
  return (y * imageData.width + x) * 4;
}

function getPixelRgb(imageData: ImageData, x: number, y: number): RgbColor {
  const offset = getPixelOffset(imageData, x, y);
  const alpha = imageData.data[offset + 3] / 255;

  return {
    r: clampChannel(imageData.data[offset] * alpha + 255 * (1 - alpha)),
    g: clampChannel(imageData.data[offset + 1] * alpha + 255 * (1 - alpha)),
    b: clampChannel(imageData.data[offset + 2] * alpha + 255 * (1 - alpha)),
  };
}

function getLuminance(color: RgbColor): number {
  return color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;
}

function getSaturation(color: RgbColor): number {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);

  return max === 0 ? 0 : (max - min) / max;
}

function getSkinToneScore(color: RgbColor): number {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  const cb = 128 - 0.168736 * color.r - 0.331264 * color.g + 0.5 * color.b;
  const cr = 128 + 0.5 * color.r - 0.418688 * color.g - 0.081312 * color.b;
  const channelSpread = max - min;
  const hasSkinOrdering =
    color.r > color.g * 0.95 &&
    color.r > color.b * 1.08 &&
    color.g > color.b * 0.85;
  const hasSkinChroma = cb >= 72 && cb <= 132 && cr >= 128 && cr <= 178;
  const hasUsableRange =
    color.r > 45 &&
    color.g > 30 &&
    color.b > 18 &&
    channelSpread > 14 &&
    getLuminance(color) < 240;

  return hasSkinOrdering && hasSkinChroma && hasUsableRange ? 1 : 0;
}

function srgbToLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function rgbToOklab(color: RgbColor): LabColor {
  const red = srgbToLinear(color.r);
  const green = srgbToLinear(color.g);
  const blue = srgbToLinear(color.b);

  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);

  return {
    l: 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short,
    a: 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short,
    b: 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short,
  };
}

function labDistance(first: LabColor, second: LabColor): number {
  const lightness = (first.l - second.l) * 1.2;
  return Math.sqrt(
    lightness ** 2 +
      (first.a - second.a) ** 2 +
      (first.b - second.b) ** 2,
  );
}

function colorDistance(first: RgbColor, second: RgbColor): number {
  return labDistance(rgbToOklab(first), rgbToOklab(second));
}

function minDistanceToSelected(color: RgbColor, selected: readonly RgbColor[]): number {
  if (selected.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(
    ...selected.map((selectedColor) => colorDistance(color, selectedColor)),
  );
}

function isDistinctEnough(color: RgbColor, selected: readonly RgbColor[]): boolean {
  return minDistanceToSelected(color, selected) >= AUTOPALETTE_MIN_DISTANCE;
}

function toCandidate(
  color: RgbColor,
  count: number,
  focus = 1,
): ColorCandidate {
  return {
    r: color.r,
    g: color.g,
    b: color.b,
    count,
    focus,
    hex: rgbToHex(color),
    lab: rgbToOklab(color),
  };
}

function addCandidate(
  candidate: ColorCandidate | undefined,
  selected: ColorCandidate[],
): boolean {
  if (!candidate) {
    return false;
  }

  if (selected.some((selectedCandidate) => selectedCandidate.hex === candidate.hex)) {
    return false;
  }

  if (!isDistinctEnough(candidate, selected)) {
    return false;
  }

  selected.push(candidate);
  return true;
}

function detectFocalPoint(imageData: ImageData): AutopaletteFocalPoint {
  const gridWidth = Math.min(FOCAL_GRID_SIZE, imageData.width);
  const gridHeight = Math.min(FOCAL_GRID_SIZE, imageData.height);
  const scores = Array.from(
    { length: gridWidth * gridHeight },
    () => ({ score: 0, weight: 0, x: 0, y: 0 }),
  );
  const pixelCount = imageData.width * imageData.height;
  const step = Math.max(1, Math.floor(pixelCount / MAX_SAMPLED_PIXELS));

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += step) {
    const x = pixelIndex % imageData.width;
    const y = Math.floor(pixelIndex / imageData.width);
    const color = getPixelRgb(imageData, x, y);
    const right = getPixelRgb(imageData, Math.min(imageData.width - 1, x + 1), y);
    const down = getPixelRgb(imageData, x, Math.min(imageData.height - 1, y + 1));
    const edge =
      Math.abs(getLuminance(color) - getLuminance(right)) +
      Math.abs(getLuminance(color) - getLuminance(down));
    const normalizedX = imageData.width <= 1 ? 0.5 : x / (imageData.width - 1);
    const normalizedY = imageData.height <= 1 ? 0.5 : y / (imageData.height - 1);
    const centerDistance = Math.hypot(normalizedX - 0.5, normalizedY - 0.5);
    const centerBias = Math.max(0.35, 1 - centerDistance * 0.9);
    const saturation = getSaturation(color);
    const skinTone = getSkinToneScore(color);
    const saliency = (edge / 255 + saturation * 0.35 + skinTone * 1.1) * centerBias;
    const gridX = Math.min(gridWidth - 1, Math.floor(normalizedX * gridWidth));
    const gridY = Math.min(gridHeight - 1, Math.floor(normalizedY * gridHeight));
    const cell = scores[gridY * gridWidth + gridX];

    cell.score += saliency;
    cell.weight += 1;
    cell.x += normalizedX;
    cell.y += normalizedY;
  }

  const bestCell = scores.reduce((best, cell) => {
    const bestScore = best.weight === 0 ? 0 : best.score / best.weight;
    const cellScore = cell.weight === 0 ? 0 : cell.score / cell.weight;

    return cellScore > bestScore ? cell : best;
  }, scores[0]);

  if (!bestCell || bestCell.weight === 0) {
    return { x: 0.5, y: 0.5 };
  }

  return {
    x: bestCell.x / bestCell.weight,
    y: bestCell.y / bestCell.weight,
  };
}

function getFocalWeight(
  x: number,
  y: number,
  imageData: ImageData,
  focalPoint: AutopaletteFocalPoint,
): number {
  const normalizedX = imageData.width <= 1 ? 0.5 : x / (imageData.width - 1);
  const normalizedY = imageData.height <= 1 ? 0.5 : y / (imageData.height - 1);
  const distance = Math.hypot(
    normalizedX - focalPoint.x,
    normalizedY - focalPoint.y,
  );
  const foreground = Math.exp(-(distance ** 2) / (2 * FOREGROUND_RADIUS ** 2));

  return BACKGROUND_SAMPLE_WEIGHT + FOREGROUND_SAMPLE_WEIGHT * foreground;
}

function getFocalStrength(
  x: number,
  y: number,
  imageData: ImageData,
  focalPoint: AutopaletteFocalPoint,
): number {
  const normalizedX = imageData.width <= 1 ? 0.5 : x / (imageData.width - 1);
  const normalizedY = imageData.height <= 1 ? 0.5 : y / (imageData.height - 1);
  const distance = Math.hypot(
    normalizedX - focalPoint.x,
    normalizedY - focalPoint.y,
  );

  return Math.exp(-(distance ** 2) / (2 * FOREGROUND_RADIUS ** 2));
}

function extractColorCandidates(
  imageData: ImageData,
  focalPoint: AutopaletteFocalPoint,
): ColorCandidate[] {
  const buckets = new Map<
    string,
    { r: number; g: number; b: number; count: number; focus: number }
  >();
  const pixelCount = Math.floor(imageData.data.length / 4);
  const step = Math.max(1, Math.floor(pixelCount / MAX_SAMPLED_PIXELS));

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += step) {
    const x = pixelIndex % imageData.width;
    const y = Math.floor(pixelIndex / imageData.width);
    const color = getPixelRgb(imageData, x, y);
    const weight = getFocalWeight(x, y, imageData, focalPoint);
    const focus = getFocalStrength(x, y, imageData, focalPoint);
    const key = `${color.r >> CHANNEL_BUCKET_SHIFT}:${color.g >> CHANNEL_BUCKET_SHIFT}:${color.b >> CHANNEL_BUCKET_SHIFT}`;
    const bucket = buckets.get(key);

    if (bucket) {
      bucket.r += color.r * weight;
      bucket.g += color.g * weight;
      bucket.b += color.b * weight;
      bucket.count += weight;
      bucket.focus += focus * weight;
    } else {
      buckets.set(key, {
        r: color.r * weight,
        g: color.g * weight,
        b: color.b * weight,
        count: weight,
        focus: focus * weight,
      });
    }
  }

  return Array.from(buckets.values())
    .map((bucket) =>
      toCandidate(
        {
          r: bucket.r / bucket.count,
          g: bucket.g / bucket.count,
          b: bucket.b / bucket.count,
        },
        bucket.count,
        bucket.focus / bucket.count,
      ),
    )
    .sort((first, second) => second.count - first.count);
}

function addContrastAnchors(candidates: ColorCandidate[], selected: ColorCandidate[]) {
  const maxCount = candidates[0]?.count ?? 0;
  const significantCandidates = candidates.filter(
    (candidate) => candidate.count >= maxCount * 0.04,
  );
  const anchorCandidates =
    significantCandidates.length > 0 ? significantCandidates : candidates;
  const darkest = anchorCandidates.reduce<ColorCandidate | undefined>(
    (darkestCandidate, candidate) =>
      !darkestCandidate || candidate.lab.l < darkestCandidate.lab.l
        ? candidate
        : darkestCandidate,
    undefined,
  );
  const lightest = anchorCandidates.reduce<ColorCandidate | undefined>(
    (lightestCandidate, candidate) =>
      !lightestCandidate || candidate.lab.l > lightestCandidate.lab.l
        ? candidate
        : lightestCandidate,
    undefined,
  );

  addCandidate(darkest, selected);
  addCandidate(lightest, selected);
}

function getLuminanceBand(color: ColorCandidate): "dark" | "mid" | "light" {
  if (color.lab.l < 0.34) {
    return "dark";
  }

  if (color.lab.l > 0.72) {
    return "light";
  }

  return "mid";
}

function scoreCandidate(
  candidate: ColorCandidate,
  selected: readonly ColorCandidate[],
  maxLogCount: number,
): number {
  const frequencyScore = Math.log1p(candidate.count) / maxLogCount;
  const distance = minDistanceToSelected(candidate, selected);
  const distanceScore = selected.length === 0 ? 1 : Math.min(distance / 0.38, 1);
  const focusScore = Math.min(candidate.focus, 1);
  const band = getLuminanceBand(candidate);
  const hasBand = selected.some((selectedCandidate) =>
    getLuminanceBand(selectedCandidate) === band,
  );
  const bandScore = hasBand ? 0 : 0.12;
  const contrastScore = Math.abs(candidate.lab.l - 0.5) * 0.12;

  return (
    focusScore * 0.4 +
    frequencyScore * 0.34 +
    distanceScore * 0.22 +
    bandScore +
    contrastScore
  );
}

function addImageColors(candidates: ColorCandidate[], selected: ColorCandidate[]) {
  const maxLogCount = Math.log1p(candidates[0]?.count ?? 1);

  while (selected.length < AUTOPALETTE_COLOR_COUNT) {
    let bestCandidate: ColorCandidate | undefined;
    let bestScore = Number.NEGATIVE_INFINITY;
    const selectedBackgroundColors = selected.filter(
      (selectedCandidate) =>
        selectedCandidate.count > 0 &&
        selectedCandidate.focus < BACKGROUND_FOCUS_THRESHOLD,
    ).length;

    for (const candidate of candidates) {
      if (selected.some((selectedCandidate) => selectedCandidate.hex === candidate.hex)) {
        continue;
      }

      if (!isDistinctEnough(candidate, selected)) {
        continue;
      }

      if (
        candidate.focus < BACKGROUND_FOCUS_THRESHOLD &&
        selectedBackgroundColors >= BACKGROUND_COLOR_LIMIT
      ) {
        continue;
      }

      const score = scoreCandidate(candidate, selected, maxLogCount);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    if (!addCandidate(bestCandidate, selected)) {
      return;
    }
  }
}

function addToyboxBackfill(selected: ColorCandidate[]) {
  const imageColors = [...selected];
  const backfill = PAINT_APP_PALETTES.toybox.colors
    .map((color, index) => {
      const normalized = normalizeHexColor(color) ?? color;
      const rgb = rgbFromHex(normalized);

      return {
        candidate: toCandidate(rgb, 0),
        distance: minDistanceToSelected(rgb, imageColors),
        index,
      };
    })
    .sort((first, second) => {
      if (second.distance !== first.distance) {
        return second.distance - first.distance;
      }

      return first.index - second.index;
    });

  for (const { candidate } of backfill) {
    if (selected.length >= AUTOPALETTE_COLOR_COUNT) return;

    addCandidate(candidate, selected);
  }

  while (selected.length < AUTOPALETTE_COLOR_COUNT) {
    const nextBackfill = backfill.find(({ candidate }) =>
      !selected.some((selectedCandidate) => selectedCandidate.hex === candidate.hex) &&
      isDistinctEnough(candidate, selected),
    );

    if (nextBackfill) {
      selected.push(nextBackfill.candidate);
      continue;
    }

    const removableImageColorIndex = selected.findLastIndex(
      (candidate) => candidate.count > 0,
    );
    if (removableImageColorIndex === -1) {
      return;
    }

    selected.splice(removableImageColorIndex, 1);
  }
}

export function getAutopaletteColorDistance(first: string, second: string): number {
  return colorDistance(rgbFromHex(first), rgbFromHex(second));
}

export function analyzeAutopaletteImageData(
  imageData: ImageData,
): AutopaletteAnalysis {
  const focalPoint = detectFocalPoint(imageData);
  const candidates = extractColorCandidates(imageData, focalPoint);
  const selected: ColorCandidate[] = [];

  addContrastAnchors(candidates, selected);
  addImageColors(candidates, selected);
  addToyboxBackfill(selected);

  return {
    focalPoint,
    palette: selected
      .slice(0, AUTOPALETTE_COLOR_COUNT)
      .map((candidate) => candidate.hex),
  };
}

export function createAutopaletteFromImageData(imageData: ImageData): Palette {
  return analyzeAutopaletteImageData(imageData).palette;
}

export function createAutopaletteFromImageSource(source: string): Promise<Palette> {
  const img = new Image();
  if (shouldUseAnonymousCors(source)) {
    img.crossOrigin = "anonymous";
  }

  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const scale = Math.min(
          1,
          SOURCE_MAX_DIMENSION / Math.max(img.width, img.height),
        );
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not create canvas context for autopalette import"));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.imageSmoothingEnabled = true;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(img, 0, 0, width, height);

        resolve(createAutopaletteFromImageData(context.getImageData(0, 0, width, height)));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Unable to load image for autopalette import"));
    img.src = source;
  });
}
