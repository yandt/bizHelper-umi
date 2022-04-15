import {PageListParams, _get, _put, _delete} from "@/utils/bhRequest";
import {Rule} from "@/pages/ums/rule/List/data";

/** 获取当前的用户 GET /swagger/openapi */
export async function getOpenApi(
  params: {
  },
  options?: { [key: string]: any }) {
  return _get('/swagger/openapi', {
    showMsg: false,
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}



/** 保存部门 PUT /api/ums/rule */
export async function saveRule(options?: { [key: string]: any }) {
  return _put<Rule>('/api/ums/rule', {
    ...(options || {}),
  });
}


/** 删除权限 DELETE /api/ums/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return _delete<number>('/api/ums/rule', {
    ...(options || {}),
  });
}

/** 获取权限列表 GET /api/ums/rule/list */
export async function getRuleList(options?: { [key: string]: any }) {
  return _get<Rule[]>('/api/ums/rule/list', {
    showMsg: false,
    ...(options || {}),
  });
}


/** 获取自定义权限 GET /api/ums/rune/defined_list */
export async function getDefinedList(
  params: PageListParams,
  options?: { [key: string]: any }) {
  return _get<Rule[]>('/api/ums/rule/defined_list', {
    showMsg:false,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
