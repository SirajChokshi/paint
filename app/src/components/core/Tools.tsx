import styled from "@emotion/styled";
import {
  getActivePaintPalette,
  getForegroundColor,
  usePaintStore,
} from "../../stores/paintStore";
import {
  getBackgroundCssBackground,
  isTransparentBackground,
} from "../../lib/paintColor";

const ToolGrid = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--mac-white);
  border-bottom: 1px solid var(--mac-black);
  width: 104px;
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

  /* Light dotted pattern for selected state */
  background: ${({ isActive }) =>
    isActive
      ? `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='4' height='4' fill='white'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%23000'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%23000'/%3E%3C/svg%3E")`
      : "var(--mac-white)"};
  background-size: 4px 4px;
  image-rendering: pixelated;

  color: var(--mac-black);

  &:active {
    background: #ddd;
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

const ColorWell = styled.button<{ isActive?: boolean }>`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  cursor: default;
  border: 1px solid var(--mac-black);
  image-rendering: pixelated;

  ${({ isActive }) =>
    isActive
      ? `
    outline: 2px solid var(--mac-black);
    outline-offset: -3px;
  `
      : ""}

  &:active {
    opacity: 0.85;
  }
`;

const BgBox = styled(ColorWell)<{ $background: string }>`
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: ${({ $background }) => $background};
  background-size: 8px 8px;
  z-index: 1;
`;

const FgBox = styled(ColorWell)<{ color: string }>`
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background: ${({ color }) => color};
  z-index: 2;
`;

const ColorSwatch = styled.button<{
  swatchColor: string;
  isSelected?: boolean;
}>`
  all: unset;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  cursor: default;
  position: relative;
  background: ${({ swatchColor }) => swatchColor};
  border: 1px solid var(--mac-black);

  ${({ isSelected }) =>
    isSelected
      ? `
    outline: 2px solid var(--mac-black);
    outline-offset: -3px;
  `
      : ""}

  &:active {
    opacity: 0.7;
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 20px);
  gap: 2px;
  padding: 7px;
  justify-content: center;
  background: var(--mac-white);
`;

export default function Tools() {
  const paintState = usePaintStore();
  const {
    paletteId,
    customPalette,
    foregroundColorIndex,
    backgroundColor,
    activeColorSlot,
    setActiveColorSlot,
    setBackgroundTransparent,
    setPaletteColorIndex,
    toolMode,
    setToolMode: setStoreToolMode,
  } = paintState;
  const palette = getActivePaintPalette({ paletteId, customPalette });
  const foregroundColor = getForegroundColor(paintState);

  return (
    <ToolGrid>
      <ToolSection>
        <ToolButton
          isActive={toolMode === "pencil"}
          onClick={() => setStoreToolMode("pencil")}
          title="Pencil"
        >
          <PencilIcon />
          <ToolLabel>Pencil</ToolLabel>
        </ToolButton>
        <ToolButton
          isActive={toolMode === "line"}
          onClick={() => setStoreToolMode("line")}
          title="Line"
        >
          <LineIcon />
          <ToolLabel>Line</ToolLabel>
        </ToolButton>
        <ToolButton
          isActive={toolMode === "fill"}
          onClick={() => setStoreToolMode("fill")}
          title="Fill"
        >
          <FillIcon />
          <ToolLabel>Fill</ToolLabel>
        </ToolButton>
        <ToolButton
          isActive={toolMode === "erase"}
          onClick={() => setStoreToolMode("erase")}
          title="Eraser"
        >
          <EraseIcon />
          <ToolLabel>Erase</ToolLabel>
        </ToolButton>
      </ToolSection>
      <FgBgSection>
        <FgBgPreview>
          <FgBox
            type="button"
            color={foregroundColor}
            isActive={activeColorSlot === "fg"}
            title="Foreground color"
            aria-label="Select foreground color"
            onClick={() => setActiveColorSlot("fg")}
          />
          <BgBox
            type="button"
            $background={getBackgroundCssBackground(backgroundColor)}
            isActive={activeColorSlot === "bg"}
            title={
              isTransparentBackground(backgroundColor)
                ? "Background: transparent"
                : `Background: ${backgroundColor}`
            }
            aria-label="Select background color"
            onClick={() => setActiveColorSlot("bg")}
            onDoubleClick={() => setBackgroundTransparent()}
          />
        </FgBgPreview>
      </FgBgSection>
      <ColorGrid>
        {palette.map((color, colorIndex) => (
          <ColorSwatch
            key={color}
            swatchColor={color}
            isSelected={
              activeColorSlot === "bg"
                ? backgroundColor === color
                : foregroundColorIndex === colorIndex
            }
            aria-label={
              activeColorSlot === "bg"
                ? `Set background color to ${color}`
                : `Set foreground color to ${color}`
            }
            title={color}
            onClick={() => setPaletteColorIndex(colorIndex)}
          />
        ))}
      </ColorGrid>
    </ToolGrid>
  );
}
