import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PixelCanvas } from "./PixelCanvas";

class StubImage {
  static instances: StubImage[] = [];

  crossOrigin: string | null = null;
  height = 2;
  onerror: ((event: Event | string) => void) | null = null;
  onload: (() => void) | null = null;
  src = "";
  width = 2;

  constructor() {
    StubImage.instances.push(this);
  }
}

interface StubCanvas {
  height: number;
  toDataURL: () => string;
  width: number;
}

class StubCanvasRenderingContext2D {
  canvas: StubCanvas;
  drawImage = vi.fn();
  fillRect = vi.fn();
  fillStyle: string | CanvasGradient | CanvasPattern = "#000000";
  globalCompositeOperation: GlobalCompositeOperation = "source-over";
  imageSmoothingEnabled = false;
  putImageData = vi.fn();
  shouldThrowOnGetImageData = false;

  constructor(width: number, height: number) {
    this.canvas = {
      height,
      toDataURL: () => "data:image/png;base64,stub",
      width,
    };
  }

  createImageData(width: number, height: number): ImageData {
    return {
      colorSpace: "srgb",
      data: new Uint8ClampedArray(width * height * 4),
      height,
      width,
    } as ImageData;
  }

  getImageData(width: number, height: number): ImageData;
  getImageData(
    _sourceX: number,
    _sourceY: number,
    width: number,
    height: number
  ): ImageData {
    if (this.shouldThrowOnGetImageData) {
      throw new DOMException(
        "The canvas has been tainted by cross-origin data",
        "SecurityError"
      );
    }

    const imageData = this.createImageData(width, height);
    imageData.data.fill(255);
    return imageData;
  }
}

function createPixelCanvas() {
  const renderer = new StubCanvasRenderingContext2D(20, 20);
  const logical = new StubCanvasRenderingContext2D(1, 1);

  vi.stubGlobal("document", {
    createElement: () => ({
      getContext: () => logical,
    }),
  });

  return {
    logical,
    pixelCanvas: new PixelCanvas(renderer as unknown as CanvasRenderingContext2D),
    renderer,
  };
}

describe("PixelCanvas.lineTo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("completes vertical and horizontal segments without hanging", () => {
    const { pixelCanvas } = createPixelCanvas();
    pixelCanvas.setPixelSize(10);

    pixelCanvas.beginPath();
    pixelCanvas.moveTo(0, 0);
    expect(() => pixelCanvas.lineTo(0, 50)).not.toThrow();
    expect(pixelCanvas.cursor).toEqual({ x: 0, y: 5 });

    pixelCanvas.beginPath();
    pixelCanvas.moveTo(0, 0);
    expect(() => pixelCanvas.lineTo(50, 0)).not.toThrow();
    expect(pixelCanvas.cursor).toEqual({ x: 5, y: 0 });
  });
});

describe("PixelCanvas.clear", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clears the logical stroke buffer as well as the renderer", () => {
    const { logical, pixelCanvas } = createPixelCanvas();
    pixelCanvas.setPixelSize(10);
    pixelCanvas.color = "#ff0000";
    pixelCanvas.beginPath();
    pixelCanvas.moveTo(0, 0);
    pixelCanvas.lineTo(10, 0);
    pixelCanvas.stroke();

    expect(pixelCanvas.data.some((value) => value !== 0)).toBe(true);

    pixelCanvas.clear();

    expect(pixelCanvas.data.every((value) => value === 0)).toBe(true);
    expect(logical.putImageData).toHaveBeenCalled();
  });
});

describe("PixelCanvas.import", () => {
  beforeEach(() => {
    StubImage.instances = [];
    vi.stubGlobal("Image", StubImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a Promise that resolves after the image is imported", async () => {
    const { logical, pixelCanvas, renderer } = createPixelCanvas();
    logical.putImageData.mockClear();

    const importPromise = pixelCanvas.import("data:image/png;base64,stub");
    StubImage.instances[0].onload?.();

    await expect(importPromise).resolves.toBeUndefined();
    expect(logical.putImageData).toHaveBeenCalledOnce();
    expect(renderer.drawImage).toHaveBeenCalledOnce();
  });

  it("resolves without drawing when the target canvas is empty", async () => {
    const { logical, pixelCanvas, renderer } = createPixelCanvas();
    logical.canvas.width = 0;
    logical.putImageData.mockClear();

    const importPromise = pixelCanvas.import("data:image/png;base64,stub");
    StubImage.instances[0].onload?.();

    await expect(importPromise).resolves.toBeUndefined();
    expect(logical.putImageData).not.toHaveBeenCalled();
    expect(renderer.drawImage).not.toHaveBeenCalled();
  });

  it("rejects when the image fails to load", async () => {
    const { pixelCanvas } = createPixelCanvas();

    const importPromise = pixelCanvas.import("https://example.com/image.png");
    const image = StubImage.instances[0];
    image.onerror?.(new Event("error"));

    expect(image.crossOrigin).toBe("anonymous");
    await expect(importPromise).rejects.toThrow(
      'Unable to import image from "https://example.com/image.png"'
    );
  });

  it("does not embed oversized data URLs in load failure messages", async () => {
    const { pixelCanvas } = createPixelCanvas();
    const payload = "A".repeat(1024 * 1024);
    const dataUrl = `data:image/png;base64,${payload}`;

    const importPromise = pixelCanvas.import(dataUrl);
    StubImage.instances[0].onerror?.(new Event("error"));

    await expect(importPromise).rejects.toMatchObject({
      message: expect.not.stringContaining(payload),
    });
    await expect(importPromise).rejects.toMatchObject({
      message: expect.stringMatching(/^.{1,200}$/s),
    });
  });

  it("rejects with the canvas import failure when browser security blocks pixel reads", async () => {
    const { logical, pixelCanvas } = createPixelCanvas();
    logical.shouldThrowOnGetImageData = true;

    const importPromise = pixelCanvas.import("data:image/png;base64,stub");
    StubImage.instances[0].onload?.();

    await expect(importPromise).rejects.toMatchObject({
      name: "SecurityError",
    });
  });

  it("restores renderer smoothing when logical import redraw fails", async () => {
    const { pixelCanvas, renderer } = createPixelCanvas();
    renderer.imageSmoothingEnabled = true;
    renderer.drawImage.mockImplementationOnce(() => {
      throw new Error("Could not redraw renderer");
    });

    const importPromise = pixelCanvas.import("data:image/png;base64,stub");
    StubImage.instances[0].onload?.();

    await expect(importPromise).rejects.toThrow("Could not redraw renderer");
    expect(renderer.imageSmoothingEnabled).toBe(true);
  });
});
