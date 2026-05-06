import {
  getClosestPaletteColor,
  normalizeHexColor,
  quantizeImageDataToPalette,
  rgbFromHex,
} from "./palette";
import type { Palette } from "./palette";

function shouldUseAnonymousCors(source: string): boolean {
  return /^https?:\/\//i.test(source);
}

export interface PixelCanvasImportOptions {
  resolution?: "logical" | "renderer";
}

export interface PixelCanvasSetPaletteOptions {
  remap?: boolean;
}

export class PixelCanvas {
  cursor: {
    x: number;
    y: number;
  };
  color: string;
  renderer: CanvasRenderingContext2D;
  ctx: CanvasRenderingContext2D;
  pixelSize: number = 10;
  palette: Palette = [];

  // @ts-ignore
  image: ImageData;
  data: Uint32Array = new Uint32Array(0);

  constructor(
    ctx: CanvasRenderingContext2D,
    options: {
      pixelSize?: number;
      palette?: Palette;
    } = {}
  ) {
    this.cursor = {
      x: 0,
      y: 0,
    };
    this.color = "#000000";
    this.renderer = ctx;
    this.ctx = document.createElement("canvas").getContext("2d")!;
    this.palette = options.palette ?? [];
    this.setPixelSize(options?.pixelSize ?? 10);

    this.clear();
  }

  setPalette(palette: Palette, options: PixelCanvasSetPaletteOptions = {}) {
    const previousPalette = this.palette;
    this.palette = palette;

    if (options.remap === true) {
      this.remapContextPalette(this.renderer, previousPalette, palette);
      this.remapContextPalette(this.ctx, previousPalette, palette);
    }
  }

  private remapContextPalette(
    context: CanvasRenderingContext2D,
    previousPalette: Palette,
    nextPalette: Palette
  ) {
    const width = context.canvas.width;
    const height = context.canvas.height;
    if (width <= 0 || height <= 0 || previousPalette.length === 0) {
      return;
    }

    const previousColors = previousPalette.map((color) =>
      normalizeHexColor(color)
    );
    const image = context.getImageData(0, 0, width, height);
    const data = image.data;

    for (let index = 0; index < data.length; index += 4) {
      if (data[index + 3] === 0) {
        continue;
      }

      const previousColor = getClosestPaletteColor(
        {
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
        },
        previousPalette
      );
      const slot = previousColors.indexOf(previousColor);
      const nextColor = normalizeHexColor(nextPalette[slot] ?? "") ?? previousColor;
      const rgb = rgbFromHex(nextColor);

      data[index] = rgb.r;
      data[index + 1] = rgb.g;
      data[index + 2] = rgb.b;
      data[index + 3] = 255;
    }

    context.putImageData(image, 0, 0);
  }

