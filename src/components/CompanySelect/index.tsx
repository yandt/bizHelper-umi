import React from 'react';
import { useModel } from 'umi';
import {CompanyListItem} from "@/pages/ums/company/List/data";
import {ProFormTreeSelect} from "@ant-design/pro-form";
import {ProFormFieldItemProps, ProFormFieldRemoteProps} from "@ant-design/pro-form/lib/interface";
import {TreeSelectProps} from "antd";
import {request} from "@@/plugin-request/request";

export type CompanySelectProps = {

} & ProFormFieldItemProps<TreeSelectProps<any>> & ProFormFieldRemoteProps


/** 获取部门页列表 GET /api/pub/company_list */
export async function getCompanyList(
  options?: { [key: string]: any },
) {
  return request<{
    data: CompanyListItem[];
    success?: boolean;
  }>('/api/pub/company_list', {
    method: 'GET',
    ...(options || {}),
  });
}

const CompanySelectTree: React.FC<CompanySelectProps> = (props) => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }


  return (
    <ProFormTreeSelect
      placeholder="请选择归属机构"
      label={'归属部门'}
      secondary
      request={async () => {
        const c_list = await getCompanyList();
        return c_list.data
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
          value: 'companyId'
        }
      }}
      {...props}
    />
  );
};

export default CompanySelectTree;
