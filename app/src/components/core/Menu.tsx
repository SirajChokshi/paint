import * as DropdownMenu from "@radix-ui/react-menubar";
import { type PropsWithChildren } from "react";
import styled from "@emotion/styled";

interface SubMenu {
  name: string;
  items: MenuItem[];
}

interface Action {
  name: string;
  onClick: () => void;
  disabled?: boolean;
}

type MenuItem = SubMenu | Action;

const MenuContentWrapper = styled.div`
  background-color: var(--mac-white, #ffffff);
  border: 2px solid var(--mac-black, #000000);
  box-shadow: 2px 2px 0 var(--mac-black, #000000);

  display: flex;
  flex-direction: column;
  padding: 2px 0;
  min-width: 160px;

  button {
    all: unset;
    padding: 2px 24px 2px 18px;
    font-family: var(--chicago);
    font-size: 12px;
    line-height: 18px;
    height: 18px;
    cursor: default;
    white-space: nowrap;

    &:not([data-disabled]) {
      &:hover,
      &:focus,
      &[data-highlighted] {
        outline: none;
        background: var(--mac-black, #000000);
        color: var(--mac-white, #ffffff);
      }
    }

    &[data-disabled] {
      color: var(--mac-dark-gray, #808080);
    }
  }
`;

interface MenuProps extends PropsWithChildren {
  actions: MenuItem[];
  isSubMenu?: boolean;
  side?: DropdownMenu.MenubarContentProps["side"];
}

export function Menu(props: MenuProps) {
  const Trigger = props.isSubMenu
    ? DropdownMenu.SubTrigger
    : DropdownMenu.Trigger;
  const Root = props.isSubMenu ? DropdownMenu.Sub : DropdownMenu.Menu;
  const Content = props.isSubMenu
    ? DropdownMenu.SubContent
    : DropdownMenu.Content;

  return (
    <Root>
      <Trigger asChild>{props.children}</Trigger>
      <DropdownMenu.Portal container={document.getElementById("virtual-screen")}>
        <Content
          align="start"
          side={props.side ?? "bottom"}
          sideOffset={0}
          style={{ zIndex: 9999 }}
        >
          <MenuContentWrapper>
            {props.actions.map((action) => {
              if ("items" in action) {
                return (
                  <Menu
                    key={action.name}
                    actions={action.items}
                    side="right"
                    isSubMenu={true}
                  >
                    <button>
                      {action.name} &#9656;
                    </button>
                  </Menu>
                );
              }

              return (
                <DropdownMenu.Item
                  disabled={action.disabled === true}
                  key={action.name}
                  onSelect={() => action.onClick()}
                  asChild
                >
                  <button>{action.name}</button>
                </DropdownMenu.Item>
              );
            })}
          </MenuContentWrapper>
        </Content>
      </DropdownMenu.Portal>
    </Root>
  );
}
