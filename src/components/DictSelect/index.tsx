import React from 'react';
import { useModel } from 'umi';
import {DictListItemType} from "@/pages/dms/dict/List/data";
import {ProFormTreeSelect} from "@ant-design/pro-form";
import {ProFormFieldItemProps, ProFormFieldRemoteProps} from "@ant-design/pro-form/lib/interface";
import {TreeSelectProps} from "antd";
import {request} from "@@/plugin-request/request";

export type DictSelectProps = {
  path: string,
  isTop?: boolean,
  nodeType?: 'folder'|'node',
  valueField?: 'dictId'|'value',
  includeRootNode?: boolean,
  onSelect?: Function
} & ProFormFieldItemProps<TreeSelectProps<any>> & ProFormFieldRemoteProps


/** 获取部门页列表 GET /api/pub/dict_list */
export async function getDictTree(
  options?: { [key: string]: any },
) {
  return request<{
    data: DictListItemType[];
    success?: boolean;
  }>('/api/pub/dict_tree', {
    method: 'GET',
    ...(options || {}),
  });
}

const DictSelectTree: React.FC<DictSelectProps> = (props) => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }


  return (
    <ProFormTreeSelect
      placeholder="请选择"
      label={'归属字典'}
      secondary

      request={async () => {
        const c_list = await getDictTree({
          params: {
            path: props.path,
            nodeType: props.nodeType,
            isTop: props.isTop
          }
        });
        let data = c_list.data
        if(props.includeRootNode){
          const rootList: DictListItemType[] = [{
            dictId: 0,
            parentId: 0,
            name: '根目录',
            isFolder: 1,
            validity: 'valid',
            children: data
          }]
          data = rootList
        }
        return data
      }}
      // tree-select args
      fieldProps={{
        showArrow: true,
        filterTreeNode: true,
        showSearch: true,
        dropdownMatchSelectWidth: false,
        labelInValue: false,
        autoClearSearchValue: true,
        multiple: false,
        treeNodeFilterProp: 'name',
        fieldNames: {
          label: 'name',
          value: props.valueField || 'dictId'
        },
        treeLine: {showLeafIcon: false, showLine: true},
        treeDefaultExpandedKeys:[0],
      }}
      {...props}
    />
  );
};

export default DictSelectTree;
