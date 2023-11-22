import { DndContext, useSensor, MouseSensor } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

import PixelCanvasRenderer from "./components/core/Canvas";
import Desktop from "./components/core/Desktop";
import Menubar from "./components/core/Menubar";
import Tools from "./components/core/Tools";
import Window from "./components/Window";
import { AboutWindow } from "./components/windows/about-window";
import { useWindowStore } from "./stores/windowStore";

function App() {
  const { moveWindow } = useWindowStore();
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  return (
    <DndContext
      sensors={[mouseSensor]}
      modifiers={[restrictToParentElement]}
      onDragEnd={({ delta, active: { id } }) => {
        moveWindow(id as string, delta);
      }}
    >
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
    </DndContext>
  );
}

export default App;
