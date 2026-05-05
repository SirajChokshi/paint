import PixelCanvasRenderer from "./components/core/Canvas";
import Desktop from "./components/core/Desktop";
import Menubar from "./components/core/Menubar";
import Tools from "./components/core/Tools";
import VirtualScreen from "./components/core/VirtualScreen";
import Window from "./components/Window";
import { AboutWindow } from "./components/windows/about-window";

export const WINDOW_IDS = {
  tools: "tools",
  canvas: "canvas",
  about: "about",
} as const;

function App() {
  return (
    <VirtualScreen width={512} height={342}>
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
