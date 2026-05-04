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

export interface Point {
  x: number;
  y: number;
}

export interface CanvasPointInput {
  canvasWidth: number;
  canvasHeight: number;
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  clientX: number;
  clientY: number;
}

export interface DragPositionInput {
  startPosition: Point;
  startPointer: Point;
  currentPointer: Point;
  scale: number;
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

export function calculateScaledDelta(delta: Point, scale: number): Point {
  return {
    x: delta.x / scale,
    y: delta.y / scale,
  };
}

export function calculateDragPosition({
  startPosition,
  startPointer,
  currentPointer,
  scale,
}: DragPositionInput): Point {
  const delta = calculateScaledDelta(
    {
      x: currentPointer.x - startPointer.x,
      y: currentPointer.y - startPointer.y,
    },
    scale
  );

  return {
    x: startPosition.x + delta.x,
    y: startPosition.y + delta.y,
  };
}

export function calculateCanvasPoint({
  canvasWidth,
  canvasHeight,
  rect,
  clientX,
  clientY,
}: CanvasPointInput): Point {
  const scaleX = canvasWidth / rect.width;
  const scaleY = canvasHeight / rect.height;

  return {
    x: Math.round((clientX - rect.left) * scaleX),
    y: Math.round((clientY - rect.top) * scaleY),
  };
}
