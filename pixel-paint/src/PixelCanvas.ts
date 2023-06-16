import { getClosestColor, rgbFromHex } from "./color.util";

export class PixelCanvas {
  cursor: {
    x: number;
    y: number;
  };
  color: string;
  renderer: CanvasRenderingContext2D;
  ctx: CanvasRenderingContext2D;
  pixelSize: number = 10;

  // @ts-ignore
  image: ImageData;
  data: Uint32Array = new Uint32Array(0);

  constructor(
    ctx: CanvasRenderingContext2D,
    options: {
      pixelSize?: number;
    } = {}
  ) {
    this.cursor = {
      x: 0,
      y: 0,
    };
    this.color = "#000000";
    this.renderer = ctx;
    this.ctx = document.createElement("canvas").getContext("2d")!;
    this.setPixelSize(options?.pixelSize ?? 10);

    this.clear();
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
      if (x1 >= 0 && x1 <= width && y1 >= 0 && y1 <= height) {
        // if within bounds, draw
        this.setPixel(x1, y1);
      }

      if (x1 === x2 && y1 === y2) {
        // if at the end, stop
        break;
      }

      // get next position
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
    const x = (x1 / this.pixelSize) | 0;
    const y = (y1 / this.pixelSize) | 0;

    const data = this.data;
    const width = this.image.width;
    const height = this.image.height;
    const targetColor = data[(y * width + x) | 0];

    const seen = new Set();
    const queue: { x: number; y: number }[] = [{ x, y }];

    const enqueue = ({ x, y }: { x: number; y: number }) => {
      const idx = (y * width + x) | 0;
      if (seen.has(idx)) return;
      seen.add(idx);
      queue.push({ x, y });
    };

    this.beginPath();

    while (queue.length) {
      const { x, y } = queue.pop()!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const idx = (y * width + x) | 0;
      if (data[idx] !== targetColor) continue;
      data[idx] = 0xff000000 | parseInt(this.color.slice(1), 16);
      enqueue({ x: x - 1, y });
      enqueue({ x: x + 1, y });
      enqueue({ x, y: y - 1 });
      enqueue({ x, y: y + 1 });
    }

    this.stroke();
  }

  clear() {
    this.renderer.fillStyle = "#ffffff";
    this.renderer.fillRect(
      0,
      0,
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
  }

  export() {
    return this.renderer.canvas.toDataURL();
  }

  import(data: string) {
    const img = new Image();
    img.src = data;
    img.onload = () => {
      this.renderer.drawImage(img, 0, 0);
    };
  }
}
