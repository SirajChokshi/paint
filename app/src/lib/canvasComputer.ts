export const CANVAS_COMPUTER_WIDTH = 640;
export const CANVAS_COMPUTER_HEIGHT = 480;
export const MENUBAR_HEIGHT = 21;
export const WINDOW_TITLEBAR_HEIGHT = 20;
export const MACINTOSH_CHROME_PALETTE = ["#000000", "#ffffff"] as const;
export const INDEXED_128_COLOR_PALETTE = [
  "#000000",
  "#000024",
  "#000049",
  "#00006d",
  "#000092",
  "#0000b6",
  "#0000db",
  "#0000ff",
  "#005500",
  "#005524",
  "#005549",
  "#00556d",
  "#005592",
  "#0055b6",
  "#0055db",
  "#0055ff",
  "#00aa00",
  "#00aa24",
  "#00aa49",
  "#00aa6d",
  "#00aa92",
  "#00aab6",
  "#00aadb",
  "#00aaff",
  "#00ff00",
  "#00ff24",
  "#00ff49",
  "#00ff6d",
  "#00ff92",
  "#00ffb6",
  "#00ffdb",
  "#00ffff",
  "#550000",
  "#550024",
  "#550049",
  "#55006d",
  "#550092",
  "#5500b6",
  "#5500db",
  "#5500ff",
  "#555500",
  "#555524",
  "#555549",
  "#55556d",
  "#555592",
  "#5555b6",
  "#5555db",
  "#5555ff",
  "#55aa00",
  "#55aa24",
  "#55aa49",
  "#55aa6d",
  "#55aa92",
  "#55aab6",
  "#55aadb",
  "#55aaff",
  "#55ff00",
  "#55ff24",
  "#55ff49",
  "#55ff6d",
  "#55ff92",
  "#55ffb6",
  "#55ffdb",
  "#55ffff",
  "#aa0000",
  "#aa0024",
  "#aa0049",
  "#aa006d",
  "#aa0092",
  "#aa00b6",
  "#aa00db",
  "#aa00ff",
  "#aa5500",
  "#aa5524",
  "#aa5549",
  "#aa556d",
  "#aa5592",
  "#aa55b6",
  "#aa55db",
  "#aa55ff",
  "#aaaa00",
  "#aaaa24",
  "#aaaa49",
  "#aaaa6d",
  "#aaaa92",
  "#aaaab6",
  "#aaaadb",
  "#aaaaff",
  "#aaff00",
  "#aaff24",
  "#aaff49",
  "#aaff6d",
  "#aaff92",
  "#aaffb6",
  "#aaffdb",
  "#aaffff",
  "#ff0000",
  "#ff0024",
  "#ff0049",
  "#ff006d",
  "#ff0092",
  "#ff00b6",
  "#ff00db",
  "#ff00ff",
  "#ff5500",
  "#ff5524",
  "#ff5549",
  "#ff556d",
  "#ff5592",
  "#ff55b6",
  "#ff55db",
  "#ff55ff",
  "#ffaa00",
  "#ffaa24",
  "#ffaa49",
  "#ffaa6d",
  "#ffaa92",
  "#ffaab6",
  "#ffaadb",
  "#ffaaff",
  "#ffff00",
  "#ffff24",
  "#ffff49",
  "#ffff6d",
  "#ffff92",
  "#ffffb6",
  "#ffffdb",
  "#ffffff",
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
        viewportWidth / CANVAS_COMPUTER_WIDTH,
        viewportHeight / CANVAS_COMPUTER_HEIGHT
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
}: MoveWindowInput): Point {
  return {
    x: startWindow.x + currentPointer.x - startPointer.x,
    y: startWindow.y + currentPointer.y - startPointer.y,
  };
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
  let nearest: string = INDEXED_128_COLOR_PALETTE[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of INDEXED_128_COLOR_PALETTE) {
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
