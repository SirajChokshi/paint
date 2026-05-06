import { beforeAll, describe, expect, it } from "vitest";
import { PixelCanvas } from "pixel-paint";
import { HistoryStackState } from "./historyStack";
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

function createDeferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function createPixelCanvasWithDeferredImport(initialValue: number) {
  const renderer = new TestCanvasRenderer(initialValue);
  const deferred = createDeferred<number>();
  const pixelCanvas = {
    renderer,
    clear: () => renderer.setValue(0),
    fill: () => renderer.setValue(1),
    setPalette: () => renderer.setValue(2),
    import: async () => {
      renderer.setValue(await deferred.promise);
    },
  } as unknown as PixelCanvas;

  return { pixelCanvas, renderer, deferred };
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

  it("ignores emissions from an old history stack after rebinding", async () => {
    const history = new CanvasHistoryService();
    const first = createPixelCanvasWithDeferredImport(1);
    const second = createPixelCanvas(2);
    const states: HistoryStackState[] = [];

    history.subscribe((state) => states.push(state));
    history.bind(first.pixelCanvas);
    const importPromise = history.import("3");
    history.bind(second.pixelCanvas);

    first.deferred.resolve(3);
    await importPromise;

    expect(history.getState()).toEqual({ canUndo: false, canRedo: false });
    expect(states[states.length - 1]).toEqual({ canUndo: false, canRedo: false });
  });

  it("fails fast instead of recursing when the original import is unavailable", async () => {
    const history = new CanvasHistoryService();
    const { pixelCanvas } = createPixelCanvas(1);

    history.bind(pixelCanvas);
    (
      history as unknown as {
        plugin: null;
        restoreImport: null;
      }
    ).plugin = null;
    (
      history as unknown as {
        plugin: null;
        restoreImport: null;
      }
    ).restoreImport = null;

    await expect(history.import("2")).rejects.toThrow(
      "Canvas import plugin is not installed",
    );
  });
});
