import {API} from "@/services/ant-design-pro/typings";

export type DictListItemType = {
  dictId?: number;
  parentId: number;
  name?: string;
  value?: string;
  path?: string;
  isFolder: number;
  validity: 'valid' | 'invalid';
  insertTime?: Date;
  modifyTime?: Date;
  parentName?: string,
  children?: DictListItemType[]
};


export type DictPageList = {
  data: DictListItemType[];
}
