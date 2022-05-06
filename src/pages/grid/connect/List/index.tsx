import { PageContainer } from '@ant-design/pro-layout';
import {useState, useEffect, useRef} from 'react';
import {Alert, Button, message, Popconfirm} from 'antd';
import ProTable, {ActionType, ProColumns} from "@ant-design/pro-table";
import {Connect, Drive} from "@/pages/grid/connect/List/data";
import {PlusOutlined} from "@ant-design/icons";
import {getConnect, getConnectPageList, getDriveList, removeConnect, saveConnect, testConnect} from './service';
import ProForm, {ModalForm, ProFormInstance, ProFormRadio, ProFormSelect, ProFormText} from "@ant-design/pro-form";
import {useModel} from "@@/plugin-model/useModel";

export default () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { initialState } = useModel('@@initialState');

  const { currentUser } = initialState || {};

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [currentConnect, setCurrentConnect] = useState<Connect>();
  const [driveList, setDriveList] = useState<Drive[]>([])
  const [testResult, setTestResult] = useState<{isConn: boolean, message: string}>({isConn:true, message:''})
  const [showAlert, setShowAlert] = useState<boolean>(false)

  // 表格的ref
  const actionRef = useRef<ActionType>();
  const dataFormRef = useRef<ProFormInstance>();

  useEffect( () => {
  }, []);



  /**
   * 定义列信息
   */
  const columns: ProColumns<Connect>[] = [
    {
      title: '连接名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '连接驱动',
      dataIndex: 'drive',
      key: 'drive',
    },
    {
      title: '开放性',
      dataIndex: 'visibility',
      key: 'visibility',
      valueType: 'select',
      valueEnum: {
        private: { text: '私有', status: 'Default' },
        public: { text: '公开', status: 'Success' }
      },
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
      render: (text, row) => {
        if(currentUser != undefined && row.createUid !== currentUser?.uid)
          return []
        return [
        <a key="mdf" type={'link'} onClick={async () => {
          const connect = await getConnect(row.connectId||0)
          setCurrentConnect(connect.data)
          setSaveModalVisible(true);
        }}>编辑</a>,
        <Popconfirm
          key={'delete'}
          title={<>确认删除角色[ {row.name} ]吗?</>}
          placement={"topRight"}
          okText="删除"
          cancelText="取消"
          onVisibleChange={()=>{return}}
          onConfirm={async ()=>{
            const success = await removeConnect({
              params: {connectId: row.connectId}
            });
            if (actionRef.current && success) {
              actionRef.current.reload();
            }
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ]},
    },
  ];



  return (
    <PageContainer>
      <ProTable<Connect>
        actionRef={actionRef}
        columns={columns}
        request={getConnectPageList}
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
              setCurrentConnect({visibility: 'private', validity: 'valid'})
              setSaveModalVisible(true);
            }}
          >
            <PlusOutlined /> 新增数据连接
          </Button>,
        ]}
        rowKey="connectId"
        search={false}
      />

      {/*编辑*/}
      <ModalForm
        key={'edit'}
        formRef={dataFormRef}
        title={currentConnect != undefined && currentConnect.connectId != undefined?'编辑数据连接':'新增数据连接'}
        width="740px"
        visible={saveModalVisible}
        onVisibleChange={(visible)=>{
          if(visible) {
            dataFormRef.current?.resetFields();
            dataFormRef.current?.setFieldsValue(currentConnect);
            setShowAlert(false)
          }
          setSaveModalVisible(visible)
        }}
        onFinish={async (value) => {
          const success = await saveConnect({
            data: value
          });

          if (success) {
            setSaveModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        submitter={{
          render: (props, defaultDom) => {
            return [
              <Button
                type={'link'}
                key="OK"
                onClick={async () => {
                  setShowAlert(false)
                  const hide = message.loading('正在测试，请等待...')
                  const d = await testConnect({data:dataFormRef.current?.getFieldsValue()})
                  setShowAlert(true)
                  // @ts-ignore
                  setTestResult(d.data)
                  hide()
                }}
              >
                测试
              </Button>,
              ...defaultDom
            ];
          },
        }}
      >
        <ProFormText
          label={'连接ID'}
          name="connectId"
          hidden={true}
        />
        <ProForm.Group>
          <ProFormText
            label={'连接名称'}
            width={'md'}
            rules={[
              {
                required: true,
                message: '连接名称为必填项',
              },
            ]}
            name="name"
          />
          <ProFormSelect
            name={'drive'}
            label="连接驱动"
            width={'md'}
            request={async () => {
              const d = await getDriveList();
              setDriveList(d.data);
              return d.data;
            }}
            placeholder="请选择连接驱动"
            rules={[{ required: true, message: '请选择连接驱动' }]}
            fieldProps={{
              onChange: (value)=>{
                const sel_dri = driveList.find((d)=>{
                  return d.value == value
                })
                if(sel_dri != undefined)
                  dataFormRef.current?.setFieldsValue({
                    connectStr: sel_dri.connectStr
                  })
              }
            }}
          />
        </ProForm.Group>
        <ProFormText
          label={'连接字符串'}
          rules={[
            {
              required: true,
              message: '连接字符串为必填项',
            },
          ]}
          name="connectStr"
        />
        <ProForm.Group>
          <ProFormText
            label={'用户名'}
            width={'md'}
            rules={[
              {
                required: true,
                message: '连接字符串为必填项',
              },
            ]}
            name="username"
          />
          <ProFormText.Password
            label={'密码'}
            width={'md'}
            rules={[
              {
                required: true,
                message: '连接字符串为必填项',
              },
            ]}
            name="password"
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormRadio.Group
            name={'visibility'}
            label={"是否公用"}
            radioType="button"
            rules={[
              {
                required: true,
                message: '是否公用为必选项',
              },
            ]}
            fieldProps={{
              defaultValue: 'private',
              buttonStyle: 'solid'
            }}
            options={[
              {
                label: '私有',
                value: 'private',

              },
              {
                label: '公用',
                value: 'public',
              }
            ]}
          />
        <ProFormRadio.Group
          name={'validity'}
          label={"是否有效"}
          radioType="button"
          rules={[
            {
              required: true,
              message: '是否有效为必选项',
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
        {
          showAlert?
          <Alert
            closable={testResult.isConn}
            message={'测试' + (testResult?.isConn ? "成功" : "失败:") + (testResult.message || '')}
            type={testResult?.isConn ? "success" : "error"}
            showIcon

          />:null
        }
      </ModalForm>

    </PageContainer>
  );
};
