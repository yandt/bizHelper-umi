import {Role} from "@/pages/ums/role/List/data";
import bh_request, {PageListParams, RequestOptions} from "@/utils/bhRequest";


/** 保存角色 PUT /api/ums/role */
export async function getRole(roleId: number, options?: RequestOptions) {
  return bh_request<Role>('GET','/api/ums/role', {
    showMsg: false,
    params: { roleId },
    ...(options || {}),
  });
}

/** 保存角色 PUT /api/ums/role */
export async function saveRole(options?: RequestOptions) {
  return bh_request<Role>('PUT','/api/ums/role', {
    ...(options || {}),
  });
}


/** 删除角色 DELETE /api/ums/role */
export async function removeRole(options?: RequestOptions) {
  return bh_request<number>('DELETE', '/api/ums/role', {
    ...(options || {}),
  });
}

/** 获取角色列表 GET /api/ums/role/list/{type} */
export async function getRoleList(type: string, options?: RequestOptions) {
  return bh_request<Role[]>('GET','/api/ums/role/list/'+type, {
    showMsg: false,
    ...(options || {}),
  });
}


/** 获取角色页列表 GET /api/ums/rune/page_list */
export async function getRolePageList(
  params: PageListParams,
  options?: RequestOptions) {
  return bh_request<Role[]>('GET', '/api/ums/role/page_list', {
    showMsg: false,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
