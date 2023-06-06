import PixelCanvasRenderer from "./components/core/Canvas";
import { Background } from "./components/core/Desktop";
import Tools from "./components/core/Tools";
import Window from "./components/Window";

function App() {

  return (
    <>
      <Background />
      <Window>
        <PixelCanvasRenderer />     
      </Window>
      <Window>
        <Tools />
      </Window>
    </>
  );
}

export default App;
