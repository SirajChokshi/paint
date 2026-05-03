import * as DropdownMenu from "@radix-ui/react-menubar";
import { css } from "@emotion/react";
import { MenuItem, isSubMenu } from "../../types/ui";
import { PropsWithChildren } from "react";
import styled from "@emotion/styled";

const menuContentCSS = css`
  background-color: var(--mac-white);
  border: 2px solid var(--mac-black);
  box-shadow: 2px 2px 0 var(--mac-black);

  display: flex;
  flex-direction: column;
  z-index: 9999;
  padding: 2px 0;
  min-width: 160px;

  &&& button {
    all: unset;
    padding: 2px 24px 2px 18px;
    font-family: var(--chicago);
    font-size: 12px;
    line-height: 16px;
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
      color: var(--mac-dark-gray);
    }
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
        </Content>
      </DropdownMenu.Portal>
    </Root>
  );
}
