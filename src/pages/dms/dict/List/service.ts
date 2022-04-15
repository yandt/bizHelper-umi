import { request } from 'umi';
import type {DictPageList} from './data.d';


/** 获取字典页列表 GET /api/dms/dict/page_list */
export async function getDictPageList(
  params: {
    /** 上级部门ID */
    parentId?: number
  } & API.PageParams,
  options?: { [key: string]: any },
) {
  return request<DictPageList>('/api/dms/dict/page_list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getDictParentList(
  params: { dictId: number }
){

  return request('/api/dms/dict/parent_list', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}


/** 保存字典 PUT /api/dms/dict */
export async function saveDict(options?: { [key: string]: any }) {
  return request<DictPageList>('/api/dms/dict', {
    method: 'PUT',
    ...(options || {}),
  });
}


/** 删除字典 DELETE /api/dms/dict */
export async function removeDict(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/dms/dict', {
    method: 'DELETE',
    ...(options || {}),
  });
}
