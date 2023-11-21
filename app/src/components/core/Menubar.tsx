import * as Toolbar from "@radix-ui/react-toolbar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styled from "@emotion/styled";
import { Action } from "../../types/ui";
import { useFileStore } from "../../stores/fileStore";
import { FrameBus } from "../../lib/frame";

const MenubarWrapper = styled(Toolbar.Root)`
  display: flex;
  align-items: stretch;
  justify-content: flex-start;

  background-color: var(--gray-0);
  border-bottom: 2px solid black;
  height: 1.825rem;
  width: 100%;
  z-index: 999;

  button {
    all: unset;
    padding: 0 0.75rem;
    cursor: pointer;

    &:hover,
    &[aria-expanded="true"] {
      background-color: var(--gray-999);
      color: var(--gray-0);
    }
  }
`;

const MenuDropdownContent = styled(DropdownMenu.Content)`
  background-color: #fff;
  border: 2px solid var(--gray-999);
  box-shadow: 2px 2px black;

  min-width: 100px;

  display: flex;
  flex-direction: column;

  &&& button {
    cursor: pointer;

    &:hover,
    &:focus {
      outline: none;
      background: var(--gray-999);
      color: var(--gray-0);
    }
  }
`;

interface MenuProps {
  label: string;
  // menu actions cannot be overloaded
  actions: Action<unknown>[];
}

function Menu(props: MenuProps) {
  return (
    <DropdownMenu.Root>
      <Toolbar.Button asChild>
        <DropdownMenu.Trigger>{props.label}</DropdownMenu.Trigger>
      </Toolbar.Button>
      <MenuDropdownContent align="start">
        {props.actions.map((action) => (
          <DropdownMenu.Item onSelect={action.onClick} asChild>
            <button>{action.name}</button>
          </DropdownMenu.Item>
        ))}
      </MenuDropdownContent>
    </DropdownMenu.Root>
  );
}

export default function Menubar() {
  const { save } = useFileStore();

  return (
    <MenubarWrapper className="font-sm">
      <Menu
        label="⌘"
        actions={[
          {
            name: "About",
            onClick: () => {},
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
      />
      <Menu
        label="File"
        actions={[
          {
            name: "New",
            onClick: () => {
              window.pixel.clear();
            },
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
      />
      <Menu
        label="Edit"
        actions={[
          { name: "Undo", onClick: () => {} },
          { name: "Redo", onClick: () => {} },
        ]}
      />
    </MenubarWrapper>
  );
}
