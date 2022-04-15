import {RequestOptionsInit} from "umi-request";
import {message} from "antd";
import {omit} from "lodash";
import {request} from "umi";


export type RequestBody<T> = {
  success: boolean;
  total?: number;
  data: T;
  errorCode?: number;
  errorMessage?: string;
}

export type PageListParams = {
  /** 当前的页码 */
  current?: number;
  /** 页面的容量 */
  pageSize?: number;
  /** 搜索关键字 */
  keyword?: string;
}

export type RequestOptions = {
  loadingMsg?: string;
  successMsg?: string;
  showMsg?: boolean;
  skipErrorHandler?: boolean | undefined;
} & RequestOptionsInit



export default async function bhRequest<T>(method: 'PUT'|'GET'|'DELETE'|'POST', url: string,
                                           options?: RequestOptions) {
  const opts: RequestOptions = {
    loadingMsg: '正在提交',
    successMsg: '提交成功',
    showMsg: true,
    ...options
  }
  const hide = opts.showMsg?message.loading(opts.loadingMsg):()=>{}

  const body = await request<RequestBody<T>>(url, {
    method: method,
    ...omit(options || {},['loadingMsg', 'successMsg'])
  })
  hide();
  if(opts.showMsg)
    message.success(opts.successMsg + ',' + body.errorMessage);
  return body
}

export async function _get<T>(url: string, options?: RequestOptions) {
  return bhRequest<T>('GET', url, options)
}

export async function _put<T>(url: string, options?: RequestOptions) {
  return bhRequest<T>('PUT', url, options)
}

export async function _post<T>(url: string, options?: RequestOptions) {
  return bhRequest<T>('POST', url, options)
}

export async function _delete<T>(url: string, options?: RequestOptions) {
  return bhRequest<T>('DELETE', url, options)
}

