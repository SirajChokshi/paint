import { beforeAll, describe, expect, it } from "vitest";
import { PixelCanvas, type Palette } from "pixel-paint";
import { HistoryStackState } from "./historyStack";
import { CanvasHistoryService } from "./canvasHistory";
import { usePaintStore } from "../stores/paintStore";
import {
  DEFAULT_PAINT_PALETTE_ID,
  PAINT_APP_PALETTE,
  PAINT_APP_PALETTES,
} from "../lib/palette";

const CUSTOM_IMAGE_PALETTE = [
  "#101010",
  "#202020",
  "#303030",
  "#404040",
  "#505050",
  "#606060",
  "#707070",
  "#808080",
  "#909090",
  "#a0a0a0",
  "#b0b0b0",
  "#c0c0c0",
  "#d0d0d0",
  "#e0e0e0",
  "#f0f0f0",
  "#ffffff",
];

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

function createPixelCanvasWithFailingImport(
  initialValue: number,
  initialPalette: Palette,
) {
  const renderer = new TestCanvasRenderer(initialValue);
  let currentPalette = initialPalette;
  let importPalette: Palette | null = null;
  const pixelCanvas = {
    renderer,
    get palette() {
      return currentPalette;
    },
    clear: () => renderer.setValue(0),
    fill: () => renderer.setValue(1),
    setPalette(palette: Palette) {
      currentPalette = palette;
    },
    import: async () => {
      importPalette = currentPalette;
      renderer.setValue(9);
      throw new Error("import failed");
    },
  } as unknown as PixelCanvas;

  return {
    pixelCanvas,
    renderer,
    get importPalette() {
      return importPalette;
    },
  };
}

function createPixelCanvasWithPaletteImport(
  initialValue: number,
  initialPalette: Palette,
) {
  const renderer = new TestCanvasRenderer(initialValue);
  let currentPalette = initialPalette;
  let importPalette: Palette | null = null;
  const pixelCanvas = {
    renderer,
    get palette() {
      return currentPalette;
    },
    clear: () => renderer.setValue(0),
    fill: () => renderer.setValue(1),
    setPalette(palette: Palette) {
      currentPalette = palette;
    },
    import: async (data: string) => {
      await Promise.resolve();
      importPalette = currentPalette;
      renderer.setValue(Number(data));
    },
  } as unknown as PixelCanvas;

  return {
    pixelCanvas,
    renderer,
    get importPalette() {
      return importPalette;
    },
  };
}

function resetPaintStore() {
  usePaintStore.setState({
    foregroundColorIndex: 0,
    backgroundColor: "transparent",
    activeColorSlot: "fg",
    paletteId: DEFAULT_PAINT_PALETTE_ID,
    customPalette: null,
    toolMode: "pencil",
  });
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
      }
    ).plugin = null;

    await expect(history.import("2")).rejects.toThrow(
      "Canvas import plugin is not installed",
    );
  });

  it("restores the previous palette when an import with a palette fails", async () => {
    const history = new CanvasHistoryService();
    const previousPalette = ["#000000"];
    const nextPalette = ["#ffffff"];
    const { pixelCanvas, renderer } = createPixelCanvasWithFailingImport(
      5,
      previousPalette,
    );

    history.bind(pixelCanvas);

    await expect(history.importWithPalette("data", nextPalette)).rejects.toThrow(
      "import failed",
    );
    expect(pixelCanvas.palette).toBe(previousPalette);
    expect(renderer.value).toBe(5);
  });

  it("rejects an import with a palette when the canvas is unavailable", async () => {
    const history = new CanvasHistoryService();

    await expect(history.importWithPalette("data", ["#ffffff"])).rejects.toThrow(
      "Canvas import plugin is not installed",
    );
  });

  it("resets an active custom image palette to toybox for the next plain import", async () => {
    resetPaintStore();
    const history = new CanvasHistoryService();
    const imported = createPixelCanvasWithPaletteImport(
      4,
      CUSTOM_IMAGE_PALETTE,
    );
    usePaintStore.setState({
      customPalette: CUSTOM_IMAGE_PALETTE,
      foregroundColorIndex: 1,
    });

    history.bind(imported.pixelCanvas);
    await history.import("8");

    expect(imported.importPalette).toBe(PAINT_APP_PALETTE);
    expect(imported.pixelCanvas.palette).toBe(PAINT_APP_PALETTE);
    expect(usePaintStore.getState()).toMatchObject({
      paletteId: DEFAULT_PAINT_PALETTE_ID,
      customPalette: null,
      foregroundColorIndex: 1,
    });
  });

  it("restores an active custom image palette when a plain import fails", async () => {
    resetPaintStore();
    const history = new CanvasHistoryService();
    const imported = createPixelCanvasWithFailingImport(
      5,
      CUSTOM_IMAGE_PALETTE,
    );
    usePaintStore.setState({
      customPalette: CUSTOM_IMAGE_PALETTE,
      foregroundColorIndex: 1,
    });

    history.bind(imported.pixelCanvas);

    await expect(history.import("data")).rejects.toThrow("import failed");
    expect(imported.importPalette).toBe(PAINT_APP_PALETTE);
    expect(imported.pixelCanvas.palette).toBe(CUSTOM_IMAGE_PALETTE);
    expect(imported.renderer.value).toBe(5);
    expect(usePaintStore.getState()).toMatchObject({
      paletteId: DEFAULT_PAINT_PALETTE_ID,
      customPalette: CUSTOM_IMAGE_PALETTE,
      foregroundColorIndex: 1,
    });
  });

  it("keeps a named palette selected for a plain import", async () => {
    resetPaintStore();
    const history = new CanvasHistoryService();
    const namedPalette = PAINT_APP_PALETTES.watercolor.colors;
    const imported = createPixelCanvasWithPaletteImport(
      4,
      namedPalette,
    );
    usePaintStore.setState({
      paletteId: "watercolor",
      customPalette: null,
      foregroundColorIndex: 2,
    });

    history.bind(imported.pixelCanvas);
    await history.import("8");

    expect(imported.importPalette).toBe(namedPalette);
    expect(usePaintStore.getState()).toMatchObject({
      paletteId: "watercolor",
      customPalette: null,
      foregroundColorIndex: 2,
    });
  });
});
