export type CompanyListItem = {
  companyId?: number;
  parentId?: number;
  name?: string;
  code?: string;
  shortName?: string;
  validity: 'valid'|'invalid';
  children?: CompanyListItem[]
};

export type PageListPagination = {
  total: number;
  pageSize: number;
  current: number;
};

export type TableListData = {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
};

export type TableListParams = {
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: Record<string, any[]>;
  sorter?: Record<string, any>;
};
