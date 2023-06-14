import PixelCanvasRenderer from "./components/core/Canvas";
import Desktop from "./components/core/Desktop";
import Menubar from "./components/core/Menubar";
import Tools from "./components/core/Tools";
import Window from "./components/Window";

function App() {

  return (
    <>
      <Menubar />
      <main>
        <Desktop />
        <Window>
          <Tools />
        </Window>
        <Window>
          <PixelCanvasRenderer />     
        </Window>
      </main>
    </>
  );
}

export default App;
