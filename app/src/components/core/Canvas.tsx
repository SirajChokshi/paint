import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { PixelCanvas } from "pixel-paint";
import { calculateCanvasPoint, snapPointToGrid } from "../../lib/virtualScreen";

const BRUSH_SIZE = 5;

const CanvasWrapper = styled.div`
  background: var(--mac-white);
  padding: 2px;
`;

const CanvasInset = styled.div`
  border: 1px solid var(--mac-black);
  line-height: 0;
  position: relative;

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
  const isDrawing = useRef(false);
  const points = useRef<Point[]>([]);

  const [pa, setPa] = useState<PixelCanvas | null>(null);
  const [cursorPoint, setCursorPoint] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.mode === undefined) {
      window.mode = "line";
    }

    const screenWidth = window.virtualScreenWidth ?? window.innerWidth;
    const screenHeight = window.virtualScreenHeight ?? window.innerHeight;
    const maxWidthFromWidth = screenWidth - 205;
    const maxWidthFromHeight = (screenHeight * 0.85 * 3) / 2;
    const maxWidth = Math.max(
      100,
      Math.floor(Math.min(maxWidthFromWidth, maxWidthFromHeight))
    );
    canvas.width = maxWidth;
    canvas.height = Math.floor((maxWidth * 2) / 3);

    const pixelArt = new PixelCanvas(ctx, {
      pixelSize: 5,
    });

    setPa(pixelArt);
    window.pixel = pixelArt;
  }, []);

  function stopDrawing() {
    isDrawing.current = false;
    points.current.length = 0;
  }

  function drawSegment(from: Point, to: Point) {
    if (!pa) return;

    pa.beginPath();
    pa.moveTo(from.x, from.y);
    pa.lineTo(to.x, to.y);
    pa.stroke();
  }

  function moveCursor(e: React.MouseEvent<HTMLCanvasElement>) {
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
          onMouseDown={(e) => {
            if (!pa) return;

            const point = moveCursor(e);
            if (!point) return;

            if (window.mode === "fill") {
              pa.fill(point.x, point.y);
              stopDrawing();
              return;
            }

            isDrawing.current = true;
            points.current = [point];
            drawSegment(point, point);
          }}
          onMouseUp={stopDrawing}
          onMouseLeave={() => {
            setCursorPoint(null);
            stopDrawing();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          onMouseMove={(e) => {
            if (!pa) return;

            const point = moveCursor(e);
            if (!point) return;
            if (!isDrawing.current) return;

            const previousPoint = points.current[points.current.length - 1];
            if (!previousPoint) return;

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
