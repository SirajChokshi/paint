import styled from "@emotion/styled";
import { PropsWithChildren, useEffect, useRef } from "react";
import { v4 } from "uuid";
import { Position, useWindowStore } from "../stores/windowStore";
import { useDraggable } from "@dnd-kit/core";

const WindowWrapper = styled.div<{
  z: number;
  left: number;
  top: number;
  dragX: number;
  dragY: number;
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
  transform: translate3d(${({ dragX }) => dragX}px, ${({ dragY }) => dragY}px, 0);

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
  const scale = window.virtualScreenScale ?? 1;
  const dragX = transform ? transform.x / scale : 0;
  const dragY = transform ? transform.y / scale : 0;

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
      left={position.x}
      top={position.y}
      dragX={dragX}
      dragY={dragY}
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
