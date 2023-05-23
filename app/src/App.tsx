import PixelCanvasRenderer from "./components/Canvas";
import { Background } from "./components/Desktop";
import Window from "./components/Window";

function App() {

  return (
    <>
      <Background />
      <h1>Paint</h1>
      <Window>
        <PixelCanvasRenderer />     
      </Window>
    </>
  );
}

export default App;
