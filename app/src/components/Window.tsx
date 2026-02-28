import styled from "@emotion/styled";
import { PropsWithChildren, useEffect, useRef } from "react";
import { v4 } from "uuid";
import { Position, useWindowStore } from "../stores/windowStore";
import { useDraggable } from "@dnd-kit/core";

const WindowWrapper = styled.div<{
  z: number;
  left: number;
  top: number;
  allDraggable: boolean;
}>`
  position: absolute;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;

  width: min-content;

  z-index: ${({ z }) => z};

  background: white;
  color: black;
  border: 2px solid black;
  box-shadow: 2px 2px black;
  overflow: auto;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 1fr;

  ${({ allDraggable }) => (allDraggable ? "cursor: grab;" : "")}

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
  id?: string;
  startClosed?: boolean;
  defaultPosition?: Position;
}

export default function Window({
  children,
  title,
  alwaysOnTop,
  id: controlledId,
  startClosed,
  defaultPosition,
}: PropsWithChildren<WindowProps>) {
  const id = useRef(controlledId ?? v4());
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id.current,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const { getWindow, addWindow, removeWindow, touchWindow, getStackOrder } =
    useWindowStore();
  const initialX = defaultPosition?.x ?? 0;
  const initialY = defaultPosition?.y ?? 0;

  const maybeWindow = getWindow(id.current);

  useEffect(() => {
    if (startClosed) return;

    const windowId = id.current;

    addWindow({ id: windowId, position: { x: initialX, y: initialY } });

    return () => {
      removeWindow(windowId);
    };
  }, [addWindow, removeWindow, initialX, initialY, startClosed]);

  if (!maybeWindow) return null;

  const { position } = maybeWindow;

  // use the whole window as a drag handle if there is no title
  const windowHandler = title
    ? {}
    : {
        ...listeners,
        ...attributes,
      };

  return (
    <WindowWrapper
      ref={setNodeRef}
      className="window"
      style={style}
      left={position.x}
      top={position.y}
      z={alwaysOnTop ? 9999 : getStackOrder(id.current) + 99}
      allDraggable={!title}
      onMouseDown={() => touchWindow(id.current)}
      {...windowHandler}
    >
      {title ? (
        // only render the title if it exists
        <div className="window__title font-sm" {...attributes} {...listeners}>
          {title}
        </div>
      ) : null}

      {children}
    </WindowWrapper>
  );
}
