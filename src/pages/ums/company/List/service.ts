// @ts-ignore
/* eslint-disable */
import bhRequest from '@/utils/bhRequest';
import { CompanyListItem } from './data';

/** 获取部门页列表 GET /api/umn/company/page_list */
export async function getCompanyPageList(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
    /** 上级部门ID */
    parentId?: number
  },
  options?: { [key: string]: any },
) {
  return bhRequest<CompanyListItem[]>('GET','/api/ums/company/page_list', {
    showMsg: false,
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取部门页列表 GET /api/umn/company/list */
export async function getCompanyList(
  params: {
    // query
    /** 上级部门ID */
    parentId?: number
  },
  options?: { [key: string]: any },
) {
  return bhRequest<CompanyListItem[]>('GET','/api/ums/company/list', {
    showMsg: false,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 保存部门 PUT /api/ums/company */
export async function saveCompany(options?: { [key: string]: any }) {
  return bhRequest<CompanyListItem>('PUT','/api/ums/company', {
    ...(options || {}),
  });
}


/** 删除部门 DELETE /api/ums/company */
export async function removeCompany(options?: { [key: string]: any }) {
  return bhRequest<Record<string, any>>('DELETE','/api/ums/company', {
    method: 'DELETE',
    ...(options || {}),
  });
}
