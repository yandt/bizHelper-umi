
export type Role = {
  roleId?: number;
  type: 'data'|'function';
  name?: string;
  attribute?: {
    rules: number[],
    expr: string
  };
  validity: 'valid'|'invalid';
  insertTime?: Date
}
