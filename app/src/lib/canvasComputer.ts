export const CANVAS_COMPUTER_WIDTH = 640;
export const CANVAS_COMPUTER_HEIGHT = 480;
export const MENUBAR_HEIGHT = 21;
export const WINDOW_TITLEBAR_HEIGHT = 20;

export type MenuId = "file" | "edit" | "view";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CanvasWindow {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
}

export interface MoveWindowInput {
  startWindow: Point;
  startPointer: Point;
  currentPointer: Point;
}

const MENU_RECTS: Array<{ id: MenuId; x: number; width: number }> = [
  { id: "file", x: 34, width: 34 },
  { id: "edit", x: 68, width: 38 },
  { id: "view", x: 106, width: 42 },
];

export function screenPointToCanvasPoint({
  clientX,
  clientY,
  rect,
}: {
  clientX: number;
  clientY: number;
  rect: Rect;
}): Point {
  return {
    x: Math.round(((clientX - rect.left) / rect.width) * CANVAS_COMPUTER_WIDTH),
    y: Math.round(((clientY - rect.top) / rect.height) * CANVAS_COMPUTER_HEIGHT),
  };
}

export function getMenuAtPoint(point: Point): MenuId | null {
  if (point.y < 0 || point.y >= MENUBAR_HEIGHT) return null;

  return (
    MENU_RECTS.find((menu) => point.x >= menu.x && point.x < menu.x + menu.width)
      ?.id ?? null
  );
}

export function getWindowDragHandle(
  point: Point,
  windows: CanvasWindow[]
): string | null {
  for (const window of windows.toReversed()) {
    const insideTitlebar =
      point.x >= window.x &&
      point.x < window.x + window.width &&
      point.y >= window.y &&
      point.y < window.y + WINDOW_TITLEBAR_HEIGHT;

    if (insideTitlebar) {
      return window.id;
    }
  }

  return null;
}

export function moveWindowByPointer({
  startWindow,
  startPointer,
  currentPointer,
}: MoveWindowInput): Point {
  return {
    x: startWindow.x + currentPointer.x - startPointer.x,
    y: startWindow.y + currentPointer.y - startPointer.y,
  };
}
