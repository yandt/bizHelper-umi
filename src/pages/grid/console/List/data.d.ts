
export type Console = {
  consoleId?: number;
  connectId?: number;
  parentId?: number;
  name: string;
  tableName?: string;
  content?: string;
  comment?: string;
  attribute?: {};
  isFolder?: number;
  insertTime?: Date;
  children?: Console[]
}

