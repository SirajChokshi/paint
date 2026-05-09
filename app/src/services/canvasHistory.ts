import {
  PixelCanvas,
  type Palette,
  type PixelCanvasImportOptions,
} from "pixel-paint";
import { HistoryStackService, HistoryStackState } from "./historyStack";

export type CanvasSnapshot = ImageData;

type CanvasHistoryListener = (state: HistoryStackState) => void;

interface CanvasMutationPlugin {
  clear: PixelCanvas["clear"];
  fill: PixelCanvas["fill"];
  import: PixelCanvas["import"];
  setPalette: PixelCanvas["setPalette"];
}

function cloneImageData(snapshot: ImageData) {
  return new ImageData(
    new Uint8ClampedArray(snapshot.data),
    snapshot.width,
    snapshot.height,
  );
}

function imageDataEquals(a: ImageData, b: ImageData) {
  if (a.width !== b.width || a.height !== b.height) {
    return false;
  }

  const aData = a.data;
  const bData = b.data;
  if (aData.length !== bData.length) {
    return false;
  }

  for (let index = 0; index < aData.length; index += 1) {
    if (aData[index] !== bData[index]) {
      return false;
    }
  }

  return true;
}

export class CanvasHistoryService {
  private history: HistoryStackService<CanvasSnapshot> | null = null;
  private pixelCanvas: PixelCanvas | null = null;
  private plugin: CanvasMutationPlugin | null = null;
  private listeners = new Set<CanvasHistoryListener>();
  private restoreImport: PixelCanvas["import"] | null = null;
  private unsubscribeHistory: (() => void) | null = null;

  getState(): HistoryStackState {
    return this.history?.getState() ?? { canUndo: false, canRedo: false };
  }

  subscribe(listener: CanvasHistoryListener) {
    this.listeners.add(listener);
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  bind(pixelCanvas: PixelCanvas) {
    this.uninstallPlugin();
    this.pixelCanvas = pixelCanvas;
    this.history = new HistoryStackService<CanvasSnapshot>({
      getSnapshot: () => this.getSnapshot(pixelCanvas),
      applySnapshot: (snapshot) => {
        pixelCanvas.renderer.putImageData(cloneImageData(snapshot), 0, 0);
      },
      isEqual: imageDataEquals,
    });
    this.unsubscribeHistory = this.history.subscribe((state) => this.emit(state));
    this.installPlugin(pixelCanvas);
  }

  reset() {
    this.history?.reset();
  }

  undo() {
    return this.history?.undo() ?? false;
  }

  redo() {
    return this.history?.redo() ?? false;
  }

  runTransaction<T>(operation: () => T): T {
    const history = this.history;
    if (!history) {
      return operation();
    }

    return history.runTransaction(operation);
  }

  beginTransaction() {
    this.history?.beginTransaction();
  }

  commitTransaction() {
    this.history?.commitTransaction();
  }

  cancelTransaction() {
    this.history?.cancelTransaction();
  }

  runAsyncTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const history = this.history;
    if (!history) {
      return operation();
    }

    return history.runAsyncTransaction(operation);
  }

  import(data: string, options: PixelCanvasImportOptions = {}) {
    const pixelCanvas = this.pixelCanvas;
    if (!pixelCanvas) {
      return Promise.resolve();
    }

    return this.runAsyncTransaction(async () => {
      await this.callUntrackedImport(data, options);
    });
  }

  replaceWithImport(data: string, options: PixelCanvasImportOptions = {}) {
    const pixelCanvas = this.pixelCanvas;
    const plugin = this.plugin;
    if (!pixelCanvas || !plugin) {
      return this.import(data, options);
    }

    return this.runAsyncTransaction(async () => {
      plugin.clear();
      await this.callUntrackedImport(data, options);
    });
  }

  importWithPalette(
    data: string,
    palette: Palette,
    options: PixelCanvasImportOptions = {},
  ) {
    const pixelCanvas = this.pixelCanvas;
    const plugin = this.plugin;
    if (!pixelCanvas || !plugin) {
      return Promise.resolve();
    }

    return this.runAsyncTransaction(async () => {
      plugin.setPalette(palette, { remap: false });
      await this.callUntrackedImport(data, options);
    });
  }

  private getSnapshot(pixelCanvas: PixelCanvas) {
    const { canvas } = pixelCanvas.renderer;
    return cloneImageData(
      pixelCanvas.renderer.getImageData(0, 0, canvas.width, canvas.height),
    );
  }

  private installPlugin(pixelCanvas: PixelCanvas) {
    const clear = pixelCanvas.clear.bind(pixelCanvas);
    const fill = pixelCanvas.fill.bind(pixelCanvas);
    const importImage = pixelCanvas.import.bind(pixelCanvas);
    const setPalette = pixelCanvas.setPalette.bind(pixelCanvas);

    this.restoreImport = importImage;
    this.plugin = {
      clear,
      fill,
      import: importImage,
      setPalette,
    };

    pixelCanvas.clear = () => this.runTransaction(clear);
    pixelCanvas.fill = (x, y) => this.runTransaction(() => fill(x, y));
    pixelCanvas.setPalette = (palette, options) =>
      this.runTransaction(() => setPalette(palette, options));
    pixelCanvas.import = (data, options) => this.import(data, options);
  }

  private uninstallPlugin() {
    this.unsubscribeHistory?.();
    this.unsubscribeHistory = null;

    if (!this.pixelCanvas || !this.plugin) {
      return;
    }

    this.pixelCanvas.clear = this.plugin.clear;
    this.pixelCanvas.fill = this.plugin.fill;
    this.pixelCanvas.import = this.plugin.import;
    this.pixelCanvas.setPalette = this.plugin.setPalette;
    this.plugin = null;
    this.restoreImport = null;
  }

  private callUntrackedImport(data: string, options: PixelCanvasImportOptions) {
    const importImage = this.restoreImport ?? this.plugin?.import;
    if (!importImage) {
      return Promise.reject(new Error("Canvas import plugin is not installed"));
    }

    return importImage(data, options);
  }

  private emit(state: HistoryStackState) {
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

export const canvasHistory = new CanvasHistoryService();
