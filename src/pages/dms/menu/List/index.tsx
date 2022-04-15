import {PlusOutlined, PlusSquareFilled} from '@ant-design/icons';
import {Button, message, Popconfirm, Space, Typography} from 'antd';
import React, {useState, useRef, useEffect} from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import {ModalForm, ProFormInstance, ProFormRadio, ProFormText, ProFormTreeSelect} from '@ant-design/pro-form';
import {getMenuList, removeMenu, saveMenu, saveMenuSort} from './service';
import {MenuItem} from "./data";
import ProTable from '@ant-design/pro-table';
import {isArray} from "lodash";
import IconSelect, {BzIcon} from "@/components/IconSelect";

const { Paragraph } = Typography;

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  const [saveModalVisible, handleSaveModalVisible] = useState<boolean>(false);
  const [menuGroups, setMenuGroups] = useState<MenuItem[]>([])
  const [activeMenuGroup, setActiveMenuGroup] = useState<string>()
  const [datasource, setDatasource] = useState<MenuItem[]>([])
  const actionRef = useRef<ActionType>();
  const [currentRow, handleCurrentRow] = useState<MenuItem>();
  /** 用户信息的ref */
  const dataFormRef = useRef<ProFormInstance>();

  const loadMenuGroup = async (newMenuGroupId?: number) => {
    const mg = await getMenuList({parentId: 0, isTree: false, limit: 5})
    setMenuGroups(mg.data)
    if (mg.data.length > 0) {
      setActiveMenuGroup((newMenuGroupId || mg.data[0].menuId) + '')
      actionRef.current?.reload()
    }
  }

  useEffect( () => {
    loadMenuGroup()
  }, []);

  const columns: ProColumns<MenuItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (_, record)=>{
        return <Space>
          <>{record.icon?<BzIcon type={record.icon}/>:null}{_}</>
        </Space>
      }
    },
    {
      title: '子菜单',
      dataIndex: 'option',
      align:'center',
      render: (_, record)=>{
        return <Button
            size={'small'}
            type={'link'}
            key="config"
            title={'增加子菜单'}
            onClick={() => {
              handleSaveModalVisible(true);
              handleCurrentRow({validity: 'valid', parentId: record.menuId||0})
            }}
          >
            <PlusSquareFilled />
          </Button>

      }
    },
    {
      title: '路径',
      dataIndex: 'path'
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
      title: '排序',
      align:'center',
      dataIndex: 'sortNo',
      width: '70px',
      render: (val, row) =>{
        const mdf_order = (menu_list: MenuItem[], orderNo: number)=>{
          const _new = menu_list.map(menu=>{
            if(menu.menuId == row.menuId)
              menu.sortNo = orderNo
            if(isArray(menu.children)) {
              menu.children = mdf_order(menu.children, orderNo)
            }
            return menu
          })
          return _new
        }

        const setEditableStr = async (v: string) => {
          if (v == undefined || v.length == 0) return;
          if (!/\d+/.test(v)) {
            await message.error('排序值请输入数字')
            return
          }
          const sortNo = parseInt(v)
          const _new = mdf_order(datasource, sortNo)
          setDatasource(_new)
          await saveMenuSort({params: {menuId: row.menuId, sortNo: sortNo}})
        }
        return <Paragraph editable={{ onChange: setEditableStr }} style={{margin:0}}>{val}</Paragraph>
      },
      sorter:(a, b) => (a.sortNo||0) - (b.sortNo||0),
      sortOrder: 'descend'

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
            handleCurrentRow(record);
          }}
        >
          修改
        </a>,
        <Popconfirm
          key={'delete'}
          title={<>确认删除菜单[ {record.name} ]吗?</>}
          placement={"topRight"}
          okText="删除"
          cancelText="取消"
          onConfirm={async ()=>{
            if((record.children || [])?.length>0) {
              message.info('含子菜单，不可删除')
              return
            }
            const success = await removeMenu({
              params: { menuId: record.menuId }
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
      <ProTable<MenuItem>
        actionRef={actionRef}
        rowKey="menuId"
        defaultSize='small'
        search={false}
        expandable={{
          showExpandColumn: true,
          defaultExpandAllRows: true,
          expandRowByClick: false,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="new"
            onClick={() => {
              handleSaveModalVisible(true);
              handleCurrentRow({validity: 'valid', parentId:0, sortNo: 0})
            }}
          >
            <PlusOutlined /> 新建菜单组
          </Button>,
          <Button
            type="primary"
            key="add"
            onClick={() => {
              if(menuGroups.length==0) {
                message.error('请先新建一个菜单组，才可以新建菜单');
                return
              }
              handleSaveModalVisible(true);
              handleCurrentRow({validity: 'valid', parentId: parseInt(activeMenuGroup||'0')})
            }}
          >
            <PlusOutlined /> 新建菜单
          </Button>,
        ]}
        manualRequest={true}
        request={async params => {
          const data = await getMenuList(params)
          setDatasource(data.data);
          return [];
        }}
        params={{parentId: activeMenuGroup}}
        pagination={false}
        columns={columns}
        options={{
          search: true,
        }}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeMenuGroup,
            items: menuGroups.map(mg=>({
              key: mg.menuId+'',
              label:<span>{mg.name}</span>
            })),
            onChange: (key) => {
              // @ts-ignore
              setActiveMenuGroup(key);
            },
          }
        }}
        dataSource={datasource}

      />

      <ModalForm
        formRef={dataFormRef}
        title={currentRow!=undefined && currentRow.menuId?'修改菜单':'新增菜单'}
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
          const result = await saveMenu({
            data: value
          });

          if (result) {
            handleSaveModalVisible(false);
            if (result.data.parentId==0)
              await loadMenuGroup(result.data.menuId)
            else if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}

      >
        <ProFormText
          label={'ID'}
          name="menuId"
          hidden={true}
        />
        <ProFormTreeSelect
          hidden={currentRow?.parentId==0}
          name="parentId"
          placeholder="请选择归属菜单"
          label={'归属菜单'}
          secondary
          rules={[
            {
              required: true,
              message: '归属菜单为必选项',
            },
          ]}
          request={async () => {
            const c_list = await getMenuList({ menuId: parseInt(activeMenuGroup||"0"), isTree: true});
            return c_list.data;
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
              value: 'menuId'
            },
          }}
        />

        <ProFormText
          label={'名称'}
          rules={[
            {
              required: true,
              message: '菜单简称为必填项',
            },
          ]}
          name="name"
        />
        <ProFormText
          hidden={currentRow?.parentId==0}
          label={'路径'}
          name="path"
        />
        <IconSelect
          label={'图标'}
          name={'icon'}
        />

        <ProFormRadio.Group
          hidden={currentRow?.parentId==0}
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
      </ModalForm>
    </PageContainer>
  );
};

export default TableList;
