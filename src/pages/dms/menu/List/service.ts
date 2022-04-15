// @ts-ignore
/* eslint-disable */
import bh_request, {PageListParams, RequestOptions, _get} from '@/utils/bhRequest';
import { MenuItem } from './data';

/** 获取部门页列表 GET /api/umn/menu/list */
export async function getMenuList(params:
  {
    menuId?: number;
    parentId?: number;
    isTree?: boolean;
    limit?: number
  } & PageListParams, options?: RequestOptions
) {
  return _get<MenuItem[]>( '/api/dms/menu/list', {
    showMsg: false,
    params: { ...params },
    ...(options || {}),
  });
}

/** 保存菜单 PUT /api/dms/menu */
export async function saveMenu(options?: RequestOptions){
  return bh_request<MenuItem>('PUT','/api/dms/menu', {
    ...(options || {}),
  });
}


/** 保存菜单 PUT /api/dms/menu/sort */
export async function saveMenuSort(options?: RequestOptions){
  return bh_request<MenuItem>('PUT','/api/dms/menu/sort', {
    showMsg: false,
    ...(options || {}),
  });
}


/** 删除菜单 DELETE /api/dms/menu */
export async function removeMenu(options?: RequestOptions) {
  return bh_request<Record<string, any>>('DELETE','/api/dms/menu', {
    ...(options || {}),
  });
}
