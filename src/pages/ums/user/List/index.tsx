import { PageContainer } from '@ant-design/pro-layout';
import {useState, useEffect, useRef} from 'react';
import ProTable, {ActionType, ProColumns, TableDropdown} from "@ant-design/pro-table";
import {deleteUser, getUserList, saveUser, updateUserPassword, updateUserRoles} from '@/pages/ums/user/List/service';
import {Button, Popconfirm} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ProForm, {ModalForm, ProFormInstance, ProFormRadio, ProFormSelect, ProFormText} from "@ant-design/pro-form";
import CompanySelectTree from "@/components/CompanySelect";
import { getRoleList } from '../../role/List/service';


export default () => {
  // 用户编辑窗口的弹窗
  const [saveModalVisible, handleSaveModalVisible] = useState<boolean>(false);
  // 修改密码的弹窗
  const [updatePasswordModalVisible, handleUpdatePasswordModalVisible] = useState<boolean>(false);
  // 权限分配弹窗
  const [roleModalVisible, setRoleModalVisible] = useState<boolean>(false);
  const [currentRow, handleCurrentRow] = useState<UserListItem>({validity: 'valid'})
  // 表格的ref
  const actionRef = useRef<ActionType>();
  // 用户信息的ref
  const dataFormRef = useRef<ProFormInstance>();
  // 密码修改ref
  const pwdFormRef = useRef<ProFormInstance>();

  const roleFormRef = useRef<ProFormInstance>();

  useEffect(() => {

  }, []);

  /**
   * 定义列信息
   */
  const columns: ProColumns<UserListItem>[] = [
    {
      title: '用户名',
      dataIndex: 'nick',
      key: 'nick',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '归属部门',
      dataIndex: ['company','name'],
      key: 'company',
    },
    {
      title: '状态',
      dataIndex: 'validity',
      key: 'status',
      initialValue: 'all',
      filters: true,
      onFilter: true,
      valueType: 'select',
      valueEnum: {
        valid: { text: '有效', status: 'Success' },
        invalid: { text: '无效', status: 'Default' }
      },

    },
    {
      title: '创建时间',
      align:'center',
      key: 'insertTime',
      dataIndex: 'insertTime',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      align:'center',
      key: 'option',
      width: 200,
      valueType: 'option',
      render: (text, row,_,action) => [
        <a key="mdf" onClick={async () => {
          handleSaveModalVisible(true);
          handleCurrentRow(row)
        }}>编辑</a>,
        <a key="rule" onClick={async ()=>{
          setRoleModalVisible(true)
          handleCurrentRow(row)
        }}>权限</a>,
        <Popconfirm
          key={'delete'}
          title={<>确认删除用户[ {row.nick} ]吗?</>}
          placement={"topRight"}
          okText="删除"
          cancelText="取消"
          onVisibleChange={()=>{return}}
          onConfirm={async ()=>{
            const success = await deleteUser({
              params:{uid: row.uid}
            });
            if (actionRef.current && success) {
              actionRef.current.reload();
            }
          }}
        >
          <a>删除</a>
        </Popconfirm>,
        <TableDropdown
          key="actionGroup"
          onSelect={() => action?.reload()}
          menus={[
            {
              key: 'pwd', name: '修改密码' , onClick: async () => {
                handleCurrentRow(row)
                handleUpdatePasswordModalVisible(true)
              }},
          ]}
        />
      ],
    },
  ];

  // @ts-ignore
  return (
    <PageContainer>
      {/*表格*/}
      <ProTable<UserListItem, API.PageParams>
        actionRef={actionRef}
        columns={columns}
        request={getUserList}
        defaultSize='small'
        pagination={{
          pageSize: 12
        }}
        options={{
          search: true,

        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="add"
            onClick={() => {
              handleCurrentRow({validity: 'valid'})
              handleSaveModalVisible(true);
            }}
          >
            <PlusOutlined /> 新增用户
          </Button>
        ]}
        rowKey="uid"
        search={false}
        dateFormatter="string"
      />

      {/*编辑用户*/}
      <ModalForm
        key={'edit'}
        formRef={dataFormRef}
        title={currentRow != undefined && currentRow.uid != undefined?'编辑用户':'新增用户'}
        width="650px"
        visible={saveModalVisible}
        onVisibleChange={(visible)=>{
          handleSaveModalVisible(visible)
          if(visible) {
            dataFormRef.current?.resetFields();
            dataFormRef.current?.setFieldsValue(currentRow);
          }

        }}
        onFinish={async (value) => {
          const success = await saveUser({
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
          label={'用户ID'}
          name="uid"
          hidden={true}
        />

        <ProForm.Group>

          <ProFormText
            label={'用户名'}
            width={'md'}
            rules={[
              {
                required: true,
                message: '用户名为必填项',
              },
            ]}
            name="nick"
          />
          <ProFormText
            label={'姓名'}
            rules={[
              {
                required: true,
                message: '姓名为必填项',
              },
            ]}
            name="name"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            label={'电子邮件'}
            width={'md'}
            rules={[
              {
                type: 'email'
              },
            ]}
            name="email"
          />
          <ProFormText
            label={'手机号'}
            rules={[
              {
                type: 'regexp',
                message: '手机号格式不正确',
                pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
              },
            ]}
            name="mobile"
          />
        </ProForm.Group>
        <ProForm.Group>
          <CompanySelectTree
            label={'归属机构'}
            width={'md'}
            rules={[
              {
                required: true,
                message: '请选择归属部门'
              },
            ]}
            name="companyId"
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

      {/*修改用户密码*/}
      <ModalForm
        key={'pwd'}
        formRef={pwdFormRef}
        title={'修改密码'}
        width="500px"
        visible={updatePasswordModalVisible}
        onVisibleChange={(visible)=>{
          handleUpdatePasswordModalVisible(visible)
          if(visible) {
            pwdFormRef.current?.resetFields()
            pwdFormRef.current?.setFieldsValue(currentRow)
          }
        }}
        onFinish={async (value) => {
          const success = await updateUserPassword({
            crduFunc: updateUserPassword,
            data: value
          });

          if (success) {
            handleUpdatePasswordModalVisible(false);
            pwdFormRef.current?.setFieldsValue(undefined)
          }
        }}
      >
        <ProFormText
          label={'用户ID'}
          name="uid"
          hidden={true}
        />
        <ProForm.Group>

          <ProFormText
            readonly={true}
            label={'用户名'}
            width={'md'}
            name="nick"
          />
          <ProFormText
            label={'姓名'}
            width={'md'}
            readonly={true}
            name="name"
          />
        </ProForm.Group>
        <ProFormText.Password
          label={'密码'}
          rules={[
            {
              required: true,
              message: '请输入密码',
            },{

            },
          ]}
          name="password"
        />
        <ProFormText.Password
          label={'重复密码'}
          rules={[
            {
              required: true,
              message: '请输入重复密码',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次密码输入不一致'));
              },
            }),
          ]}
          name="re_password"
        />

      </ModalForm>

      {/*角色分配*/}
      <ModalForm
        key={'role'}
        formRef={roleFormRef}
        title={''}
        width="500px"
        visible={roleModalVisible}
        onVisibleChange={(visible)=>{
          setRoleModalVisible(visible)
          if(visible) {
            roleFormRef.current?.resetFields()
            roleFormRef.current?.setFieldsValue(currentRow)
          }
        }}
        onFinish={async (value) => {
          const success = await updateUserRoles({
            crduFunc: updateUserRoles,
            data: value
          });

          if (success) {
            setRoleModalVisible(false);
            actionRef.current?.reload()
          }
        }}
      >
        <ProFormText
          label={'用户ID'}
          name="uid"
          hidden={true}
        />
        <ProForm.Group>
          <ProFormText
            readonly={true}
            label={'用户名'}
            width={'md'}
            name="nick"
          />
          <ProFormText
            label={'姓名'}
            width={'md'}
            readonly={true}
            name="name"
          />
        </ProForm.Group>
        <ProFormSelect
          name={["attribute","functionRoles"]}
          label="功能角色"
          mode={'multiple'}
          request={async () => {
            const d = await getRoleList('function',{params:{validity: 'valid'}})
            return d.data.map(role=>{
              return {
                label: role.name,
                value: role.roleId
              }
            })
          }}
          placeholder="请选择功能权限角色"
          rules={[{ required: true, message: '请选择功能权限角色!' }]}
        />
        <ProFormSelect
          name={["attribute","dataRoles"]}
          label="数据角色"
          mode={'multiple'}
          request={async () => {
            const d = await getRoleList('data', {params:{validity: 'valid'}})
            return d.data.map(role=>{
              return {
                label: role.name,
                value: role.roleId
              }
            })
          }}
          placeholder="选择数据权限角色"
          rules={[{ required: true, message: '请选择数据权限角色!' }]}
        />

      </ModalForm>

    </PageContainer>
  );
};
