class FrameBusImpl {
  get top() {
    return window.top;
  }

  quit() {
    this.top?.postMessage({ type: "teardown" }, "*");
  }
}

export const FrameBus = new FrameBusImpl();
