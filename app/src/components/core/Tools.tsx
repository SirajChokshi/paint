import styled from "@emotion/styled";
import { useEffect, useState } from "react";

type DrawMode = "line" | "fill";

const ToolGrid = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--mac-white);
  border-bottom: 1px solid var(--mac-black);
`;

const ToolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--mac-white);
`;

const ToolButton = styled.button<{ isActive?: boolean }>`
  all: unset;
  box-sizing: border-box;
  width: 52px;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: default;
  position: relative;
  gap: 3px;
  border-right: 1px solid var(--mac-black);
  border-bottom: 1px solid var(--mac-black);

  &:nth-of-type(2n) {
    border-right: none;
  }
  &:nth-of-type(n + 3) {
    border-bottom: none;
  }

  /* Dithered checkerboard pattern for selected state */
  background: ${({ isActive }) =>
    isActive
      ? `url("data:image/svg+xml,%3Csvg width='2' height='2' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23000'/%3E%3Crect x='1' y='1' width='1' height='1' fill='%23000'/%3E%3C/svg%3E")`
      : "var(--mac-white)"};
  background-size: 2px 2px;
  image-rendering: pixelated;

  color: var(--mac-black);

  &:active {
    background: var(--mac-black);
    color: var(--mac-white);
  }
`;

const ToolIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
`;

const ToolLabel = styled.span`
  font-family: var(--chicago);
  font-size: 9px;
  line-height: 1;
`;

const PencilIcon = () => (
  <ToolIcon>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      shapeRendering="crispEdges"
    >
      <rect x="12" y="1" width="1" height="1" fill="black" />
      <rect x="11" y="2" width="1" height="1" fill="black" />
      <rect x="10" y="3" width="1" height="1" fill="black" />
      <rect x="9" y="4" width="1" height="1" fill="black" />
      <rect x="8" y="5" width="1" height="1" fill="black" />
      <rect x="7" y="6" width="1" height="1" fill="black" />
      <rect x="6" y="7" width="1" height="1" fill="black" />
      <rect x="5" y="8" width="1" height="1" fill="black" />
      <rect x="4" y="9" width="1" height="1" fill="black" />
      <rect x="3" y="10" width="1" height="1" fill="black" />
      <rect x="2" y="11" width="2" height="1" fill="black" />
      <rect x="1" y="12" width="2" height="1" fill="black" />
      <rect x="1" y="13" width="1" height="1" fill="black" />
      <rect x="13" y="1" width="1" height="2" fill="black" />
      <rect x="12" y="2" width="1" height="2" fill="black" />
      <rect x="11" y="3" width="1" height="2" fill="black" />
      <rect x="10" y="4" width="1" height="2" fill="black" />
      <rect x="9" y="5" width="1" height="2" fill="black" />
      <rect x="8" y="6" width="1" height="2" fill="black" />
      <rect x="7" y="7" width="1" height="2" fill="black" />
      <rect x="6" y="8" width="1" height="2" fill="black" />
      <rect x="5" y="9" width="1" height="2" fill="black" />
      <rect x="4" y="10" width="1" height="1" fill="black" />
    </svg>
  </ToolIcon>
);

const LineIcon = () => (
  <ToolIcon>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      shapeRendering="crispEdges"
    >
      <rect x="2" y="13" width="2" height="2" fill="black" />
      <rect x="4" y="11" width="2" height="2" fill="black" />
      <rect x="6" y="9" width="2" height="2" fill="black" />
      <rect x="8" y="7" width="2" height="2" fill="black" />
      <rect x="10" y="5" width="2" height="2" fill="black" />
      <rect x="12" y="3" width="2" height="2" fill="black" />
    </svg>
  </ToolIcon>
);

const FillIcon = () => (
  <ToolIcon>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      shapeRendering="crispEdges"
    >
      <rect x="7" y="1" width="1" height="1" fill="black" />
      <rect x="6" y="2" width="1" height="1" fill="black" />
      <rect x="5" y="3" width="1" height="2" fill="black" />
      <rect x="4" y="5" width="1" height="2" fill="black" />
      <rect x="3" y="7" width="1" height="2" fill="black" />
      <rect x="4" y="9" width="1" height="1" fill="black" />
      <rect x="5" y="10" width="1" height="1" fill="black" />
      <rect x="6" y="11" width="3" height="1" fill="black" />
      <rect x="9" y="10" width="1" height="1" fill="black" />
      <rect x="10" y="9" width="1" height="1" fill="black" />
      <rect x="11" y="7" width="1" height="2" fill="black" />
      <rect x="10" y="5" width="1" height="2" fill="black" />
      <rect x="9" y="3" width="1" height="2" fill="black" />
      <rect x="8" y="2" width="1" height="1" fill="black" />
      {/* drip */}
      <rect x="7" y="12" width="1" height="1" fill="black" />
      <rect x="7" y="13" width="1" height="1" fill="black" />
      <rect x="7" y="14" width="1" height="1" fill="black" />
    </svg>
  </ToolIcon>
);

const EraseIcon = () => (
  <ToolIcon>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      shapeRendering="crispEdges"
    >
      <rect x="2" y="6" width="12" height="6" fill="black" />
      <rect x="3" y="7" width="10" height="4" fill="white" />
      <rect x="2" y="12" width="12" height="1" fill="black" />
    </svg>
  </ToolIcon>
);

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

const ColorSwatch = styled.button<{
  swatchColor: string;
  isSelected?: boolean;
}>`
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
          <PencilIcon />
          <ToolLabel>Pencil</ToolLabel>
        </ToolButton>
        <ToolButton
          isActive={mode === "line"}
          onClick={() => setMode("line")}
          title="Line"
        >
          <LineIcon />
          <ToolLabel>Line</ToolLabel>
        </ToolButton>
        <ToolButton
          isActive={mode === "fill"}
          onClick={() => setMode("fill")}
          title="Fill"
        >
          <FillIcon />
          <ToolLabel>Fill</ToolLabel>
        </ToolButton>
        <ToolButton
          isActive={mode === "line"}
          onClick={() => {
            setMode("line");
            setColor("#ffffff");
          }}
          title="Eraser"
        >
          <EraseIcon />
          <ToolLabel>Erase</ToolLabel>
        </ToolButton>
      </ToolSection>
      <FgBgSection>
        <FgBgPreview>
          <FgBox color={currentColor} />
          <BgBox />
        </FgBgPreview>
      </FgBgSection>
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
