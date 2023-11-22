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

  background-color: white;
  border-bottom: 2px solid black;
  height: 1.825rem;
  width: 100%;
  z-index: 9999;

  button {
    all: unset;
    padding: 0 0.75rem;
    cursor: pointer;

    &:hover,
    &[aria-expanded="true"] {
      background-color: black;
      color: white;
    }
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
            name: "About",
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
        <button>⌘</button>
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
            items: files.slice(0, 5).map((file) => ({
              name: `${file.name}.img`,
              onClick: () => {
                window.pixel.clear();
                window.pixel.import(file.payload);
              },
            })),
          },
          {
            name: "Save",
            onClick: () => {
              const name = window.prompt("Save as:");

              if (name === null) {
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
