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

  background: var(--mac-white);
  color: var(--mac-black);
  border: 2px solid var(--mac-black);
  border-radius: 0;
  box-shadow: 1px 1px 0 var(--mac-black);
  overflow: visible;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 1fr;

  ${({ allDraggable }) => (allDraggable ? "cursor: grab;" : "")}

  .window__titlebar {
    height: 20px;
    padding: 0;
    user-select: none;
    border-bottom: 2px solid var(--mac-black);
    cursor: grab;
    display: flex;
    align-items: center;
    position: relative;
    background: var(--mac-white);
    overflow: hidden;
  }

  .window__close-box {
    width: 13px;
    height: 13px;
    border: 1px solid var(--mac-black);
    background: var(--mac-white);
    margin: 0 4px;
    flex-shrink: 0;
    cursor: pointer;
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    outline: none;
    font-size: 0;
    line-height: 0;

    &:active {
      background: var(--mac-black);
    }
  }

  .window__title-text {
    font-family: var(--chicago);
    font-size: 12px;
    font-weight: bold;
    line-height: 20px;
    text-align: center;
    white-space: nowrap;
    padding: 0 8px;
    z-index: 2;
    position: relative;
    background: var(--mac-white);
  }

  .window__stripes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 2px,
      var(--mac-black) 2px,
      var(--mac-black) 4px
    );
  }

  .window__stripe-gap-left {
    flex-shrink: 0;
    width: 4px;
    z-index: 2;
    background: var(--mac-white);
  }

  .window__stripe-gap-right {
    flex: 1;
    min-width: 20px;
    z-index: 1;
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
          <div className="window__stripes" />
          <button
            className="window__close-box"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              removeWindow(id.current);
            }}
          />
          <div className="window__stripe-gap-left" />
          <span className="window__title-text">{title}</span>
          <div className="window__stripe-gap-right" />
        </div>
      ) : null}

      {children}
    </WindowWrapper>
  );
}
