import styled from "@emotion/styled";
import { PropsWithChildren, useEffect, useLayoutEffect, useState } from "react";
import {
  VirtualScreenLayout,
  calculateVirtualScreenLayout,
} from "../../lib/virtualScreen";

interface VirtualScreenProps extends PropsWithChildren {
  width: number;
  height: number;
}

const Shell = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #4a7dc6;
  background-image: url("/dither.png");
  background-size: 2px 2px;
  background-repeat: repeat;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
`;

const Frame = styled.div<{ layout: VirtualScreenLayout }>`
  position: absolute;
  left: ${({ layout }) => layout.offsetX}px;
  top: ${({ layout }) => layout.offsetY}px;
  width: ${({ layout }) => layout.scaledWidth}px;
  height: ${({ layout }) => layout.scaledHeight}px;
  overflow: hidden;
`;

const Surface = styled.div<{ layout: VirtualScreenLayout }>`
  width: ${({ layout }) => layout.width}px;
  height: ${({ layout }) => layout.height}px;
  position: relative;
  overflow: hidden;
  background: var(--mac-white);
  transform: scale(${({ layout }) => layout.scale});
  transform-origin: top left;
  border: 0;

  &,
  * {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: unset;
    font-smooth: never;
  }

  .window,
  [role="menu"],
  button,
  canvas {
    transform: translateZ(0);
  }
`;

function getViewportSize() {
  const viewport = window.visualViewport;
  return {
    viewportWidth: viewport?.width ?? window.innerWidth,
    viewportHeight: viewport?.height ?? window.innerHeight,
    viewportOffsetX: viewport?.offsetLeft ?? 0,
    viewportOffsetY: viewport?.offsetTop ?? 0,
  };
}

function getLayout(width: number, height: number) {
  return calculateVirtualScreenLayout({
    ...getViewportSize(),
    width,
    height,
  });
}

export default function VirtualScreen({
  children,
  width,
  height,
}: VirtualScreenProps) {
  const [layout, setLayout] = useState(() => getLayout(width, height));

  useEffect(() => {
    const viewport = window.visualViewport;

    function resize() {
      setLayout(getLayout(width, height));
    }

    resize();
    window.addEventListener("resize", resize);
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);

    return () => {
      window.removeEventListener("resize", resize);
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
    };
  }, [height, width]);

  useLayoutEffect(() => {
    window.virtualScreenScale = layout.scale;
    window.virtualScreenWidth = layout.width;
    window.virtualScreenHeight = layout.height;
  }, [layout.height, layout.scale, layout.width]);

  return (
    <Shell>
      <Frame layout={layout}>
        <Surface
          id="virtual-screen"
          layout={layout}
          style={
            {
              "--virtual-screen-width": `${layout.width}px`,
              "--virtual-screen-height": `${layout.height}px`,
              "--virtual-screen-scale": String(layout.scale),
            } as React.CSSProperties
          }
        >
          {children}
        </Surface>
      </Frame>
    </Shell>
  );
}
