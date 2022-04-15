export type MenuItem = {
  menuId?: number;
  parentId: number;
  name?: string;
  path?: string
  icon?: string;
  sortNo?: number;
  validity: 'valid'|'invalid';
  children?: MenuItem[];
  sortNo?: number;
};
