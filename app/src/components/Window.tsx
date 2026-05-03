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

  /* Outer black border */
  border: 2px solid var(--mac-black);
  border-radius: 4px 4px 0 0;
  box-shadow: 1px 1px 0 var(--mac-black);
  overflow: hidden;

  /* 3D raised bezel inside */
  background: var(--mac-light-gray);

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 1fr;

  ${({ allDraggable }) => (allDraggable ? "cursor: grab;" : "")}

  .window__titlebar {
    height: 22px;
    user-select: none;
    cursor: grab;
    display: flex;
    align-items: center;
    position: relative;
    background: var(--mac-light-gray);
    padding: 0;
    border-bottom: 2px solid var(--mac-black);
  }

  .window__close-box {
    all: unset;
    width: 14px;
    height: 14px;
    border: 2px solid var(--mac-black);
    background: var(--mac-white);
    margin: 0 3px 0 4px;
    flex-shrink: 0;
    cursor: default;
    position: relative;
    z-index: 2;
    box-sizing: border-box;

    &:active {
      background: var(--mac-black);
    }
  }

  .window__title-text {
    font-family: var(--chicago);
    font-size: 12px;
    font-weight: bold;
    line-height: 22px;
    text-align: center;
    white-space: nowrap;
    padding: 0 8px;
    z-index: 2;
    position: relative;
    background: var(--mac-light-gray);
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
      var(--mac-black) 0px,
      var(--mac-black) 2px,
      var(--mac-white) 2px,
      var(--mac-white) 4px
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
        <div className="window__titlebar" {...attributes} {...listeners}>
          <div className="window__stripes">
            <div className="window__stripes-inner" />
          </div>
          <button
            className="window__close-box"
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
