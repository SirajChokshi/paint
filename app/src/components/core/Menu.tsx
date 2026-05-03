import * as DropdownMenu from "@radix-ui/react-menubar";
import { css } from "@emotion/react";
import { MenuItem, isSubMenu } from "../../types/ui";
import { PropsWithChildren } from "react";
import styled from "@emotion/styled";

const menuContentCSS = css`
  background-color: var(--mac-white);
  border: 1px solid var(--mac-black);
  box-shadow: 2px 2px 0 var(--mac-black);

  display: flex;
  flex-direction: column;
  z-index: 9999;
  padding: 1px 0;
  min-width: 140px;

  &&& button {
    all: unset;
    padding: 0 16px 0 20px;
    font-family: var(--chicago);
    font-size: 12px;
    line-height: 18px;
    height: 18px;
    cursor: default;
    white-space: nowrap;

    &:not([data-disabled]) {
      &:hover,
      &:focus {
        outline: none;
        background: var(--mac-black);
        color: var(--mac-white);
      }
    }

    &[data-disabled] {
      color: var(--mac-disabled);
    }
  }

  &&& [data-mac-separator] {
    height: 1px;
    background: var(--mac-black);
    margin: 2px 0;
  }

  &&& [data-mac-submenu-arrow] {
    float: right;
    margin-left: 16px;
  }
`;

const MenuDropdownContent = styled(DropdownMenu.Content)`
  ${menuContentCSS}
`;

const MenuDropdownSubContent = styled(DropdownMenu.SubContent)`
  ${menuContentCSS}
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
    ? MenuDropdownSubContent
    : MenuDropdownContent;

  return (
    <Root>
      <Trigger asChild>{props.children}</Trigger>
      <DropdownMenu.Portal>
        <Content align="start" side={props.side ?? "bottom"}>
          {props.actions.map((action) => {
            if (isSubMenu(action)) {
              return (
                <Menu
                  key={action.name}
                  actions={action.items}
                  side="left"
                  isSubMenu={true}
                >
                  <button>
                    {action.name}
                    <span data-mac-submenu-arrow>&#9656;</span>
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
        </Content>
      </DropdownMenu.Portal>
    </Root>
  );
}
