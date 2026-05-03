import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type DrawMode = "line" | "fill";

const ToolGrid = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--mac-white);
  padding: 0;
  width: 106px;
`;

const ToolSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  padding: 4px;
  background: var(--mac-white);
`;

const ToolButton = styled.button<{ isActive?: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 46px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--chicago);
  font-size: 10px;
  cursor: default;
  text-align: center;
  line-height: 1;

  background: ${({ isActive }) =>
    isActive ? "var(--mac-black)" : "var(--mac-white)"};
  color: ${({ isActive }) =>
    isActive ? "var(--mac-white)" : "var(--mac-black)"};

  border: 1px solid var(--mac-black);
  margin: 1px;

  &:active {
    background: var(--mac-black);
    color: var(--mac-white);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--mac-black);
  margin: 0;
`;

const ColorSwatch = styled.button<{ swatchColor: string }>`
  all: unset;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  background: ${({ swatchColor }) => swatchColor};
  cursor: default;
  border: 1px solid var(--mac-black);

  &:active {
    border: 2px solid var(--mac-white);
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 16px);
  gap: 1px;
  padding: 6px;
  justify-content: center;
  align-items: center;
  background: var(--mac-white);
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
