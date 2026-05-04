import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { PixelCanvas } from "pixel-paint";

const CanvasWrapper = styled.div`
  background: var(--mac-white);
  padding: 2px;
`;

const CanvasInset = styled.div`
  border: 1px solid var(--mac-black);
  line-height: 0;
`;

const StyledCanvas = styled.canvas`
  aspect-ratio: 3 / 2;
  background: white;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  display: block;
  cursor: crosshair;
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
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export default function PixelCanvasRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const points = useRef<Point[]>([]);

  const [pa, setPa] = useState<PixelCanvas | null>(null);

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

  return (
    <CanvasWrapper>
      <CanvasInset>
        <StyledCanvas
          ref={canvasRef}
          onMouseDown={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            if (!pa) return;

            const point = getCanvasPoint(canvas, e.clientX, e.clientY);

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
          onMouseLeave={stopDrawing}
          onContextMenu={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            if (!pa) return;
            if (!isDrawing.current) return;

            const point = getCanvasPoint(canvas, e.clientX, e.clientY);
            const previousPoint = points.current[points.current.length - 1];
            if (!previousPoint) return;

            points.current.push(point);
            drawSegment(previousPoint, point);
          }}
        />
      </CanvasInset>
    </CanvasWrapper>
  );
}