  setPixelSize(pixelSize: number) {
    this.pixelSize = pixelSize;
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    const renderer = this.renderer.canvas;

    canvas.width = (renderer.width / pixelSize) | 0;
    canvas.height = (renderer.height / pixelSize) | 0;
    ctx.globalCompositeOperation = "source-in";
    this.image = ctx.createImageData(canvas.width, canvas.height);
    this.data = new Uint32Array(this.image.data.buffer);
  }
  beginPath() {
    this.data.fill(0);
  }
  stroke() {
    const renderer = this.renderer;
    const currentSmoothing = renderer.imageSmoothingEnabled;
    const ctx = this.ctx;
    ctx.putImageData(this.image, 0, 0);

    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.image.width, this.image.height);
    renderer.imageSmoothingEnabled = false;
    renderer.drawImage(
      ctx.canvas,
      0,
      0,
      renderer.canvas.width,
      renderer.canvas.height
    );
    renderer.imageSmoothingEnabled = currentSmoothing;
  }

  moveTo(x: number, y: number) {
    this.cursor.x = (x / this.pixelSize) | 0;
    this.cursor.y = (y / this.pixelSize) | 0;
  }

  setPixel(x: number, y: number) {
    if (x < 0 || x >= this.image.width || y < 0 || y >= this.image.height) {
      return;
    }

    const idx = (y * this.image.width + x) | 0;
    this.data[idx] = 0xff000000 | parseInt(this.color.slice(1), 16);
  }

  lineTo(x: number, y: number) {
    if (this.cursor.x === null) {
      this.moveTo(x, y);
      return;
    }

    const width = this.image.width;
    const height = this.image.height;
    let x1 = this.cursor.x;
    let y1 = this.cursor.y;

    const x2 = (x / this.pixelSize) | 0;
    const y2 = (y / this.pixelSize) | 0;
    const dx = Math.abs(x2 - x1);
    const sx = x1 < x2 ? 1 : -1;
    const dy = -Math.abs(y2 - y1);
    const sy = y1 < y2 ? 1 : -1;

    let e2;
    let er = dx + dy;

    while (true) {
      if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
        this.setPixel(x1, y1);
      }

      if (x1 === x2 && y1 === y2) {
        break;
      }

      e2 = 2 * er;
      if (e2 > dy) {
        er += dy;
        x1 += sx;
      }
      if (e2 < dx) {
        er += dx;
        y1 += sy;
      }
    }

    this.cursor.x = x2;
    this.cursor.y = y2;
  }

  fill(x1: number, y1: number) {
    const width = this.renderer.canvas.width;
    const height = this.renderer.canvas.height;
    if (width <= 0 || height <= 0) return;

    const x = Math.max(0, Math.min(width - 1, x1 | 0));
    const y = Math.max(0, Math.min(height - 1, y1 | 0));

    const image = this.renderer.getImageData(0, 0, width, height);
    const data = image.data;
    const startIdx = (y * width + x) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];

    const fillColor = rgbFromHex(this.color);
    if (
      targetR === fillColor.r &&
      targetG === fillColor.g &&
      targetB === fillColor.b &&
      targetA === 255
    ) {
      return;
    }

    const visited = new Uint8Array(width * height);
    const queue: { x: number; y: number }[] = [{ x, y }];

    while (queue.length) {
      const point = queue.pop();
      if (!point) break;

      const { x, y } = point;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const pixelIdx = y * width + x;
      if (visited[pixelIdx] === 1) continue;
      visited[pixelIdx] = 1;

      const idx = pixelIdx * 4;
      if (
        data[idx] !== targetR ||
        data[idx + 1] !== targetG ||
        data[idx + 2] !== targetB ||
        data[idx + 3] !== targetA
      ) {
        continue;
      }

      data[idx] = fillColor.r;
      data[idx + 1] = fillColor.g;
      data[idx + 2] = fillColor.b;
      data[idx + 3] = 255;

      queue.push({ x: x - 1, y });
      queue.push({ x: x + 1, y });
      queue.push({ x, y: y - 1 });
      queue.push({ x, y: y + 1 });
    }

    this.renderer.putImageData(image, 0, 0);
  }

  clear() {
    const currentFillStyle = this.renderer.fillStyle;

    this.renderer.fillStyle = "#ffffff";
    this.renderer.fillRect(
      0,
      0,
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );

    this.renderer.fillStyle = currentFillStyle;
  }

  export() {
    return this.renderer.canvas.toDataURL();
  }

  import(data: string, options: PixelCanvasImportOptions = {}) {
    const img = new Image();
    if (shouldUseAnonymousCors(data)) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      const renderer = this.renderer;
      const resolution = options.resolution ?? "logical";
      const target = resolution === "renderer" ? renderer : this.ctx;
      const width = target.canvas.width;
      const height = target.canvas.height;
      if (width <= 0 || height <= 0) {
        return;
      }

      const previousFillStyle = target.fillStyle;
      const targetSmoothing = target.imageSmoothingEnabled;
      const previousCompositeOperation = target.globalCompositeOperation;

      try {
        target.globalCompositeOperation = "source-over";
        target.fillStyle = "#ffffff";
        target.fillRect(0, 0, width, height);

        const scale = Math.min(
          width / img.width,
          height / img.height,
        );
        const drawWidth = Math.max(1, Math.floor(img.width * scale));
        const drawHeight = Math.max(1, Math.floor(img.height * scale));
        const offsetX = Math.floor((width - drawWidth) / 2);
        const offsetY = Math.floor((height - drawHeight) / 2);

        target.imageSmoothingEnabled = true;
        target.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        const imported = quantizeImageDataToPalette(
          target.getImageData(0, 0, width, height),
          this.palette,
        );
        target.putImageData(imported, 0, 0);

        if (resolution === "logical") {
          this.image = imported;
          this.data = new Uint32Array(imported.data.buffer);

          const rendererSmoothing = renderer.imageSmoothingEnabled;
          renderer.imageSmoothingEnabled = false;
          renderer.drawImage(
            target.canvas,
            0,
            0,
            renderer.canvas.width,
            renderer.canvas.height,
          );
          renderer.imageSmoothingEnabled = rendererSmoothing;
        }
      } finally {
        target.globalCompositeOperation = previousCompositeOperation;
        target.imageSmoothingEnabled = targetSmoothing;
        target.fillStyle = previousFillStyle;
      }
    };
    img.src = data;
  }
}
