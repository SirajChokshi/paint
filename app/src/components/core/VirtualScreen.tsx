import styled from "@emotion/styled";
import { PropsWithChildren, useEffect, useLayoutEffect, useState } from "react";
import {
  VIRTUAL_SCREEN_HEIGHT,
  VIRTUAL_SCREEN_WIDTH,
  VirtualScreenLayout,
  calculateVirtualScreenLayout,
} from "../../lib/virtualScreen";

const Shell = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 45%, #343434 0, #181818 58%, #050505 100%);
  padding: 16px;
`;

const Monitor = styled.div<{
  scaledWidth: number;
  scaledHeight: number;
}>`
  width: ${({ scaledWidth }) => scaledWidth + 56}px;
  height: ${({ scaledHeight }) => scaledHeight + 64}px;
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

const ScreenFrame = styled.div<{
  scaledWidth: number;
  scaledHeight: number;
}>`
  width: ${({ scaledWidth }) => scaledWidth}px;
  height: ${({ scaledHeight }) => scaledHeight}px;
  overflow: hidden;
  border: 2px solid #101010;
  background: var(--mac-black);
  box-shadow:
    inset 0 0 0 2px #282828,
    0 0 0 6px #655f52;
`;

const ScreenSurface = styled.div<{ scale: number }>`
  width: ${VIRTUAL_SCREEN_WIDTH}px;
  height: ${VIRTUAL_SCREEN_HEIGHT}px;
  transform: scale(${({ scale }) => scale});
  transform-origin: top left;
  overflow: hidden;
  background: var(--mac-white);
  image-rendering: pixelated;
  image-rendering: crisp-edges;
`;

function getViewportLayout() {
  return calculateVirtualScreenLayout({
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });
}

export default function VirtualScreen({ children }: PropsWithChildren) {
  const [layout, setLayout] = useState<VirtualScreenLayout>(getViewportLayout);

  useLayoutEffect(() => {
    window.virtualScreenScale = layout.scale;
    window.virtualScreenWidth = layout.width;
    window.virtualScreenHeight = layout.height;
  }, [layout.height, layout.scale, layout.width]);

  useEffect(() => {
    function updateLayout() {
      setLayout(getViewportLayout());
    }

    window.addEventListener("resize", updateLayout);

    return () => {
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--virtual-screen-scale",
      String(layout.scale)
    );

    return () => {
      document.documentElement.style.removeProperty("--virtual-screen-scale");
    };
  }, [layout.scale]);

  return (
    <Shell>
      <Monitor
        scaledWidth={layout.scaledWidth}
        scaledHeight={layout.scaledHeight}
      >
        <ScreenFrame
          scaledWidth={layout.scaledWidth}
          scaledHeight={layout.scaledHeight}
        >
          <ScreenSurface id="virtual-screen" scale={layout.scale}>
            {children}
          </ScreenSurface>
        </ScreenFrame>
      </Monitor>
    </Shell>
  );
}
