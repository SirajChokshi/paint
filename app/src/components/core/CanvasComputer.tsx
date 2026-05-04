import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { drawBitmapText, measureBitmapText } from "../../lib/bitmapFont";
import {
  CANVAS_COMPUTER_HEIGHT,
  CANVAS_COMPUTER_WIDTH,
  CanvasWindow,
  INDEXED_16_COLOR_PALETTE,
  MACINTOSH_CHROME_PALETTE,
  Point,
  calculateCanvasComputerLayout,
  getMenuAtPoint,
  getWindowDragHandle,
  moveWindowByPointer,
  quantizeToIndexedPalette,
  screenPointToCanvasPoint,
} from "../../lib/canvasComputer";

type MenuId = "file" | "edit" | "view";

interface DragState {
  id: string;
  startPointer: Point;
  startWindow: Point;
}

const MENU_HEIGHT = 21;
const PAINT_CANVAS_WIDTH = 368;
const PAINT_CANVAS_HEIGHT = 238;
const PAINT_SCROLLBAR_GAP = 12;
const PALETTE_SWATCH_SIZE = 18;
const PALETTE_COLUMNS = 4;
const TOOL_COLORS = INDEXED_16_COLOR_PALETTE.map(quantizeToIndexedPalette);

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
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ screenWidth }) => screenWidth + 56}px;
  height: ${({ screenHeight }) => screenHeight + 64}px;
  border: 2px solid #050505;
  border-radius: 14px;
  background: linear-gradient(145deg, #d8d2bd, #8f8975);
  box-shadow:
    inset 3px 3px 0 rgba(255, 255, 255, 0.45),
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    0 26px 70px rgba(0, 0, 0, 0.55);
`;

const Screen = styled.canvas<{ screenWidth: number; screenHeight: number }>`
  width: ${({ screenWidth }) => screenWidth}px;
  height: ${({ screenHeight }) => screenHeight}px;
  display: block;
  border: 2px solid #101010;
  background: #ffffff;
  cursor: default;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  box-shadow:
    inset 0 0 0 2px #282828,
    0 0 0 6px #655f52;
`;

function rectContains(
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
) {
  return (
    point.x >= rect.x &&
    point.x < rect.x + rect.width &&
    point.y >= rect.y &&
    point.y < rect.y + rect.height
  );
}

function drawDither(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[1];
  ctx.fillRect(0, MENU_HEIGHT, CANVAS_COMPUTER_WIDTH, CANVAS_COMPUTER_HEIGHT);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  for (let y = MENU_HEIGHT; y < CANVAS_COMPUTER_HEIGHT; y += 2) {
    for (let x = 0; x < CANVAS_COMPUTER_WIDTH; x += 2) {
      if ((x + y) % 4 === 0) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: CanvasTextAlign = "left"
) {
  const width = measureBitmapText(text);
  const startX =
    align === "center" ? Math.round(x - width / 2) : align === "right" ? x - width : x;
  drawBitmapText(ctx, text, startX, y);
}

function strokeRect1(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.fillRect(x, y, width, 1);
  ctx.fillRect(x, y + height - 1, width, 1);
  ctx.fillRect(x, y, 1, height);
  ctx.fillRect(x + width - 1, y, 1, height);
}

function drawMenuBar(
  ctx: CanvasRenderingContext2D,
  activeMenu: MenuId | null
) {
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[1];
  ctx.fillRect(0, 0, CANVAS_COMPUTER_WIDTH, MENU_HEIGHT);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  ctx.fillRect(0, MENU_HEIGHT - 2, CANVAS_COMPUTER_WIDTH, 2);
  drawText(ctx, "⌘", 10, 4);
  drawText(ctx, "File", 38, 4);
  drawText(ctx, "Edit", 76, 4);
  drawText(ctx, "View", 116, 4);

  if (!activeMenu) return;

  const menuX = activeMenu === "file" ? 32 : activeMenu === "edit" ? 70 : 110;
  const labels =
    activeMenu === "file"
      ? ["New", "Open", "Save"]
      : activeMenu === "edit"
        ? ["Undo", "Redo"]
        : ["✓ Tools", "✓ Canvas"];
  const menuWidth = 176;
  const menuHeight = labels.length * 20 + 4;

  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  ctx.fillRect(menuX + 3, MENU_HEIGHT + 3, menuWidth, menuHeight);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[1];
  ctx.fillRect(menuX, MENU_HEIGHT, menuWidth, menuHeight);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  strokeRect1(ctx, menuX, MENU_HEIGHT, menuWidth, menuHeight);
  strokeRect1(ctx, menuX + 1, MENU_HEIGHT + 1, menuWidth - 2, menuHeight - 2);
  labels.forEach((label, index) => {
    drawText(ctx, label, menuX + 14, MENU_HEIGHT + 5 + index * 20);
  });
}

function drawWindow(ctx: CanvasRenderingContext2D, win: CanvasWindow) {
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[1];
  ctx.fillRect(win.x, win.y, win.width, win.height);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  strokeRect1(ctx, win.x, win.y, win.width, win.height);
  ctx.fillRect(win.x + 1, win.y + win.height, win.width, 1);
  ctx.fillRect(win.x + win.width, win.y + 1, 1, win.height);

  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[1];
  ctx.fillRect(win.x + 1, win.y + 1, win.width - 2, 19);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  strokeRect1(ctx, win.x + 4, win.y + 5, 13, 11);
  for (let y = win.y + 5; y < win.y + 17; y += 3) {
    ctx.fillRect(win.x + 24, y, win.width - 28, 1);
  }
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[1];
  const titleWidth = measureBitmapText(win.title) + 14;
  ctx.fillRect(win.x + win.width / 2 - titleWidth / 2, win.y + 1, titleWidth, 18);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  drawText(ctx, win.title, win.x + win.width / 2, win.y + 4, "center");
}

function drawTools(
  ctx: CanvasRenderingContext2D,
  win: CanvasWindow,
  selectedColor: string
) {
  const bodyX = win.x + 1;
  const bodyY = win.y + 21;
  const tools = ["Pencil", "Line", "Fill", "Erase"];
  tools.forEach((tool, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = bodyX + col * 52;
    const y = bodyY + row * 44;
    ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
    strokeRect1(ctx, x, y, 52, 44);
    if (index === 0) {
      for (let i = 0; i < 12; i += 2) {
        ctx.fillRect(x + 19 + i, y + 8 + i, 2, 2);
      }
    }
    drawText(ctx, tool, x + 26, y + 29, "center");
  });
  strokeRect1(ctx, bodyX, bodyY + 88, 104, 42);
  ctx.fillStyle = selectedColor;
  ctx.fillRect(bodyX + 39, bodyY + 99, 20, 20);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  strokeRect1(ctx, bodyX + 51, bodyY + 107, 20, 20);
  TOOL_COLORS.forEach((color, index) => {
    const x = bodyX + 4 + (index % PALETTE_COLUMNS) * PALETTE_SWATCH_SIZE;
    const y =
      bodyY +
      137 +
      Math.floor(index / PALETTE_COLUMNS) * PALETTE_SWATCH_SIZE;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, PALETTE_SWATCH_SIZE, PALETTE_SWATCH_SIZE);
    if (color === selectedColor) {
      ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
      strokeRect1(ctx, x, y, PALETTE_SWATCH_SIZE, PALETTE_SWATCH_SIZE);
    }
  });
}

function drawPaintCanvas(
  ctx: CanvasRenderingContext2D,
  win: CanvasWindow,
  drawingCanvas: HTMLCanvasElement
) {
  const canvasX = win.x + 4;
  const canvasY = win.y + 24;
  const canvasWidth = PAINT_CANVAS_WIDTH;
  const canvasHeight = PAINT_CANVAS_HEIGHT;
  const scrollbarX = canvasX + canvasWidth + PAINT_SCROLLBAR_GAP;
  const scrollbarY = canvasY + canvasHeight + PAINT_SCROLLBAR_GAP;

  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[1];
  ctx.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
  const drawingCtx = drawingCanvas.getContext("2d");
  if (!drawingCtx) return;

  const image = drawingCtx.getImageData(0, 0, canvasWidth, canvasHeight);
  ctx.putImageData(image, canvasX, canvasY);

  // Draw chrome last so edge strokes cannot cover scrollbars or borders.
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[1];
  ctx.fillRect(
    canvasX + canvasWidth + 1,
    canvasY - 1,
    PAINT_SCROLLBAR_GAP - 1,
    canvasHeight + 2
  );
  ctx.fillRect(
    canvasX - 1,
    canvasY + canvasHeight + 1,
    canvasWidth + 2,
    PAINT_SCROLLBAR_GAP - 1
  );
  ctx.fillRect(scrollbarX, canvasY, 13, canvasHeight);
  ctx.fillRect(canvasX, scrollbarY, canvasWidth, 13);
  ctx.fillRect(scrollbarX + 2, canvasY + 2, 9, 9);
  ctx.fillRect(canvasX + 2, scrollbarY + 2, 9, 9);
  ctx.fillStyle = MACINTOSH_CHROME_PALETTE[0];
  strokeRect1(ctx, canvasX - 1, canvasY - 1, canvasWidth + 2, canvasHeight + 2);
  strokeRect1(ctx, scrollbarX, canvasY, 13, canvasHeight);
  strokeRect1(ctx, canvasX, scrollbarY, canvasWidth, 13);
  strokeRect1(ctx, scrollbarX + 2, canvasY + 2, 9, 9);
  strokeRect1(ctx, canvasX + 2, scrollbarY + 2, 9, 9);
}

function drawLineOnCanvas(
  canvas: HTMLCanvasElement,
  from: Point,
  to: Point,
  color: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = "square";
  ctx.imageSmoothingEnabled = false;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

export default function CanvasComputer() {
  const screenRef = useRef<HTMLCanvasElement>(null);
  const framebufferRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<Point | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const drawingPointerRef = useRef<Point | null>(null);
  const [layout, setLayout] = useState(() =>
    calculateCanvasComputerLayout({
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    })
  );
  const [activeMenu, setActiveMenu] = useState<MenuId | null>(null);
  const [selectedColor, setSelectedColor] = useState(TOOL_COLORS[0]);
  const [windows, setWindows] = useState<CanvasWindow[]>([
    { id: "tools", x: 15, y: 30, width: 106, height: 204, title: "Tools" },
    { id: "paint", x: 180, y: 30, width: 440, height: 318, title: "Untitled" },
  ]);

  if (!framebufferRef.current) {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_COMPUTER_WIDTH;
    canvas.height = CANVAS_COMPUTER_HEIGHT;
    framebufferRef.current = canvas;
  }

  if (!drawingRef.current) {
    const canvas = document.createElement("canvas");
    canvas.width = PAINT_CANVAS_WIDTH;
    canvas.height = PAINT_CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawingRef.current = canvas;
  }

  useEffect(() => {
    function resize() {
      setLayout(
        calculateCanvasComputerLayout({
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        })
      );
    }

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let lastFrame = performance.now();

    function draw(now: number) {
      if (now - lastFrame >= 1000 / 30) {
        lastFrame = now;
        const screenCanvas = screenRef.current;
        const framebuffer = framebufferRef.current;
        const drawingCanvas = drawingRef.current;
        if (screenCanvas && framebuffer && drawingCanvas) {
          const framebufferCtx = framebuffer.getContext("2d");
          const screenCtx = screenCanvas.getContext("2d");
          if (framebufferCtx && screenCtx) {
            framebufferCtx.imageSmoothingEnabled = false;
            framebufferCtx.clearRect(
              0,
              0,
              CANVAS_COMPUTER_WIDTH,
              CANVAS_COMPUTER_HEIGHT
            );
            drawDither(framebufferCtx);
            for (const win of windows) {
              drawWindow(framebufferCtx, win);
              if (win.id === "tools") {
                drawTools(framebufferCtx, win, selectedColor);
              } else if (win.id === "paint") {
                drawPaintCanvas(framebufferCtx, win, drawingCanvas);
              }
            }
            drawMenuBar(framebufferCtx, activeMenu);

            screenCtx.imageSmoothingEnabled = false;
            screenCtx.clearRect(0, 0, layout.width, layout.height);
            screenCtx.drawImage(framebuffer, 0, 0, layout.width, layout.height);
          }
        }
      }
      animationFrame = window.requestAnimationFrame(draw);
    }

    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [activeMenu, layout.height, layout.width, selectedColor, windows]);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = screenRef.current;
    if (!canvas) return null;
    return screenPointToCanvasPoint({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: canvas.getBoundingClientRect(),
    });
  }

  function getPaintWindow() {
    return windows.find((win) => win.id === "paint") ?? null;
  }

  function getDrawingPoint(point: Point, paintWindow: CanvasWindow) {
    const x = point.x - (paintWindow.x + 4);
    const y = point.y - (paintWindow.y + 24);
    if (x < 0 || y < 0 || x >= PAINT_CANVAS_WIDTH || y >= PAINT_CANVAS_HEIGHT) {
      return null;
    }
    return { x, y };
  }

  function onPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = getPoint(event);
    if (!point) return;
    pointerRef.current = point;

    const menu = getMenuAtPoint(point);
    if (menu) {
      setActiveMenu(menu);
      return;
    }
    setActiveMenu(null);

    const toolsWindow = windows.find((win) => win.id === "tools");
    if (toolsWindow) {
      const paletteX = toolsWindow.x + 5;
      const paletteY = toolsWindow.y + 158;
      const paletteIndexX = Math.floor((point.x - paletteX) / PALETTE_SWATCH_SIZE);
      const paletteIndexY = Math.floor((point.y - paletteY) / PALETTE_SWATCH_SIZE);
      const paletteIndex = paletteIndexY * PALETTE_COLUMNS + paletteIndexX;
      const paletteRows = Math.ceil(TOOL_COLORS.length / PALETTE_COLUMNS);
      if (
        paletteIndexX >= 0 &&
        paletteIndexX < PALETTE_COLUMNS &&
        paletteIndexY >= 0 &&
        paletteIndexY < paletteRows &&
        TOOL_COLORS[paletteIndex]
      ) {
        setSelectedColor(TOOL_COLORS[paletteIndex]);
        return;
      }
    }

    const paintWindow = getPaintWindow();
    if (paintWindow && rectContains(point, {
      x: paintWindow.x + 4,
      y: paintWindow.y + 24,
      width: PAINT_CANVAS_WIDTH,
      height: PAINT_CANVAS_HEIGHT,
    })) {
      drawingPointerRef.current = getDrawingPoint(point, paintWindow);
      return;
    }

    const dragWindowId = getWindowDragHandle(point, windows);
    const dragWindow = windows.find((win) => win.id === dragWindowId);
    if (dragWindow) {
      dragRef.current = {
        id: dragWindow.id,
        startPointer: point,
        startWindow: { x: dragWindow.x, y: dragWindow.y },
      };
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = getPoint(event);
    if (!point) return;
    pointerRef.current = point;

    if (dragRef.current) {
      const drag = dragRef.current;
      const nextPosition = moveWindowByPointer({
        startWindow: drag.startWindow,
        startPointer: drag.startPointer,
        currentPointer: point,
      });
      setWindows((current) =>
        current.map((win) =>
          win.id === drag.id ? { ...win, ...nextPosition } : win
        )
      );
      return;
    }

    const paintWindow = getPaintWindow();
    if (drawingPointerRef.current && paintWindow) {
      const nextPoint = getDrawingPoint(point, paintWindow);
      if (!nextPoint) {
        drawingPointerRef.current = null;
        return;
      }
      drawLineOnCanvas(
        drawingRef.current!,
        drawingPointerRef.current,
        nextPoint,
        selectedColor
      );
      drawingPointerRef.current = nextPoint;
    }
  }

  function stopPointer() {
    dragRef.current = null;
    drawingPointerRef.current = null;
  }

  return (
    <Shell>
      <Monitor screenWidth={layout.width} screenHeight={layout.height}>
        <Screen
          ref={screenRef}
          width={layout.width}
          height={layout.height}
          screenWidth={layout.width}
          screenHeight={layout.height}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopPointer}
          onPointerLeave={stopPointer}
        />
      </Monitor>
    </Shell>
  );
}
