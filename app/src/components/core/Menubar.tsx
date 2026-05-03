import * as Toolbar from "@radix-ui/react-menubar";
import styled from "@emotion/styled";
import { useFileStore } from "../../stores/fileStore";
import { FrameBus } from "../../lib/frame";
import { Menu } from "./Menu";
import { useWindowStore } from "../../stores/windowStore";

const MenubarWrapper = styled(Toolbar.Root)`
  display: flex;
  align-items: stretch;
  justify-content: flex-start;

  background-color: var(--mac-white);
  border-bottom: 2px solid var(--mac-black);
  height: 20px;
  width: 100%;
  z-index: 9999;
  font-family: var(--chicago);
  font-size: 12px;

  button {
    all: unset;
    padding: 0 12px;
    cursor: default;
    font-family: var(--chicago);
    font-size: 12px;
    line-height: 18px;
    height: 18px;

    &:hover,
    &[aria-expanded="true"] {
      background-color: var(--mac-black);
      color: var(--mac-white);
    }
  }
`;

const AppleMenuTrigger = styled.button`
  && {
    font-size: 14px;
    padding: 0 8px;
  }
`;

export default function Menubar() {
  const { addWindow } = useWindowStore();
  const { save, files } = useFileStore();

  return (
    <MenubarWrapper className="font-sm">
      <Menu
        actions={[
          {
            name: "About Pixel Paint",
            onClick: () => {
              addWindow({
                id: "about",
                position: {
                  x: 10,
                  y: 10,
                },
              });
            },
          },
          {
            name: "Preferences",
            onClick: () => {},
          },
          {
            name: "Quit",
            onClick: () => FrameBus.quit(),
          },
        ]}
      >
        <AppleMenuTrigger>&#63743;</AppleMenuTrigger>
      </Menu>
      <Menu
        actions={[
          {
            name: "New",
            onClick: () => {
              window.pixel.clear();
            },
          },
          {
            name: "Open",
            items:
              files.length > 0
                ? files.slice(0, 5).map((file) => ({
                    name: `${file.name}.img`,
                    onClick: () => {
                      window.pixel.clear();
                      window.pixel.import(file.payload);
                    },
                  }))
                : [
                    {
                      name: "No files",
                      onClick: () => {},
                      disabled: true,
                    },
                  ],
          },
          {
            name: "Save",
            onClick: () => {
              const name = window.prompt("Save as:")?.trim();
              if (!name) {
                return;
              }

              const uri = window.pixel.export();

              save({ name, payload: uri });
            },
          },
        ]}
      >
        <button>File</button>
      </Menu>
      <Menu
        actions={[
          { name: "Undo", onClick: () => {} },
          { name: "Redo", onClick: () => {} },
        ]}
      >
        <button>Edit</button>
      </Menu>
    </MenubarWrapper>
  );
}
