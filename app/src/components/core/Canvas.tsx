import styled from "@emotion/styled";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PixelCanvas } from "pixel-paint";
import {
  calculateCanvasPoint,
  getPaintAppCanvasPixelSize,
  PAINT_APP_CANVAS_PIXEL_SIZE,
  PAINT_APP_VIRTUAL_SCREEN_HEIGHT,
  PAINT_APP_VIRTUAL_SCREEN_WIDTH,
  snapPointToGrid,
} from "../../lib/virtualScreen";
import { getPaintPalette } from "../../lib/palette";
import { usePaintStore } from "../../stores/paintStore";
import { canvasHistory } from "../../services/canvasHistory";

const BRUSH_SIZE = 5;

const CanvasWrapper = styled.div`
  background: var(--mac-white);
  padding: 6px;
`;

const CanvasInset = styled.div`
  border: 1px solid var(--mac-black);
  line-height: 0;
  position: relative;
  overflow: hidden;
  width: min-content;

  .brush-cursor {
    position: absolute;
    z-index: 1;
    width: ${BRUSH_SIZE}px;
    height: ${BRUSH_SIZE}px;
    pointer-events: none;
    background:
      linear-gradient(var(--mac-black), var(--mac-black)) center / 5px 1px
        no-repeat,
      linear-gradient(var(--mac-black), var(--mac-black)) center / 1px 5px
        no-repeat;
    outline: 1px solid var(--mac-black);
    box-shadow:
      inset 0 0 0 1px var(--mac-white),
      0 0 0 1px var(--mac-white);
  }
`;

const StyledCanvas = styled.canvas`
  aspect-ratio: 3 / 2;
  background: white;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: block;
  cursor: none;
  position: relative;
`;

interface Point {
  x: number;
  y: number;
}

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Point {
  const rect = canvas.getBoundingClientRect();
  return calculateCanvasPoint({
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    rect,
    clientX,
    clientY,
  });
}

