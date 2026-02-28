export interface SubMenu {
  name: string;
  items: MenuItem[];
}

export interface Action {
  name: string;
  onClick: () => void;
  disabled?: boolean;
}

export type MenuItem = SubMenu | Action;

export const isSubMenu = (item: MenuItem): item is SubMenu => {
  return (item as SubMenu).items !== undefined;
};
