import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type DrawMode = "line" | "fill";
type Tool = "pencil" | "line" | "fill" | "erase";

const TOOL_TO_MODE: Record<Tool, DrawMode> = {
  pencil: "line",
  line: "line",
  fill: "fill",
  erase: "line",
};

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

    &.color {
      border: 2px outset grey;
      position: relative;

      &[data-selected="true"] {
        border: 2px solid black;
        outline: 1px solid white;
        outline-offset: -3px;
      }
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
  const [tool, setTool] = useState<Tool>("pencil");
  const [selectedColor, setSelectedColor] = useState("#000000");

  useEffect(() => {
    window.mode = TOOL_TO_MODE[tool];
  }, [tool]);

  function setColor(color: string) {
    if (!window.pixel) return;
    window.pixel.color = color;
    setSelectedColor(color);
  }

  function selectTool(t: Tool) {
    setTool(t);
    if (t === "erase") {
      setColor("#ffffff");
    } else {
      setColor(selectedColor === "#ffffff" ? "#000000" : selectedColor);
    }
  }

  return (
    <ToolGrid>
      <button
        data-active={tool === "pencil"}
        onClick={() => selectTool("pencil")}
      >
        Pencil
      </button>
      <button
        data-active={tool === "line"}
        onClick={() => selectTool("line")}
      >
        Line
      </button>
      <button
        data-active={tool === "fill"}
        onClick={() => selectTool("fill")}
      >
        Fill
      </button>
      <button
        data-active={tool === "erase"}
        onClick={() => selectTool("erase")}
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
          data-selected={selectedColor === color && tool !== "erase"}
          onClick={() => {
            setColor(color);
            if (tool === "erase") {
              setTool("pencil");
            }
          }}
        ></button>
      ))}
    </ToolGrid>
  );
}
