import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type DrawMode = "line" | "fill";

const ToolGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--mac-white);
`;

const ToolSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  padding: 4px;
  border-bottom: 1px solid var(--mac-black);

  &:last-child {
    border-bottom: none;
  }
`;

const ToolButton = styled.button<{ isActive?: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--chicago);
  font-size: 10px;
  cursor: default;
  text-align: center;
  line-height: 1;
  padding: 2px;

  border: 1px solid var(--mac-black);
  margin: 1px;

  background: ${({ isActive }) =>
    isActive ? "var(--mac-black)" : "var(--mac-white)"};
  color: ${({ isActive }) =>
    isActive ? "var(--mac-white)" : "var(--mac-black)"};

  box-shadow: ${({ isActive }) =>
    isActive
      ? "inset 1px 1px 0 var(--mac-shadow-dark)"
      : "inset -1px -1px 0 var(--mac-shadow-dark), inset 1px 1px 0 var(--mac-shadow-light)"};

  &:active {
    background: var(--mac-black);
    color: var(--mac-white);
    box-shadow: inset 1px 1px 0 var(--mac-shadow-dark);
  }
`;

const ColorSwatch = styled.button<{ swatchColor: string }>`
  all: unset;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  border: 1px solid var(--mac-black);
  background: ${({ swatchColor }) => swatchColor};
  cursor: default;
  margin: 1px;

  &:hover {
    outline: 1px solid var(--mac-white);
    outline-offset: -2px;
  }

  &:active {
    outline: 2px solid var(--mac-white);
    outline-offset: -3px;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  padding: 4px;
  justify-items: center;
  align-items: center;
`;

const SectionLabel = styled.div`
  grid-column: 1 / -1;
  font-family: var(--chicago);
  font-size: 9px;
  text-align: center;
  padding: 2px 0 1px;
  color: var(--mac-black);
  border-bottom: 1px dotted var(--mac-disabled);
  margin-bottom: 2px;
  width: 100%;
`;

const COLORS = [
  "#000000",
  "#848284",
  "#c6c3c6",
  "#fffbff",
  "#ff0000",
  "#ff8200",
  "#fffb00",
  "#00fb00",
  "#008242",
  "#00fbff",
  "#0000ff",
  "#c600c6",
  "#c64121",
  "#846100",
  "#ffc384",
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
          ✏️
        </ToolButton>
        <ToolButton
          isActive={mode === "line"}
          onClick={() => setMode("line")}
          title="Line"
        >
          ╱
        </ToolButton>
        <ToolButton
          isActive={mode === "fill"}
          onClick={() => setMode("fill")}
          title="Fill"
        >
          🪣
        </ToolButton>
        <ToolButton
          isActive={mode === "line"}
          onClick={() => {
            setMode("line");
            setColor("#ffffff");
          }}
          title="Eraser"
        >
          ▯
        </ToolButton>
      </ToolSection>
      <ColorGrid>
        <SectionLabel>Colors</SectionLabel>
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
