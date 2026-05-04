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

export interface VirtualPointerInput {
  clientX: number;
  clientY: number;
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
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

export function mapViewportPointToVirtualScreen({
  clientX,
  clientY,
  rect,
}: VirtualPointerInput): Point {
  return {
    x: Math.round(((clientX - rect.left) / rect.width) * VIRTUAL_SCREEN_WIDTH),
    y: Math.round(((clientY - rect.top) / rect.height) * VIRTUAL_SCREEN_HEIGHT),
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

export function pointsBetween(from: Point, to: Point, gridSize: number): Point[] {
  const x1 = Math.floor(from.x / gridSize);
  const y1 = Math.floor(from.y / gridSize);
  const x2 = Math.floor(to.x / gridSize);
  const y2 = Math.floor(to.y / gridSize);
  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  let x = x1;
  let y = y1;
  let error = dx + dy;
  const points: Point[] = [];

  while (true) {
    points.push({ x: x * gridSize, y: y * gridSize });

    if (x === x2 && y === y2) {
      return points;
    }

    const nextError = error * 2;
    if (nextError >= dy) {
      error += dy;
      x += sx;
    }
    if (nextError <= dx) {
      error += dx;
      y += sy;
    }
  }
}
