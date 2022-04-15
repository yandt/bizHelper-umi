import { PageContainer } from '@ant-design/pro-layout';
import {useState, useEffect, useRef} from 'react';
import {Button, Popconfirm, Tag, Transfer} from 'antd';
import ProTable, {ActionType, ProColumns} from "@ant-design/pro-table";
import {Role} from "@/pages/ums/role/List/data";
import {PlusOutlined} from "@ant-design/icons";
import {getRole, getRolePageList, removeRole, saveRole} from './service';
import ProForm, {ModalForm, ProFormInstance, ProFormRadio, ProFormText} from "@ant-design/pro-form";
import {Rule} from "@/pages/ums/rule/List/data";
import {getRuleList} from "@/pages/ums/rule/List/service";



export default () => {

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [activeKey, setActiveKey] = useState<'data'|'function'>('function');
  const [currentRole, setCurrentRole] = useState<Role>();
  const [ruleList, setRuleList] = useState<Rule[]>([])
  const [ruleKeys, setRuleKeys] = useState<string[]>([])
  const [editBtnLoadingId, setEditBtnLoadingId] = useState<number>(0)

  // 表格的ref
  const actionRef = useRef<ActionType>();
  const dataFormRef = useRef<ProFormInstance>();

  useEffect( () => {
    getRuleList().then(data=>setRuleList(data.data))
  }, []);



  /**
   * 定义列信息
   */
  const columns: ProColumns<Role>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'validity',
      key: 'status',
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
      render: (text, row) => [
        <Button key="mdf" type={'link'} loading={editBtnLoadingId==row.roleId} onClick={async () => {
          setEditBtnLoadingId(row.roleId||0)
          const role = await getRole(row.roleId||0)
          setCurrentRole(role.data)
          setRuleKeys(role.data.attribute?.rules?.map(rid=>rid+'')||[])
          setSaveModalVisible(true);
          setEditBtnLoadingId(0)
        }}>编辑</Button>,
        <Popconfirm
          key={'delete'}
          title={<>确认删除角色[ {row.name} ]吗?</>}
          placement={"topRight"}
          okText="删除"
          cancelText="取消"
          onVisibleChange={()=>{return}}
          onConfirm={async ()=>{
            const success = await removeRole({
              params: {roleId: row.roleId}
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
      <ProTable<Role>
        actionRef={actionRef}
        columns={columns}
        request={getRolePageList}
        params={{type: activeKey}}
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
              setCurrentRole({validity: 'valid', type: activeKey})
              setRuleKeys([])
              setSaveModalVisible(true);

            }}
          >
            <PlusOutlined /> 新增{activeKey=='function'?'功能':'数据'}角色
          </Button>,
        ]}
        rowKey="roleId"
        search={false}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                key: 'function',
                label: <span key={'function'}>功能角色</span>,
              },
              {
                key: 'data',
                label: <span key={'data'}>数据角色</span>,
              }
            ],
            onChange: (key) => {
              // @ts-ignore
              setActiveKey(key);
              actionRef.current?.reload()
            },
          }
        }}
      />

      {/*编辑角色*/}
      <ModalForm
        key={'edit'}
        formRef={dataFormRef}
        title={currentRole != undefined && currentRole.roleId != undefined?'编辑功能角色':'新增功能角色'}
        width="800px"
        visible={saveModalVisible}
        onVisibleChange={(visible)=>{
          if(visible) {
            dataFormRef.current?.resetFields();
            dataFormRef.current?.setFieldsValue(currentRole);
          }
          setSaveModalVisible(visible)
        }}
        onFinish={async (value) => {
          const success = await saveRole({
            data: {...value, ...{attribute: {rules: ruleKeys.map(k=>parseInt(k))}}}
          });

          if (success) {
            setSaveModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          label={'角色ID'}
          name="roleId"
          hidden={true}
        />
        <ProFormText
          label={'类型'}
          name="type"
          hidden={true}
        />
        <ProForm.Group>
        <ProFormText
          label={'角色名称'}
          width={'xl'}
          rules={[
            {
              required: true,
              message: '角色名称为必填项',
            },
          ]}
          name="name"
        />
        <ProFormRadio.Group
          name={'validity'}
          label={"是否有效"}
          radioType="button"
          rules={[
            {
              required: true,
              message: '角色名称为必填项',
            },
          ]}
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
        <Transfer
          dataSource={ruleList}
          showSearch
          titles={['待授权', '已授权']}
          operations={['授权', '删权']}
          listStyle={{
            width: '100%',
            height: 400,
          }}

          targetKeys={ruleKeys}
          // onChange={onChange}
          onChange={(targetKeys1)=>{
            setRuleKeys(targetKeys1)
          }}
          // onScroll={onScroll}
          rowKey={row => row.ruleId+''}
          render={(row: Rule) => {
            const tags = {
              back: [<Tag color="#f50">后端</Tag>, '后端'],
              front: [<Tag color="#2db7f5">前端</Tag>, '前端'],
              defined: [<Tag color="#87d068">自定义</Tag>, '自定义']
            }
            const label = <div key={row.ruleId}>{tags[row.type][0]}{row.name}</div>
            return {
              label,
              value: tags[row.type][1] + '-' +row.name
            }

          }}
        />
      </ModalForm>

    </PageContainer>
  );
};
