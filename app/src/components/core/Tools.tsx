import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type DrawMode = "line" | "fill";

const ToolGrid = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--mac-white);
  padding: 0;
  width: 146px;
`;

const ToolSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  padding: 6px 8px;
  background: var(--mac-white);
`;

const ToolButton = styled.button<{ isActive?: boolean }>`
  all: unset;
  box-sizing: border-box;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--chicago);
  font-size: 11px;
  cursor: default;
  text-align: center;
  line-height: 1;
  margin: 1px;
  color: var(--mac-black);
  background: ${({ isActive }) => (isActive ? "#bbbbbb" : "#dddddd")};

  /* outer 1px black frame */
  outline: 1px solid var(--mac-black);

  /* 3D bevel: light top-left / dark bottom-right when raised,
     inverted when pressed */
  border-top: 2px solid ${({ isActive }) => (isActive ? "#888888" : "#ffffff")};
  border-left: 2px solid
    ${({ isActive }) => (isActive ? "#888888" : "#ffffff")};
  border-bottom: 2px solid
    ${({ isActive }) => (isActive ? "#ffffff" : "#888888")};
  border-right: 2px solid
    ${({ isActive }) => (isActive ? "#ffffff" : "#888888")};

  &:active {
    background: #aaaaaa;
    border-top-color: #888888;
    border-left-color: #888888;
    border-bottom-color: #ffffff;
    border-right-color: #ffffff;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--mac-black);
`;

const FgBgSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  background: var(--mac-white);
`;

const FgBgPreview = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
`;

const BgBox = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: var(--mac-white);
  border: 2px solid var(--mac-black);
  z-index: 1;
`;

const FgBox = styled.div<{ color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  background: ${({ color }) => color};
  border: 2px solid var(--mac-black);
  z-index: 2;
`;

const ColorSwatch = styled.button<{ swatchColor: string; isSelected?: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 22px;
  height: 22px;
  cursor: default;
  position: relative;

  /* Inset well effect */
  background: ${({ swatchColor }) => swatchColor};
  border-top: 2px solid var(--mac-darker-gray, #555);
  border-left: 2px solid var(--mac-darker-gray, #555);
  border-bottom: 2px solid var(--mac-white, #fff);
  border-right: 2px solid var(--mac-white, #fff);

  ${({ isSelected }) =>
    isSelected
      ? `
    outline: 2px solid var(--mac-black);
    outline-offset: 1px;
    z-index: 1;
  `
      : ""}

  &:active {
    border-top-color: var(--mac-white, #fff);
    border-left-color: var(--mac-white, #fff);
    border-bottom-color: var(--mac-darker-gray, #555);
    border-right-color: var(--mac-darker-gray, #555);
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 22px);
  gap: 2px;
  padding: 8px;
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
