export const VIRTUAL_SCREEN_WIDTH = 640;
export const VIRTUAL_SCREEN_HEIGHT = 480;

export interface VirtualScreenLayoutInput {
  viewportWidth: number;
  viewportHeight: number;
}

export interface VirtualScreenLayout {
  width: number;
  height: number;
  scale: number;
  scaledWidth: number;
  scaledHeight: number;
  offsetX: number;
  offsetY: number;
}

export function calculateVirtualScreenLayout({
  viewportWidth,
  viewportHeight,
}: VirtualScreenLayoutInput): VirtualScreenLayout {
  const scale = Math.max(
    1,
    Math.floor(
      Math.min(
        viewportWidth / VIRTUAL_SCREEN_WIDTH,
        viewportHeight / VIRTUAL_SCREEN_HEIGHT
      )
    )
  );
  const scaledWidth = VIRTUAL_SCREEN_WIDTH * scale;
  const scaledHeight = VIRTUAL_SCREEN_HEIGHT * scale;

  return {
    width: VIRTUAL_SCREEN_WIDTH,
    height: VIRTUAL_SCREEN_HEIGHT,
    scale,
    scaledWidth,
    scaledHeight,
    offsetX: Math.floor((viewportWidth - scaledWidth) / 2),
    offsetY: Math.floor((viewportHeight - scaledHeight) / 2),
  };
}
