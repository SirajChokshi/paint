export interface SubMenu {
  name: string;
  items: MenuItem[];
}

export interface Action<T> {
  name: string;
  onClick: (args: T) => void;
  disabled?: boolean;
}

export type MenuItem = SubMenu | Action<any>;

export const isSubMenu = (item: MenuItem): item is SubMenu => {
  return (item as SubMenu).items !== undefined;
};
