import { lazy, Suspense } from "react";
import PixelCanvasRenderer from "./components/core/Canvas";
import Desktop from "./components/core/Desktop";
import Menubar from "./components/core/Menubar";
import Tools from "./components/core/Tools";
import VirtualScreen from "./components/core/VirtualScreen";
import {
  PAINT_APP_VIRTUAL_SCREEN_HEIGHT,
  PAINT_APP_VIRTUAL_SCREEN_WIDTH,
} from "./lib/virtualScreen";
import { WINDOW_IDS } from "./lib/windowIds";
import Window from "./components/Window";
import { AboutWindow } from "./components/windows/about-window";

const DevImportTestPage = import.meta.env.DEV
  ? lazy(() => import("./components/dev/ImportTestPage"))
  : null;

function App() {
  if (DevImportTestPage && window.location.pathname === "/dev/import-test") {
    return (
      <Suspense fallback={null}>
        <DevImportTestPage />
      </Suspense>
    );
  }

  return (
    <VirtualScreen
      width={PAINT_APP_VIRTUAL_SCREEN_WIDTH}
      height={PAINT_APP_VIRTUAL_SCREEN_HEIGHT}
    >
      <Menubar />
      <main>
        <Desktop />
        <Window
          title="Tools"
          id={WINDOW_IDS.tools}
          defaultPosition={{
            x: 14,
            y: 12,
          }}
        >
          <Tools />
        </Window>
        <Window
          title="Untitled"
          id={WINDOW_IDS.canvas}
          defaultPosition={{
            x: 140,
            y: 12,
          }}
        >
          <PixelCanvasRenderer />
        </Window>
        <AboutWindow />
      </main>
    </VirtualScreen>
  );
}

export default App;
