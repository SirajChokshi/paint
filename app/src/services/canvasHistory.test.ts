import { beforeAll, describe, expect, it } from "vitest";
import { PixelCanvas } from "pixel-paint";
import { CanvasHistoryService } from "./canvasHistory";

class TestImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;

  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}

class TestCanvasRenderer {
  canvas = { width: 1, height: 1 };
  private snapshot = createSnapshot(0);

  constructor(initialValue: number) {
    this.snapshot = createSnapshot(initialValue);
  }

  get value() {
    return this.snapshot.data[0];
  }

  setValue(value: number) {
    this.snapshot = createSnapshot(value);
  }

  getImageData() {
    return createSnapshot(this.value);
  }

  putImageData(snapshot: ImageData) {
    this.snapshot = createSnapshot(snapshot.data[0]);
  }
}

function createSnapshot(value: number) {
  return new ImageData(new Uint8ClampedArray([value, 0, 0, 255]), 1, 1);
}

function createPixelCanvas(initialValue: number) {
  const renderer = new TestCanvasRenderer(initialValue);
  const pixelCanvas = {
    renderer,
    clear: () => renderer.setValue(0),
    fill: () => renderer.setValue(1),
    setPalette: () => renderer.setValue(2),
    import: async (data: string) => {
      await Promise.resolve();
      renderer.setValue(Number(data));
    },
  } as unknown as PixelCanvas;

  return { pixelCanvas, renderer };
}

beforeAll(() => {
  globalThis.ImageData = TestImageData as typeof ImageData;
});

describe("CanvasHistoryService", () => {
  it("replaces the canvas with an imported image as a single undo step", async () => {
    const history = new CanvasHistoryService();
    const { pixelCanvas, renderer } = createPixelCanvas(7);

    history.bind(pixelCanvas);
    await history.replaceWithImport("9");

    expect(renderer.value).toBe(9);
    expect(history.undo()).toBe(true);
    expect(renderer.value).toBe(7);
    expect(history.redo()).toBe(true);
    expect(renderer.value).toBe(9);
  });
});
