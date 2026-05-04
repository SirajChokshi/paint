import styled from "@emotion/styled";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  VirtualScreenLayout,
  calculateVirtualScreenLayout,
} from "../../lib/virtualScreen";

interface VirtualScreenProps extends PropsWithChildren {
  width: number;
  height: number;
}

const Shell = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 16px;
  background:
    radial-gradient(circle at 50% 45%, #343434 0, #181818 58%, #050505 100%);
`;

const Monitor = styled.div<{ screenWidth: number; screenHeight: number }>`
  width: ${({ screenWidth }) => screenWidth + 56}px;
  height: ${({ screenHeight }) => screenHeight + 64}px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #050505;
  border-radius: 14px;
  background: linear-gradient(145deg, #d8d2bd, #8f8975);
  box-shadow:
    inset 3px 3px 0 rgba(255, 255, 255, 0.45),
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    0 26px 70px rgba(0, 0, 0, 0.55);
`;

const Surface = styled.div<{ layout: VirtualScreenLayout }>`
  width: ${({ layout }) => layout.width}px;
  height: ${({ layout }) => layout.height}px;
  position: relative;
  overflow: hidden;
  background: var(--mac-white);
  transform: scale(${({ layout }) => layout.scale});
  transform-origin: center;
  border: 2px solid #101010;
  box-shadow:
    inset 0 0 0 2px #282828,
    0 0 0 6px #655f52;

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

function getLayout(width: number, height: number) {
  return calculateVirtualScreenLayout({
    viewportWidth: window.innerWidth - 88,
    viewportHeight: window.innerHeight - 96,
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
    function resize() {
      setLayout(getLayout(width, height));
    }

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [height, width]);

  useEffect(() => {
    window.virtualScreenScale = layout.scale;
    window.virtualScreenWidth = layout.width;
    window.virtualScreenHeight = layout.height;
  }, [layout.height, layout.scale, layout.width]);

  return (
    <Shell>
      <Monitor screenWidth={layout.scaledWidth} screenHeight={layout.scaledHeight}>
        <Surface
          id="virtual-screen"
          layout={layout}
          style={{
            "--virtual-screen-width": `${layout.width}px`,
            "--virtual-screen-height": `${layout.height}px`,
            "--virtual-screen-scale": String(layout.scale),
          } as React.CSSProperties}
        >
          {children}
        </Surface>
      </Monitor>
    </Shell>
  );
}
