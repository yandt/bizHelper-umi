import { PlusOutlined } from '@ant-design/icons';
import {Button, message, Popconfirm, Typography} from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProForm, {ModalForm, ProFormInstance, ProFormRadio, ProFormText, ProFormTreeSelect} from '@ant-design/pro-form';
import {getCompanyList, getCompanyPageList, removeCompany, saveCompany} from './service';
import {CompanyListItem} from "./data";


const {Text} = Typography

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  const [saveModalVisible, handleSaveModalVisible] = useState<boolean>(false);


  const actionRef = useRef<ActionType>();
  const [currentRow, handleCurrentRow] = useState<CompanyListItem>();
  /** 用户信息的ref */
  const dataFormRef = useRef<ProFormInstance>();

  const columns: ProColumns<CompanyListItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (_, row)=>{
        return <>{_}<Text keyboard>{row.code}</Text></>
      }
    },
    {
      title: '简称',
      dataIndex: 'shortName'
    },
    {
      title: '状态',
      dataIndex: 'validity',
      hideInForm: true,
      valueEnum: {
        'invalid': {
          text: '无效',
          status: 'Default',
        },
        'valid': {
          text: '有效',
          status: 'Success',
        }
      },
    },
    {
      title: '操作',
      width: '200px',
      align: 'center',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleSaveModalVisible(true);
            handleCurrentRow({validity: 'valid', parentId: record.companyId})
          }}
        >
          新增
        </a>,
        <a
          key="config"
          onClick={() => {
            handleSaveModalVisible(true);
            handleCurrentRow(record);
          }}
        >
          修改
        </a>,
        <Popconfirm
          title={<>确认删除部门[ {record.name} ]吗?</>}
          placement={"topRight"}
          okText="删除"
          cancelText="取消"
          onConfirm={async ()=>{
            if((record.children || [])?.length>0) {
              message.info('含子部门，不可删除')
              return
            }
            const success = await removeCompany({
              params: {companyId: record.companyId}
            });
            if (actionRef.current && success) {
              actionRef.current.reload();
            }
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];


  return (
    <PageContainer>
      <ProTable<CompanyListItem, API.PageParams>
        actionRef={actionRef}
        rowKey="companyId"
        defaultSize='small'
        search={false}
        expandable={{
          showExpandColumn: true,
          expandRowByClick: false,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleSaveModalVisible(true);
              handleCurrentRow({validity: 'valid', parentId: 0})
            }}
          >
            <PlusOutlined /> 新建部门
          </Button>,
        ]}
        request={getCompanyPageList}
        columns={columns}
        pagination={{
          pageSize: 12
        }}
        options={{
          search: true,

        }}

      />

      <ModalForm
        formRef={dataFormRef}
        title={currentRow!=undefined && currentRow.companyId?'修改部门':'新增部门'}
        width="650px"
        visible={saveModalVisible}
        onVisibleChange={(visible)=>{
          handleSaveModalVisible(visible)
          if(visible){
            dataFormRef.current?.resetFields();
            dataFormRef.current?.setFieldsValue(currentRow)
          }

        }}
        onFinish={async (value) => {
          const success = await saveCompany({
            data: value
          });

          if (success) {
            handleSaveModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}

      >
        <ProFormText
          label={'ID'}
          name="companyId"
          hidden={true}
        />
        <ProFormTreeSelect
          name="parentId"
          placeholder="请选择归属部门"
          width={'xl'}
          label={'归属部门'}
          secondary
          rules={[
            {
              required: true,
              message: '归属部门为必选项',
            },
          ]}
          request={async () => {
            const c_list = await getCompanyList({parentId: 0});
            const root_node: CompanyListItem[] = [{companyId:0, name:'总部', children: undefined, validity:'valid'}];
            return root_node.concat(c_list.data);
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
            },
          }}
        />
        <ProForm.Group>

          <ProFormText
            label={'代码'}
            width={'md'}
            rules={[
              {
                required: true,
                message: '部门代码为必填项',
              },
            ]}
            name="code"
          />
          <ProFormText
            label={'简称'}
            rules={[
              {
                required: true,
                message: '部门名称为必填项',
              },
            ]}
            name="shortName"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            label={'名称'}
            width={'md'}
            rules={[
              {
                required: true,
                message: '部门简称为必填项',
              },
            ]}
            name="name"
          />
          <ProFormRadio.Group
            name={'validity'}
            label={"是否有效"}
            radioType="button"
            fieldProps={{
              defaultValue: 'valid',
              buttonStyle: 'solid'
            }}
            options={[
              {
                label: '有效',
                value: 'valid',

              },
              {
                label: '无效',
                value: 'invalid',
              }
            ]}
          />
        </ProForm.Group>
      </ModalForm>
    </PageContainer>
  );
};

export default TableList;
