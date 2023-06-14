import styled from "@emotion/styled";
import { PropsWithChildren, useEffect, useRef } from "react";
import { v4 } from "uuid";
import { useWindowStore } from "../stores/windowStore";
import useDrag, { Position } from "../hooks/useDrag";

const WindowWrapper = styled.div<Position & { z: number }>`
  position: absolute;
  top: 0;
  left: 0;

  width: min-content;

  ${({ x, y }) => `transform: translate(${x}px, ${y}px);`}
  z-index: ${({ z }) => z};

  background: white;
  color: black;
  border: 2px outset black;
  overflow: auto;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 1fr;

  .window__title {
    height: 1.825rem;
    padding: 0 0.5rem;
    user-select: none;
    line-height: 1.925rem;
    border-bottom: 2px outset black;
    cursor: grab;
    font-weight: bold;

    font-size: 1.125rem;
  }
`;

interface WindowProps {
  title?: string;
}

export default function Window({
  children,
  title = "Untitled",
}: PropsWithChildren<WindowProps>) {
  const windowRef = useRef<HTMLDivElement>(null);
  const { position, handler } = useDrag(windowRef);
  const id = useRef(v4());

  const { addWindow, removeWindow, touchWindow, getStackOrder } =
    useWindowStore();

  useEffect(() => {
    addWindow({ id: id.current });

    return () => {
      removeWindow(id.current);
    };
  }, []);

  return (
    <WindowWrapper
      className="window"
      {...position}
      z={getStackOrder(id.current)}
      ref={windowRef}
      onMouseDown={() => touchWindow(id.current)}
    >
      <div className="window__title font-sm" {...handler}>
        {title}
      </div>
      {children}
    </WindowWrapper>
  );
}
