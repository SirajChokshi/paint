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
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    flex-flow: column wrap;
    align-content: flex-end;
    gap: 4px;
  }

  .bg {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    user-select: none;

    /* Classic Mac OS desktop dithered pattern */
    background-color: #4a7dc6;
    background-image: url("/dither.png");
    background-size: 2px 2px;
    background-repeat: repeat;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
`;

const DesktopIconWrapper = styled.button`
  all: unset;
  cursor: default;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  gap: 2px;
  padding: 4px;

  .icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: var(--mac-white);
    border: 1px solid var(--mac-black);
    font-family: var(--chicago);
    font-size: 9px;
    font-weight: normal;
    color: var(--mac-black);

    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 8px 8px 0;
      border-color: transparent var(--mac-white) transparent transparent;
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 8px;
      border-bottom: 1px solid var(--mac-black);
      border-left: 1px solid var(--mac-black);
    }
  }

  span {
    display: block;
    max-width: 100%;
    font-family: var(--chicago);
    font-size: 10px;
    font-weight: normal;
    line-height: 1.2;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    color: var(--mac-white);
    padding: 1px 3px;
  }

  &[data-active="true"] {
    .icon {
      background: var(--mac-black);
      color: var(--mac-white);

      &::after {
        border-color: transparent var(--mac-black) transparent transparent;
      }
    }

    span {
      background: var(--mac-black);
      color: var(--mac-white);
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
      <div className="icon">IMG</div>
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
              window.pixel.clear();
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
