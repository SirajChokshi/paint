export const CANVAS_COMPUTER_WIDTH = 512;
export const CANVAS_COMPUTER_HEIGHT = 342;
export const MENUBAR_HEIGHT = 21;
export const WINDOW_TITLEBAR_HEIGHT = 20;
export const MACINTOSH_CHROME_PALETTE = ["#000000", "#ffffff"] as const;
export const SCREEN_WINDOW_MARGIN = 4;
export const SCREEN_WINDOW_BOTTOM_MARGIN = 24;
export const TOOL_PALETTE_COLUMNS = 4;
export const TOOL_PALETTE_SWATCH_SIZE = 18;
export const TOOL_PALETTE_OFFSET = {
  x: 17,
  y: 147,
} as const;
const MONITOR_EXTRA_WIDTH = 88;
const MONITOR_EXTRA_HEIGHT = 96;
export const INDEXED_16_COLOR_PALETTE = [
  "#000000",
  "#333333",
  "#777777",
  "#ffffff",
  "#880000",
  "#cc0000",
  "#cc6600",
  "#aa9900",
  "#006600",
  "#00aa00",
  "#006666",
  "#00aaaa",
  "#003366",
  "#0088ff",
  "#663300",
  "#aa00aa",
] as const;

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

export interface CanvasComputerLayoutInput {
  viewportWidth: number;
  viewportHeight: number;
}

export interface CanvasComputerLayout {
  scale: number;
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
  windowSize?: {
    width: number;
    height: number;
  };
}

export interface PaletteHitInput {
  point: Point;
  windowPosition: Point;
  colorCount: number;
}

const MENU_RECTS: Array<{ id: MenuId; x: number; width: number }> = [
  { id: "file", x: 34, width: 34 },
  { id: "edit", x: 68, width: 38 },
  { id: "view", x: 106, width: 42 },
];

export function calculateCanvasComputerLayout({
  viewportWidth,
  viewportHeight,
}: CanvasComputerLayoutInput): CanvasComputerLayout {
  const scale = Math.max(
    1,
    Math.floor(
      Math.min(
        (viewportWidth - MONITOR_EXTRA_WIDTH) / CANVAS_COMPUTER_WIDTH,
        (viewportHeight - MONITOR_EXTRA_HEIGHT) / CANVAS_COMPUTER_HEIGHT
      )
    )
  );

  return {
    scale,
    width: CANVAS_COMPUTER_WIDTH * scale,
    height: CANVAS_COMPUTER_HEIGHT * scale,
  };
}

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
  windowSize,
}: MoveWindowInput): Point {
  const next = {
    x: startWindow.x + currentPointer.x - startPointer.x,
    y: startWindow.y + currentPointer.y - startPointer.y,
  };

  if (!windowSize) return next;

  return clampWindowPosition({ position: next, size: windowSize });
}

export function clampWindowPosition({
  position,
  size,
}: {
  position: Point;
  size: { width: number; height: number };
}): Point {
  return {
    x: Math.max(
      SCREEN_WINDOW_MARGIN,
      Math.min(CANVAS_COMPUTER_WIDTH - size.width - SCREEN_WINDOW_MARGIN, position.x)
    ),
    y: Math.max(
      MENUBAR_HEIGHT + SCREEN_WINDOW_MARGIN,
      Math.min(
        CANVAS_COMPUTER_HEIGHT - size.height - SCREEN_WINDOW_BOTTOM_MARGIN,
        position.y
      )
    ),
  };
}

export function getPaletteIndexAtPoint({
  point,
  windowPosition,
  colorCount,
}: PaletteHitInput): number | null {
  const origin = {
    x: windowPosition.x + TOOL_PALETTE_OFFSET.x,
    y: windowPosition.y + TOOL_PALETTE_OFFSET.y,
  };
  const x = point.x - origin.x;
  const y = point.y - origin.y;
  if (x < 0 || y < 0) return null;

  const column = Math.floor(x / TOOL_PALETTE_SWATCH_SIZE);
  const row = Math.floor(y / TOOL_PALETTE_SWATCH_SIZE);
  const rows = Math.ceil(colorCount / TOOL_PALETTE_COLUMNS);
  if (column < 0 || column >= TOOL_PALETTE_COLUMNS || row < 0 || row >= rows) return null;

  const index = row * TOOL_PALETTE_COLUMNS + column;
  return index < colorCount ? index : null;
}

function parseHexChannel(value: string, start: number): number {
  return Number.parseInt(value.slice(start, start + 2), 16);
}

export function quantizeToIndexedPalette(color: string): string {
  const normalized = color.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(normalized)) {
    return "#000000";
  }

  const red = parseHexChannel(normalized, 1);
  const green = parseHexChannel(normalized, 3);
  const blue = parseHexChannel(normalized, 5);
  let nearest: string = INDEXED_16_COLOR_PALETTE[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of INDEXED_16_COLOR_PALETTE) {
    const candidateRed = parseHexChannel(candidate, 1);
    const candidateGreen = parseHexChannel(candidate, 3);
    const candidateBlue = parseHexChannel(candidate, 5);
    const distance =
      (red - candidateRed) ** 2 +
      (green - candidateGreen) ** 2 +
      (blue - candidateBlue) ** 2;

    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }

  return nearest;
}
