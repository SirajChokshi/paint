import { importPixelImage } from "./importPixelImage";

interface ImportEventData {
  type: "import";
  payload: {
    url: string;
  };
}

/** Last URL from the parent embed; re-applied when `window.pixel` is (re)created. */
let embedImportUrl: string | null = null;
let appliedEmbedImportUrl: string | null = null;
let appliedEmbedPixel: (typeof window)["pixel"] | null = null;

function applyEmbedImport() {
  if (!embedImportUrl || !window.pixel) {
    return;
  }

  if (
    appliedEmbedImportUrl === embedImportUrl &&
    appliedEmbedPixel === window.pixel
  ) {
    return;
  }

  appliedEmbedImportUrl = embedImportUrl;
  appliedEmbedPixel = window.pixel;
  void importPixelImage(embedImportUrl);
}

function importIntoCanvas(url: string) {
  const urlChanged = embedImportUrl !== url;
  embedImportUrl = url;

  if (urlChanged) {
    appliedEmbedImportUrl = null;
    appliedEmbedPixel = null;
  }

  applyEmbedImport();
}

function onPixelReady() {
  applyEmbedImport();
}

class FrameBusImpl {
  constructor() {
    window.addEventListener("pixel-ready", onPixelReady);
    window.addEventListener("message", function (event) {
      if (event.data.type === "import") {
        const { url } = event.data.payload as ImportEventData["payload"];
        importIntoCanvas(url);
      }
    });
  }

  get top() {
    return window.top;
  }

  quit() {
    this.top?.postMessage({ type: "teardown" }, "*");
  }
}

export const FrameBus = new FrameBusImpl();
