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
  border: 2px solid black;
  box-shadow: 2px 2px black;
  overflow: auto;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 1fr;

  .window__title {
    height: 1.825rem;
    padding: 0 0.5rem;
    user-select: none;
    line-height: 1.925rem;
    border-bottom: 2px solid black;
    cursor: grab;
    font-weight: bold;

    font-size: 1.125rem;
  }
`;

interface WindowProps {
  title?: string;
  alwaysOnTop?: boolean;
}

export default function Window({
  children,
  title,
  alwaysOnTop,
}: PropsWithChildren<WindowProps>) {
  const windowRef = useRef<HTMLDivElement>(null);
  const { position, handler } = useDrag(windowRef);
  const id = useRef(v4());

  const { addWindow, removeWindow, touchWindow, getStackOrder } =
    useWindowStore();

  useEffect(() => {
    const windowId = id.current;

    addWindow({ id: windowId });

    return () => {
      removeWindow(windowId);
    };
  }, []);

  // use the whole window as a drag handle if there is no title
  const windowHandler = title ? {} : handler;

  return (
    <WindowWrapper
      className="window"
      {...position}
      z={alwaysOnTop ? 9999 : getStackOrder(id.current) + 99}
      ref={windowRef}
      onMouseDown={() => touchWindow(id.current)}
      onClick={(e) => {
        // prevent clicks from bubbling up to the desktop
        e.stopPropagation();
      }}
      {...windowHandler}
    >
      {title ? (
        // only render the title if it exists
        <div className="window__title font-sm" {...handler}>
          {title}
        </div>
      ) : null}

      {children}
    </WindowWrapper>
  );
}
