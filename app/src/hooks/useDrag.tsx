import { useRef, useState } from "react";

export interface Position {
  x: number;
  y: number;
}

interface DragProps {
  dragStartLeft: number;
  dragStartTop: number;
  dragStartX: number;
  dragStartY: number;
}

export default function useDrag(ref: React.RefObject<HTMLElement>) {
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const dragProps = useRef<DragProps>();

  const initializeDrag = (event: React.MouseEvent) => {
    if (!ref.current) return;

    const { target, clientX, clientY } = event;
    const { offsetTop, offsetLeft } = target as HTMLDivElement;
    const { left, top } = ref.current.getBoundingClientRect();

    const { left: mainLeft = 0, top: mainTop = 0 } = document
      .getElementsByTagName("main")[0]!
      .getBoundingClientRect();

    dragProps.current = {
      dragStartLeft: left - offsetLeft - mainLeft,
      dragStartTop: top - offsetTop - mainTop,
      dragStartX: clientX,
      dragStartY: clientY,
    };

    window.addEventListener("mousemove", startDragging, false);
    window.addEventListener("mouseup", stopDragging, false);
  };

  const startDragging = ({ clientX, clientY }: MouseEvent) => {
    if (!dragProps.current) return;

    setPosition({
      x:
        dragProps.current.dragStartLeft +
        clientX -
        dragProps.current.dragStartX,
      y:
        dragProps.current.dragStartTop + clientY - dragProps.current.dragStartY,
    });
  };

  const stopDragging = () => {
    window.removeEventListener("mousemove", startDragging, false);
    window.removeEventListener("mouseup", stopDragging, false);
  };

  return {
    position,
    handler: {
      onMouseDown: initializeDrag,
    },
  };
}
