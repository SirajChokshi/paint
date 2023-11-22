interface ImportEventData {
  type: "import";
  payload: {
    url: string;
  };
}

class FrameBusImpl {
  constructor() {
    window.addEventListener("message", function (event) {
      if (event.data.type === "import") {
        const { url } = event.data.payload as ImportEventData["payload"];
        window.pixel.import(url);
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
