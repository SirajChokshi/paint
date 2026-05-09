export const VIRTUAL_SCREEN_WIDTH = 640;
export const VIRTUAL_SCREEN_HEIGHT = 480;

/** Logical size passed to `VirtualScreen` in `App.tsx` (404 embed should match). */
export const PAINT_APP_VIRTUAL_SCREEN_WIDTH = 512;
export const PAINT_APP_VIRTUAL_SCREEN_HEIGHT = 342;

/** Brush grid for `PixelCanvas` in `Canvas.tsx`. */
export const PAINT_APP_CANVAS_PIXEL_SIZE = 5;

/** Bitmap size of the Untitled canvas (`Canvas.tsx`). Keep 404 import assets in sync. */
export function getPaintAppCanvasPixelSize(
  screenWidth = PAINT_APP_VIRTUAL_SCREEN_WIDTH,
  screenHeight = PAINT_APP_VIRTUAL_SCREEN_HEIGHT,
) {
  const maxWidthFromWidth = screenWidth - 155;
  const maxWidthFromHeight = ((screenHeight - 42) * 3) / 2;
  const width = Math.max(
    100,
    Math.floor(Math.min(maxWidthFromWidth, maxWidthFromHeight)),
  );
  return { width, height: Math.floor((width * 2) / 3) };
}

export interface VirtualScreenLayoutInput {
  viewportWidth: number;
  viewportHeight: number;
  viewportOffsetX?: number;
  viewportOffsetY?: number;
  width?: number;
  height?: number;
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

/** Uniform scale that fits logical size inside the viewport (CSS object-fit: contain). */
export function calculateVirtualScreenFitScale(
  viewportWidth: number,
  viewportHeight: number,
  width: number,
  height: number
): number {
  return Math.min(viewportWidth / width, viewportHeight / height);
}

export function calculateVirtualScreenLayout({
  viewportWidth,
  viewportHeight,
  viewportOffsetX = 0,
  viewportOffsetY = 0,
  width = VIRTUAL_SCREEN_WIDTH,
  height = VIRTUAL_SCREEN_HEIGHT,
}: VirtualScreenLayoutInput): VirtualScreenLayout {
  const scale = calculateVirtualScreenFitScale(
    viewportWidth,
    viewportHeight,
    width,
    height
  );
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return {
    width,
    height,
    scale,
    scaledWidth,
    scaledHeight,
    offsetX: viewportOffsetX + (viewportWidth - scaledWidth) / 2,
    offsetY: viewportOffsetY + (viewportHeight - scaledHeight) / 2,
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

export function snapPointToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.floor(point.x / gridSize) * gridSize,
    y: Math.floor(point.y / gridSize) * gridSize,
  };
}

