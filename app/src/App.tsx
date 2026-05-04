import { DndContext, useSensor, MouseSensor } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

import PixelCanvasRenderer from "./components/core/Canvas";
import Desktop from "./components/core/Desktop";
import Menubar from "./components/core/Menubar";
import Tools from "./components/core/Tools";
import Window from "./components/Window";
import { AboutWindow } from "./components/windows/about-window";
import { useWindowStore } from "./stores/windowStore";

export const WINDOW_IDS = {
  tools: "tools",
  canvas: "canvas",
  about: "about",
} as const;

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
        <Window
          title="Tools"
          id={WINDOW_IDS.tools}
          defaultPosition={{
            x: 15,
            y: 15,
          }}
        >
          <Tools />
        </Window>
        <Window
          title="Untitled"
          id={WINDOW_IDS.canvas}
          defaultPosition={{
            x: 180,
            y: 15,
          }}
        >
          <PixelCanvasRenderer />
        </Window>
        <AboutWindow />
      </main>
    </DndContext>
  );
}

export default App;
