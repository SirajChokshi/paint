import styled from "@emotion/styled";
import { SaveFile, useFileStore } from "../../stores/fileStore";
import { MouseEvent as ReactMouseEvent, useEffect, useState } from "react";

const DesktopWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .icon-grid {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    padding: 30px;
    box-sizing: border-box;
    display: flex;
    flex-flow: column;
  }

  .bg {
    position: absolute;
    z-index: 0;
    top: -5px;
    left: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    user-select: none;

    filter: blur(1px);

    background: var(--gray-600);

    opacity: 0.8;
    background-size: 0.5rem 0.5rem;
    animation: scan 5s linear infinite;

    @keyframes scan {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: -1rem 1rem;
      }
    }
  }
`;

const DesktopIconWrapper = styled.button`
  all: unset;
  cursor: pointer;
  width: min-content;
  height: min-content;
  gap: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .icon {
    width: 48px;
    height: 48px;
    padding: 6px;
    box-sizing: border-box;
    background: red;
    position: relative;
  }

  &[data-active="true"] {
    .icon::before {
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: var(--gray-500);
      opacity: 0.3;
    }

    span {
      background: var(--gray-400);
      color: var(--gray-0);
    }
  }
`;

export function DesktopIcon(
  props: SaveFile & {
    onClick: (e: ReactMouseEvent) => void;
    onOpen: () => void;
    active: boolean;
  }
) {
  return (
    <DesktopIconWrapper
      onClick={props.onClick}
      onDoubleClick={props.onOpen}
      data-active={props.active}
    >
      <div className="icon">TXT</div>
      <span>{props.name}</span>
    </DesktopIconWrapper>
  );
}

export default function Desktop() {
  const { files } = useFileStore();
  const [active, setActive] = useState<SaveFile | null>(null);

  const handleClickFactory = (file: SaveFile) => (e: ReactMouseEvent) => {
    e.stopPropagation();
    setActive(file);
  };

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if ((e.target as HTMLElement).closest("button") === null) {
        setActive(null);
      }
    }

    window.addEventListener("click", onClickOutside);

    return () => {
      window.removeEventListener("click", onClickOutside);
    };
  }, []);

  return (
    <DesktopWrapper>
      <div className="bg" />
      <div className="icon-grid">
        {files.map((file) => (
          <DesktopIcon
            key={file.name + file.date}
            onClick={handleClickFactory(file)}
            onOpen={() => {
              window.pixel.import(file.payload);
              setActive(null);
            }}
            active={active?.payload === file.payload}
            {...file}
          />
        ))}
      </div>
    </DesktopWrapper>
  );
}
