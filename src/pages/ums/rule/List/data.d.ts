export type Rule = {
  ruleId?: number;
  type: 'front'|'back'|'defined';
  name?: string;
  validity: 'valid'|'invalid';
  path?: string;
}

export type ApiPath = {
  path: string;
  name?: string;
  level?: number;
  method?: {
    type: 'get'|'put'|'post'|'delete';
    summary: string;
    description?: string;
    operationId?: string;
  }[];
  children?: apiPath[];
  description?: string;
  type?: 'path'|'method',
  rule?: Rule
};
