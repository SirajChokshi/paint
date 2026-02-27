import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type DrawMode = "line" | "fill";

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  gap: 0.25rem;
  padding: 0.25rem;

  button {
    aspect-ratio: 1;
    border: 2px outset grey;
    background: lightgrey;

    &:active {
      border: 2px inset grey;
      filter: brightness(0.85);
    }

    &[data-active="true"] {
      border: 2px inset grey;
      filter: brightness(0.85);
    }
  }
`;

const COLORS = [
  "#ff0000",
  "#ff8200",
  "#fffb00",
  "#00fb00",
  "#008242",
  "#00fbff",
  "#0000ff",
  "#c64121",
  "#846100",
  "#ffc384",
  "#c600c6",
  "#000000",
  "#848284",
  "#c6c3c6",
  "#fffbff",
];

export default function Tools() {
  const [mode, setMode] = useState<DrawMode>(window.mode ?? "line");

  useEffect(() => {
    window.mode = mode;
  }, [mode]);

  function setColor(color: string) {
    if (!window.pixel) return;
    window.pixel.color = color;
  }

  return (
    <ToolGrid>
      <button
        data-active={mode === "line"}
        onClick={() => {
          setMode("line");
          setColor("#000000");
        }}
      >
        Pencil
      </button>
      <button data-active={mode === "line"} onClick={() => setMode("line")}>
        Line
      </button>
      <button data-active={mode === "fill"} onClick={() => setMode("fill")}>
        Fill
      </button>
      <button
        data-active={mode === "line"}
        onClick={() => {
          setMode("line");
          setColor("#ffffff");
        }}
      >
        Erase
      </button>
      {COLORS.map((color) => (
        <button
          key={color}
          className="color"
          style={{ background: color }}
          aria-label={`Set drawing color to ${color}`}
          title={color}
          onClick={() => setColor(color)}
        ></button>
      ))}
    </ToolGrid>
  );
}
