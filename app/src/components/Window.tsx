import styled from "@emotion/styled";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { Position, useWindowStore } from "../stores/windowStore";
import { calculateDragPosition } from "../lib/virtualScreen";

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

  border: 1px solid var(--mac-black);
  box-shadow: 1px 1px 0 var(--mac-black);
  overflow: hidden;

  background: var(--mac-white);

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 1fr;

  ${({ allDraggable }) => (allDraggable ? "cursor: grab;" : "")}

  .window__titlebar {
    height: 20px;
    user-select: none;
    cursor: grab;
    display: flex;
    align-items: center;
    position: relative;
    background: var(--mac-white);
    padding: 0;
    border-bottom: 1px solid var(--mac-black);
  }

  .window__close-box {
    all: unset;
    box-sizing: border-box;
    width: 13px;
    height: 11px;
    border: 1px solid var(--mac-black);
    background: var(--mac-white);
    margin: 0 3px 0 4px;
    flex-shrink: 0;
    cursor: default;
    position: relative;
    z-index: 2;

    &:active {
      background: var(--mac-black);
    }
  }

  .window__title-text {
    font-family: var(--chicago);
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    white-space: nowrap;
    padding: 0 6px;
    z-index: 2;
    position: relative;
    background: var(--mac-white);
  }

  .window__stripes {
    position: absolute;
    top: 0;
    left: 22px;
    right: 0;
    bottom: 0;
    z-index: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .window__stripes-inner {
    width: 100%;
    height: 14px;
    background: repeating-linear-gradient(
      to bottom,
      var(--mac-white) 0px,
      var(--mac-white) 1px,
      var(--mac-black) 1px,
      var(--mac-black) 2px,
      var(--mac-white) 2px,
      var(--mac-white) 3px
    );
  }

  .window__body {
    background: var(--mac-white);
    position: relative;
  }
`;

interface WindowProps {
  title?: string;
  alwaysOnTop?: boolean;
  id?: string;
  startClosed?: boolean;
  defaultPosition?: Position;
  dragFromBody?: boolean;
}

export default function Window({
  children,
  title,
  alwaysOnTop,
  id: controlledId,
  startClosed,
  defaultPosition,
  dragFromBody,
}: PropsWithChildren<WindowProps>) {
  const id = useRef(controlledId ?? v4());
  const windowRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    position: Position;
    pointer: Position;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    getWindow,
    addWindow,
    removeWindow,
    touchWindow,
    getStackOrder,
    setWindowPosition,
  } = useWindowStore();
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

  function isInteractiveDragTarget(target: EventTarget | null) {
    return (
      target instanceof HTMLElement &&
      target.closest("button, a, input, select, textarea, [role='button']") !==
        null
    );
  }

  function startDrag(event: React.PointerEvent) {
    if (event.button !== 0) return;
    if (isInteractiveDragTarget(event.target)) return;

    event.preventDefault();

    dragRef.current = {
      position,
      pointer: {
        x: event.clientX,
        y: event.clientY,
      },
    };
    setIsDragging(true);
    touchWindow(id.current);
    windowRef.current?.setPointerCapture(event.pointerId);
  }

  function drag(event: React.PointerEvent) {
    const start = dragRef.current;
    if (!start) return;

    setWindowPosition(
      id.current,
      calculateDragPosition({
        startPosition: start.position,
        startPointer: start.pointer,
        currentPointer: {
          x: event.clientX,
          y: event.clientY,
        },
        scale: window.virtualScreenScale ?? 1,
      })
    );
  }

  function stopDrag(event: React.PointerEvent) {
    dragRef.current = null;
    setIsDragging(false);
    if (windowRef.current?.hasPointerCapture(event.pointerId)) {
      windowRef.current.releasePointerCapture(event.pointerId);
    }
  }

  const windowHandler = dragFromBody || !title ? { onPointerDown: startDrag } : {};
  const titlebarHandler = dragFromBody ? {} : { onPointerDown: startDrag };

  return (
    <WindowWrapper
      ref={windowRef}
      className="window"
      left={position.x}
      top={position.y}
      z={alwaysOnTop ? 9999 : isDragging ? 9998 : getStackOrder(id.current) + 99}
      allDraggable={!title || dragFromBody === true}
      onPointerMove={drag}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onMouseDown={() => touchWindow(id.current)}
      {...windowHandler}
    >
      {title ? (
        <div className="window__titlebar" {...titlebarHandler}>
          <div className="window__stripes">
            <div className="window__stripes-inner" />
          </div>
          <button
            className="window__close-box"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              removeWindow(id.current);
            }}
          />
          <span className="window__title-text">{title}</span>
        </div>
      ) : null}

      <div className="window__body">{children}</div>
    </WindowWrapper>
  );
}
