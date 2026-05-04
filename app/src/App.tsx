import CanvasComputer from "./components/core/CanvasComputer";

export const WINDOW_IDS = {
  tools: "tools",
  canvas: "canvas",
  about: "about",
} as const;

function App() {
  return <CanvasComputer />;
}

export default App;
