import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type DrawMode = "line" | "fill";

const ToolGrid = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--mac-white);
  padding: 0;
`;

const ToolSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  padding: 0;
  background: var(--mac-white);
  border-bottom: 1px solid var(--mac-black);
`;

const ToolButton = styled.button<{ isActive?: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 48px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--chicago);
  font-size: 10px;
  cursor: default;
  text-align: center;
  line-height: 1;
  border-right: 1px solid var(--mac-black);
  border-bottom: 1px solid var(--mac-black);

  background: ${({ isActive }) =>
    isActive ? "var(--mac-black)" : "var(--mac-white)"};
  color: ${({ isActive }) =>
    isActive ? "var(--mac-white)" : "var(--mac-black)"};

  &:nth-of-type(2n) {
    border-right: none;
  }

  &:nth-of-type(n + 3) {
    border-bottom: none;
  }

  &:active {
    background: var(--mac-black);
    color: var(--mac-white);
  }
`;

const Divider = styled.div`
  height: 0;
`;

const FgBgSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  background: var(--mac-white);
  border-bottom: 1px solid var(--mac-black);
`;

const FgBgPreview = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
`;

const BgBox = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: var(--mac-white);
  border: 1px solid var(--mac-black);
  z-index: 1;
`;

const FgBox = styled.div<{ color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background: ${({ color }) => color};
  border: 1px solid var(--mac-black);
  z-index: 2;
`;

const ColorSwatch = styled.button<{ swatchColor: string; isSelected?: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
  cursor: default;
  position: relative;
  background: ${({ swatchColor }) => swatchColor};
  border: 1px solid var(--mac-black);

  ${({ isSelected }) =>
    isSelected
      ? `
    border: 2px solid var(--mac-black);
    width: 18px;
    height: 18px;
  `
      : ""}

  &:active {
    opacity: 0.7;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 18px);
  gap: 0;
  padding: 6px;
  justify-content: center;
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
  const [currentColor, setCurrentColor] = useState("#000000");

  useEffect(() => {
    window.mode = mode;
  }, [mode]);

  function setColor(color: string) {
    if (!window.pixel) return;
    window.pixel.color = color;
    setCurrentColor(color);
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
      <FgBgSection>
        <FgBgPreview>
          <FgBox color={currentColor} />
          <BgBox />
        </FgBgPreview>
      </FgBgSection>
      <Divider />
      <ColorGrid>
        {COLORS.map((color) => (
          <ColorSwatch
            key={color}
            swatchColor={color}
            isSelected={currentColor === color}
            aria-label={`Set drawing color to ${color}`}
            title={color}
            onClick={() => setColor(color)}
          />
        ))}
      </ColorGrid>
    </ToolGrid>
  );
}