export default function PixelCanvasRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelCanvasRef = useRef<PixelCanvas | null>(null);
  const isDrawing = useRef(false);
  const points = useRef<Point[]>([]);
  const drawingStartSnapshot = useRef<ImageData | null>(null);
  const linePreviewSnapshot = useRef<ImageData | null>(null);
  const paletteId = usePaintStore((state) => state.paletteId);
  const selectedColor = usePaintStore((state) => state.selectedColor);

  const [pa, setPa] = useState<PixelCanvas | null>(null);
  const [cursorPoint, setCursorPoint] = useState<Point | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function mountPixelCanvas() {
      const screenWidth =
        window.virtualScreenWidth ?? PAINT_APP_VIRTUAL_SCREEN_WIDTH;
      const screenHeight =
        window.virtualScreenHeight ?? PAINT_APP_VIRTUAL_SCREEN_HEIGHT;
      const { width, height } = getPaintAppCanvasPixelSize(
        screenWidth,
        screenHeight,
      );
      if (
        canvas!.width === width &&
        canvas!.height === height &&
        pixelCanvasRef.current
      ) {
        return;
      }

      canvas!.width = width;
      canvas!.height = height;

      const pixelArt = new PixelCanvas(ctx!, {
        pixelSize: PAINT_APP_CANVAS_PIXEL_SIZE,
        palette: getPaintPalette(usePaintStore.getState().paletteId),
      });

      pixelCanvasRef.current = pixelArt;
      setPa(pixelArt);
      window.pixel = pixelArt;
      canvasHistory.bind(pixelArt);
      window.dispatchEvent(new Event("pixel-ready"));
    }

    mountPixelCanvas();
    window.addEventListener("resize", mountPixelCanvas);
    return () => window.removeEventListener("resize", mountPixelCanvas);
  }, []);

  useEffect(() => {
    if (!pa) return;

    pa.color = selectedColor;
  }, [pa, selectedColor]);

  useEffect(() => {
    if (!pa) return;

    pa.setPalette(getPaintPalette(paletteId), { remap: true });
  }, [pa, paletteId]);

  useEffect(() => {
    function cancelActiveDrawing(event: MouseEvent) {
      if (!isDrawing.current) return;

      event.preventDefault();
      cancelDrawing();
    }

    window.addEventListener("contextmenu", cancelActiveDrawing, {
      capture: true,
    });

    return () => {
      window.removeEventListener("contextmenu", cancelActiveDrawing, {
        capture: true,
      });
    };
  }, []);

  function stopDrawing() {
    if (isDrawing.current) {
      canvasHistory.commitTransaction();
    }
    isDrawing.current = false;
    points.current.length = 0;
    drawingStartSnapshot.current = null;
    linePreviewSnapshot.current = null;
  }

  function cancelDrawing() {
    const snapshot = drawingStartSnapshot.current;
    const pixelCanvas = pixelCanvasRef.current;
    if (snapshot && pixelCanvas) {
      pixelCanvas.renderer.putImageData(snapshot, 0, 0);
    }
    if (isDrawing.current) {
      canvasHistory.cancelTransaction();
    }
    isDrawing.current = false;
    points.current.length = 0;
    drawingStartSnapshot.current = null;
    linePreviewSnapshot.current = null;
  }

  function finishLine(point: Point) {
    if (!pa) return;

    const startPoint = points.current[0];
    const snapshot = linePreviewSnapshot.current;
    if (!startPoint || !snapshot) {
      stopDrawing();
      return;
    }

    pa.renderer.putImageData(snapshot, 0, 0);
    drawSegment(startPoint, point);
    stopDrawing();
  }

  function drawSegment(from: Point, to: Point) {
    if (!pa) return;

    pa.beginPath();
    pa.moveTo(from.x, from.y);
    pa.lineTo(to.x, to.y);
    pa.stroke();
  }

  function getActiveTool() {
    return usePaintStore.getState().toolMode;
  }

  function moveCursor(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const point = getCanvasPoint(canvas, e.clientX, e.clientY);
    const snappedPoint = snapPointToGrid(point, BRUSH_SIZE);
    setCursorPoint(snappedPoint);

    return point;
  }

  return (
    <CanvasWrapper>
      <CanvasInset>
        <StyledCanvas
          ref={canvasRef}
          onPointerDown={(e) => {
            if (!pa) return;
            if (e.button !== 0) {
              if (isDrawing.current) {
                e.preventDefault();
                cancelDrawing();
              }
              return;
            }

            const point = moveCursor(e);
            if (!point) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            const tool = getActiveTool();

            if (tool === "fill") {
              pa.fill(point.x, point.y);
              return;
            }

            canvasHistory.beginTransaction();
            isDrawing.current = true;
            points.current = [point];
            drawingStartSnapshot.current = pa.renderer.getImageData(
              0,
              0,
              pa.renderer.canvas.width,
              pa.renderer.canvas.height
            );
            linePreviewSnapshot.current =
              tool === "line"
                ? pa.renderer.getImageData(
                    0,
                    0,
                    pa.renderer.canvas.width,
                    pa.renderer.canvas.height
                  )
                : null;
            drawSegment(point, point);
          }}
          onPointerUp={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
            const tool = getActiveTool();
            if (tool !== "line" || !isDrawing.current) {
              stopDrawing();
              return;
            }

            const point = moveCursor(e);
            if (!point) {
              stopDrawing();
              return;
            }

            finishLine(point);
          }}
          onPointerLeave={() => {
            setCursorPoint(null);
            cancelDrawing();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            cancelDrawing();
          }}
          onPointerMove={(e) => {
            if (!pa) return;

            const point = moveCursor(e);
            if (!point) return;
            if (!isDrawing.current) return;
            const tool = getActiveTool();

            const previousPoint = points.current[points.current.length - 1];
            if (!previousPoint) return;

            if (tool === "line") {
              const startPoint = points.current[0];
              const snapshot = linePreviewSnapshot.current;
              if (!startPoint || !snapshot) return;

              pa.renderer.putImageData(snapshot, 0, 0);
              drawSegment(startPoint, point);
              points.current = [startPoint, point];
              return;
            }

            points.current.push(point);
            drawSegment(previousPoint, point);
          }}
        />
        {cursorPoint ? (
          <div
            className="brush-cursor"
            style={{
              left: cursorPoint.x,
              top: cursorPoint.y,
            }}
          />
        ) : null}
      </CanvasInset>
    </CanvasWrapper>
  );
}
