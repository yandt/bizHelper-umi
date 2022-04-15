// @ts-ignore
/* eslint-disable */
import bh_request from "@/utils/bhRequest";

/** 获取当前的用户 GET /api/ums/user/list */
export async function getUserList(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
    /** 搜索关键字 */
    keyword?: string;
  },
  options?: { [key: string]: any }) {
  return bh_request<UserListItem[]>('GET','/api/ums/user/list', {
    showMsg: false,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}


/** 新建用户 POST /api/ums/user */
export async function saveUser(options?: { [key: string]: any }) {
  return bh_request<UserListItem>('PUT','/api/ums/user', {
    ...(options || {}),
  });
}


/** 修改用户密码 PUT /api/ums/user/password */
export async function updateUserPassword(options?: { [key: string]: any }) {
  return bh_request<UserListItem>('PUT','/api/ums/user/password', {
    ...(options || {}),
  });
}


/** 修改用户角色 PUT /api/ums/user */
export async function updateUserRoles(options?: { [key: string]: any }) {
  return bh_request<UserListItem>('PUT','/api/ums/user', {
    ...(options || {}),
  });
}


/** 删除用户 DELETE /api/ums/user */
export async function deleteUser(options?: { [key: string]: any }) {
  return bh_request<number>('DELETE','/api/ums/user', {
    ...(options || {}),
  });
}
