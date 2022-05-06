import {Connect, Drive} from "@/pages/grid/connect/List/data";
import bh_request, {PageListParams, RequestOptions} from "@/utils/bhRequest";


/** 保存数据连接 PUT /api/grid/connect */
export async function getConnect(connectId: number, options?: RequestOptions) {
  return bh_request<Connect>('GET','/api/grid/connect', {
    showMsg: false,
    params: { connectId },
    ...(options || {}),
  });
}

/** 保存数据连接 PUT /api/grid/connect */
export async function testConnect(options?: RequestOptions) {
  return bh_request<Connect>('PUT','/api/grid/connect/test', {
    showMsg: false,
    ...(options || {}),
  });
}

/** 保存数据连接 PUT /api/grid/connect */
export async function saveConnect(options?: RequestOptions) {
  return bh_request<Connect>('PUT','/api/grid/connect', {
    ...(options || {}),
  });
}


/** 删除数据连接 DELETE /api/grid/connect */
export async function removeConnect(options?: RequestOptions) {
  return bh_request<number>('DELETE', '/api/grid/connect', {
    ...(options || {}),
  });
}

/** 获取数据连接列表 GET /api/grid/connect/list */
export async function getConnectList(options?: RequestOptions) {
  return bh_request<Connect[]>('GET','/api/grid/connect/list', {
    showMsg: false,
    ...(options || {}),
  });
}


/** 获取数据连接页列表 GET /api/grid/rune/page_list */
export async function getConnectPageList(
  params: PageListParams,
  options?: RequestOptions) {
  return bh_request<Connect[]>('GET', '/api/grid/connect/page_list', {
    showMsg: false,
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取数据连接列表 GET /api/grid/connect/list/{type} */
export async function getDriveList(options?: RequestOptions) {
  return bh_request<Drive[]>('GET','/api/grid/connect/drive_list', {
    showMsg: false,
    ...(options || {}),
  });
}
