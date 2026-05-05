interface ImportEventData {
  type: "import";
  payload: {
    url: string;
  };
}

let pendingEmbedImportUrl: string | null = null;

function runPendingEmbedImport() {
  if (!pendingEmbedImportUrl || !window.pixel) {
    return;
  }

  window.pixel.import(pendingEmbedImportUrl);
}

function importIntoCanvas(url: string) {
  pendingEmbedImportUrl = url;
  runPendingEmbedImport();

  if (window.pixel) {
    return;
  }

  const started = performance.now();
  const wait = window.setInterval(() => {
    runPendingEmbedImport();
    if (window.pixel) {
      window.clearInterval(wait);
      return;
    }

    if (performance.now() - started > 5000) {
      window.clearInterval(wait);
    }
  }, 16);

  const onPixelReady = () => {
    runPendingEmbedImport();
    if (window.pixel) {
      window.clearInterval(wait);
      window.removeEventListener("pixel-ready", onPixelReady);
    }
  };

  window.addEventListener("pixel-ready", onPixelReady);
}

class FrameBusImpl {
  constructor() {
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
