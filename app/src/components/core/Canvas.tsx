import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { PixelCanvas } from "pixel-paint";

const StyledCanvas = styled.canvas`
  aspect-ratio: 3 / 2;
  background: white;
  image-rendering: pixelated;
  image-rendering: crisp-edges;

  cursor: crosshair;
`;

(window as any).mode = "line";

export default function PixelCanvasRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);

  const [pa, setPa] = useState<PixelCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // TODO make this responsive
    // canvas is 60% of the window width w/ 3:2 aspect ratio
    canvasRef.current.width = window.innerWidth * 0.85;
    canvasRef.current.height = (window.innerWidth * 0.85 * 2) / 3;

    const pixelArt = new PixelCanvas(ctx, {
      pixelSize: 5,
    });

    setPa(pixelArt);
    window.pixel = pixelArt;

    function draw(w: number, h: number, pa: PixelCanvas) {
      pa.ctx.clearRect(0, 0, w, h);

      if (isDrawing.current) {
        if ((window as any).mode === "line") {
          if (points.current.length > 1) {
            pa.beginPath();
            const lastPoint = points.current[points.current.length - 1];
            const secondLastPoint = points.current[points.current.length - 2];
            pa.moveTo(secondLastPoint.x, secondLastPoint.y);
            pa.lineTo(lastPoint.x, lastPoint.y);
            pa.stroke();
          }
        } else if ((window as any).mode === "fill") {
          pa.fill(points.current[0].x, points.current[0].y);
        }
      }
      requestAnimationFrame(() => draw(w, h, pa));
    }

    draw(canvasRef.current.width, canvasRef.current.height, pixelArt);
  }, []);

  return (
    <StyledCanvas
      ref={canvasRef}
      onMouseDown={(e) => {
        if (!canvasRef.current) return;
        if (!pa) return;

        isDrawing.current = true;

        // pa.color = color

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        points.current.push({
          x,
          y,
        });
      }}
      onMouseUp={() => {
        isDrawing.current = false;

        points.current.length = 0;
      }}
      onMouseLeave={() => {
        isDrawing.current = false;

        points.current.length = 0;
      }}
      onContextMenu={() => {
        isDrawing.current = false;

        points.current.length = 0;
      }}
      onMouseMove={(e) => {
        if (!canvasRef.current) return;
        if (!isDrawing.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        points.current.push({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
    />
  );
}
