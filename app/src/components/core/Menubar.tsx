import * as Toolbar from "@radix-ui/react-menubar";
import styled from "@emotion/styled";
import { useFileStore } from "../../stores/fileStore";
import { FrameBus } from "../../lib/frame";
import { Menu } from "./Menu";
import { useWindowStore } from "../../stores/windowStore";
import { WINDOW_IDS } from "../../App";

const MenubarWrapper = styled(Toolbar.Root)`
  display: flex;
  align-items: stretch;
  justify-content: flex-start;

  background-color: var(--mac-white);
  border-bottom: 2px solid var(--mac-black);
  height: 21px;
  width: 100%;
  z-index: 9999;
  font-family: var(--chicago);
  font-size: 12px;
  box-shadow: 0 1px 0 var(--mac-white);

  button {
    all: unset;
    padding: 0 10px;
    cursor: default;
    font-family: var(--chicago);
    font-size: 12px;
    line-height: 19px;
    height: 19px;

    &:hover,
    &[aria-expanded="true"] {
      background-color: var(--mac-black);
      color: var(--mac-white);
    }
  }
`;

export default function Menubar() {
  const { addWindow, getWindow } = useWindowStore();
  const { save, files } = useFileStore();

  return (
    <MenubarWrapper className="font-sm">
      <Menu
        actions={[
          {
            name: "About Pixel Paint",
            onClick: () => {
              addWindow({
                id: WINDOW_IDS.about,
                position: {
                  x: 80,
                  y: 40,
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
        <button>&#63743;</button>
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
      <Menu
        actions={[
          {
            name: getWindow(WINDOW_IDS.tools) ? "✓ Tools" : "  Tools",
            onClick: () => {
              if (!getWindow(WINDOW_IDS.tools)) {
                addWindow({
                  id: WINDOW_IDS.tools,
                  position: { x: 15, y: 15 },
                });
              }
            },
          },
          {
            name: getWindow(WINDOW_IDS.canvas) ? "✓ Canvas" : "  Canvas",
            onClick: () => {
              if (!getWindow(WINDOW_IDS.canvas)) {
                addWindow({
                  id: WINDOW_IDS.canvas,
                  position: { x: 180, y: 15 },
                });
              }
            },
          },
        ]}
      >
        <button>View</button>
      </Menu>
    </MenubarWrapper>
  );
}
