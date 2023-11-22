import * as DropdownMenu from "@radix-ui/react-menubar";
import { css } from "@emotion/react";
import { MenuItem, isSubMenu } from "../../types/ui";
import { PropsWithChildren } from "react";
import styled from "@emotion/styled";

const menuContentCSS = css`
  background-color: #fff;
  border: 2px solid black;
  box-shadow: 2px 2px black;

  display: flex;
  flex-direction: column;
  z-index: 9999;

  &&& button {
    all: unset;
    padding: 0 1rem;
    font-size: 1.125rem;
    cursor: pointer;

    &:hover,
    &:focus {
      outline: none;
      background: black;
      color: white;
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
  // menu actions cannot be overloaded
  actions: MenuItem[];
  isSubMenu?: boolean;
  side?: DropdownMenu.MenuContentProps["side"];
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
                  <button>{action.name}</button>
                </Menu>
              );
            }

            return (
              <DropdownMenu.Item
                key={action.name}
                onSelect={action.onClick}
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
