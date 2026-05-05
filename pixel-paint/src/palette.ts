export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface HslColor {
  h: number;
  s: number;
  l: number;
}

export type Palette = readonly string[];

const HEX_COLOR = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export function normalizeHexColor(color: string): string | null {
  const match = HEX_COLOR.exec(color.trim());
  if (!match) {
    return null;
  }

  return `#${match[1]}${match[2]}${match[3]}`.toLowerCase();
}

export function rgbFromHex(hex: string): RgbColor {
  const normalized = normalizeHexColor(hex);
  if (!normalized) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbDistance(first: RgbColor, second: RgbColor): number {
  return (
    (first.r - second.r) ** 2 +
    (first.g - second.g) ** 2 +
    (first.b - second.b) ** 2
  );
}

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;

  if (max === red) {
    h = ((green - blue) / delta) % 6;
  } else if (max === green) {
    h = (blue - red) / delta + 2;
  } else {
    h = (red - green) / delta + 4;
  }

  return {
    h: (h * 60 + 360) % 360,
    s,
    l,
  };
}

function hueDistance(first: number, second: number): number {
  const distance = Math.abs(first - second);
  return Math.min(distance, 360 - distance) / 180;
}

function paletteDistance(color: RgbColor, candidate: RgbColor): number {
  const colorHsl = rgbToHsl(color);
  const candidateHsl = rgbToHsl(candidate);

  if (colorHsl.s < 0.12 || colorHsl.l < 0.12 || colorHsl.l > 0.92) {
    return rgbDistance(color, candidate);
  }

  return (
    hueDistance(colorHsl.h, candidateHsl.h) * 3 +
    Math.abs(colorHsl.s - candidateHsl.s) * 0.5 +
    Math.abs(colorHsl.l - candidateHsl.l)
  );
}

export function getClosestPaletteColor(
  color: RgbColor,
  palette: Palette,
): string {
  let nearest = normalizeHexColor(palette[0] ?? "#000000") ?? "#000000";
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of palette) {
    const normalized = normalizeHexColor(candidate);
    if (!normalized) {
      continue;
    }

    const candidateRgb = rgbFromHex(normalized);
    const distance = paletteDistance(color, candidateRgb);

    if (distance < nearestDistance) {
      nearest = normalized;
      nearestDistance = distance;
    }
  }

  return nearest;
}

export function quantizeImageDataToPalette(
  imageData: ImageData,
  palette: Palette,
): ImageData {
  if (palette.length === 0) {
    return imageData;
  }

  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    const color = alpha === 0
      ? "#ffffff"
      : getClosestPaletteColor(
          {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
          },
          palette,
        );
    const rgb = rgbFromHex(color);

    data[index] = rgb.r;
    data[index + 1] = rgb.g;
    data[index + 2] = rgb.b;
    data[index + 3] = 255;
  }

  return imageData;
}
