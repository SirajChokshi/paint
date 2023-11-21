import PixelCanvasRenderer from "./components/core/Canvas";
import Desktop from "./components/core/Desktop";
import Menubar from "./components/core/Menubar";
import Tools from "./components/core/Tools";
import Window from "./components/Window";
import { AboutWindow } from "./components/windows/about-window";

function App() {
  return (
    <>
      <Menubar />
      <main>
        <Desktop />
        <Window title="Tools">
          <Tools />
        </Window>
        <Window title="Untitled">
          <PixelCanvasRenderer />
        </Window>
        <AboutWindow />
      </main>
    </>
  );
}

export default App;
