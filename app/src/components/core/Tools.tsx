import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type DrawMode = "line" | "fill";

const ToolGrid = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--mac-light-gray);
  padding: 0;
  width: 108px;
`;

const ToolSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 6px;
  background: var(--mac-light-gray);
`;

const ToolButton = styled.button<{ isActive?: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 44px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--chicago);
  font-size: 10px;
  cursor: default;
  text-align: center;
  line-height: 1;

  background: ${({ isActive }) =>
    isActive ? "var(--mac-dark-gray)" : "var(--mac-light-gray)"};
  color: ${({ isActive }) =>
    isActive ? "var(--mac-white)" : "var(--mac-black)"};

  /* Classic Mac 3D bevel */
  border-top: 2px solid
    ${({ isActive }) =>
      isActive ? "var(--mac-darker-gray)" : "var(--mac-white)"};
  border-left: 2px solid
    ${({ isActive }) =>
      isActive ? "var(--mac-darker-gray)" : "var(--mac-white)"};
  border-bottom: 2px solid
    ${({ isActive }) =>
      isActive ? "var(--mac-white)" : "var(--mac-darker-gray)"};
  border-right: 2px solid
    ${({ isActive }) =>
      isActive ? "var(--mac-white)" : "var(--mac-darker-gray)"};

  &:active {
    background: var(--mac-dark-gray);
    color: var(--mac-white);
    border-top-color: var(--mac-darker-gray);
    border-left-color: var(--mac-darker-gray);
    border-bottom-color: var(--mac-white);
    border-right-color: var(--mac-white);
  }
`;

const Divider = styled.div`
  height: 2px;
  background: var(--mac-dark-gray);
  margin: 0 4px;
  box-shadow: 0 1px 0 var(--mac-white);
`;

const ColorSwatch = styled.button<{ swatchColor: string }>`
  all: unset;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  background: ${({ swatchColor }) => swatchColor};
  cursor: default;

  /* Inset well */
  border-top: 2px solid var(--mac-darker-gray);
  border-left: 2px solid var(--mac-darker-gray);
  border-bottom: 2px solid var(--mac-white);
  border-right: 2px solid var(--mac-white);

  &:active {
    border-top-color: var(--mac-white);
    border-left-color: var(--mac-white);
    border-bottom-color: var(--mac-darker-gray);
    border-right-color: var(--mac-darker-gray);
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 18px);
  gap: 2px;
  padding: 6px;
  justify-content: center;
  background: var(--mac-light-gray);
`;

const COLORS = [
  "#000000",
  "#808080",
  "#c0c0c0",
  "#ffffff",
  "#ff0000",
  "#ff8200",
  "#ffff00",
  "#00ff00",
  "#008040",
  "#00ffff",
  "#0000ff",
  "#c000c0",
  "#c04020",
  "#806000",
  "#ffc080",
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
      <ToolSection>
        <ToolButton
          isActive={mode === "line"}
          onClick={() => {
            setMode("line");
            setColor("#000000");
          }}
          title="Pencil"
        >
          Pencil
        </ToolButton>
        <ToolButton
          isActive={mode === "line"}
          onClick={() => setMode("line")}
          title="Line"
        >
          Line
        </ToolButton>
        <ToolButton
          isActive={mode === "fill"}
          onClick={() => setMode("fill")}
          title="Fill"
        >
          Fill
        </ToolButton>
        <ToolButton
          isActive={mode === "line"}
          onClick={() => {
            setMode("line");
            setColor("#ffffff");
          }}
          title="Eraser"
        >
          Erase
        </ToolButton>
      </ToolSection>
      <Divider />
      <ColorGrid>
        {COLORS.map((color) => (
          <ColorSwatch
            key={color}
            swatchColor={color}
            aria-label={`Set drawing color to ${color}`}
            title={color}
            onClick={() => setColor(color)}
          />
        ))}
      </ColorGrid>
    </ToolGrid>
  );
}
