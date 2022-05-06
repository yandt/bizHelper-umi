
export type Connect = {
  connectId?: number;
  name?: string;
  drive?: string;
  connectStr?: string;
  username?: string;
  createUid?: int;
  visibility: "public" | "private";
  attribute?: {};
  validity: 'valid'|'invalid';
  insertTime?: Date
}

export type Drive = {
  label: string,
  value: string,
  connectStr: string
}
