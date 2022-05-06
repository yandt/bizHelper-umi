import bh_request, {RequestOptions} from "@/utils/bhRequest";
import {Console} from "@/pages/grid/console/List/data";


/** 保存数据连接 PUT /api/grid/console */
export async function getConsole(consoleId: number, options?: RequestOptions) {
  return bh_request<Console>('GET','/api/grid/console', {
    showMsg: false,
    params: { consoleId },
    ...(options || {}),
  });
}


/** 保存数据连接 PUT /api/grid/console */
export async function saveConsole(options?: RequestOptions) {
  return bh_request<Console>('PUT','/api/grid/console', {
    ...(options || {}),
  });
}


/** 删除数据连接 DELETE /api/grid/console */
export async function removeConsole(options?: RequestOptions) {
  return bh_request<number>('DELETE', '/api/grid/console', {
    ...(options || {}),
  });
}

/** 获取数据连接列表 GET /api/grid/console/list */
export async function getConsoleTree(options?: RequestOptions) {
  return bh_request<Console[]>('GET','/api/grid/console/tree', {
    showMsg: false,
    ...(options || {}),
  });
}


/** 保存数据连接 PUT /api/grid/console */
export async function executeConsole(options?: RequestOptions) {
  return bh_request<Console>('PUT','/api/grid/console/execute', {
    ...(options || {}),
  });
}




