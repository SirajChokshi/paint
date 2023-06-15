import * as Toolbar from "@radix-ui/react-toolbar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styled from "@emotion/styled";
import { Action } from "../../types/ui";
import { useFileStore } from "../../stores/fileStore";

const MenubarWrapper = styled(Toolbar.Root)`
  background-color: #eee;
  border-bottom: 1px solid #ccc;
  width: 100%;
  z-index: 999;

  button {
    all: unset;
    padding: 0 8px;
    cursor: pointer;
  }
`;

const MenuDropdownContent = styled(DropdownMenu.Content)`
  background-color: #fff;
  border: 1px solid #ccc;

  min-width: 100px;

  display: flex;
  flex-direction: column;

  button {
    cursor: pointer;

    &:hover,
    &:focus {
      outline: none;
      background: blue;
      color: white;
    }
  }
`;

interface MenuProps {
  label: string;
  // menu actions cannot be overloaded
  actions: Action<{}>[];
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
            name: "Quit",
            onClick: () => {
              if (window.top) {
                window.top.postMessage("teardown", "*");
              }
            },
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
              const uri = window.pixel.export();

              save({ name: "Untitled", payload: uri });
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
