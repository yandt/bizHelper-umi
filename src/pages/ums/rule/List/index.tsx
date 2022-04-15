import { PageContainer } from '@ant-design/pro-layout';
import {useState, useEffect, useRef} from 'react';
import {getDefinedList, getOpenApi, getRuleList, removeRule, saveRule} from './service';
import ProTable, {ActionType, ProColumns} from "@ant-design/pro-table";
import {ApiPath, Rule} from "@/pages/ums/rule/List/data";

import style from "./index.less";
import {ModalForm, ProFormInstance, ProFormRadio, ProFormText} from "@ant-design/pro-form";
import {Button, Popconfirm, Typography} from "antd";
import {EditFilled, LockTwoTone, PlusOutlined, UnlockTwoTone} from "@ant-design/icons";
// @ts-ignore
import routes from '/config/routes';

const { Text } = Typography;

const buildApiTree = (apiList: ApiPath[], ruleList: Rule[]) => {
  const treeRoot: ApiPath[] | undefined = [];
  const paths: string[] = []
  apiList.forEach((item) => {
    const nodeArray = item.path.split('/');
    // 递归
    let children: ApiPath[] | undefined = treeRoot;

    // 构建根节点
    if (children?.length == 0) {
      const root: ApiPath = {
        path: '/',
        name: nodeArray[0],
        type: 'path'
      };
      if (nodeArray.length > 1) {
        root.children = [];
      }
      children.push(root);
    } else {
      // 循环构建子节点
      let curPath = ''
      nodeArray.forEach((value, i) => {
        // console.log("i:" + i);
        // console.log("nodeArray:" + nodeArray);
        if(i>0)
          curPath += '/'+value
        paths.push(curPath)
        const findRule = (rule: Rule) => {
          return rule.path == curPath
        }
        const node: ApiPath = {
          path: curPath,
          name: value,
          type: 'path',
          rule: ruleList.find(findRule)
        };


        if (i != nodeArray.length) {
          node.children = [];
        }

        if(node.path == item.path){
          item.method?.forEach((method)=>{
            const findMethodRule = (rule: Rule) => {
              return rule.path == node.path+':'+method.type
            }
            // @ts-ignore
            node.children.push({
              name: method.type,
              path: node.path+':'+method.type,
              description: method.description,
              type: 'method',
              rule: ruleList.find(findMethodRule)
            })
          })
        }


        if (children?.length == 0) {
          children.push(node);
        }

        let isExist = false;

        children?.forEach((cnode)=> {
          if (cnode.name == node.name) {
            if (i != nodeArray.length - 1 && !cnode.children) {
              cnode.children = [];
            }
            children = (i == nodeArray.length - 1 ? children : cnode.children);

            // console.log("children:",children);

            isExist = true;
          }
        })

        if (!isExist) {
          children?.push(node);
          if (i != nodeArray.length - 1 && !children?.[children.length - 1].children) {
            // @ts-ignore
            children[children.length - 1].children = [];
          }
          children = (i == nodeArray.length - 1 ? children : children?.[children.length - 1].children);
        }
      })
    }
  });
  return { data: treeRoot[0].children, paths }
}


const getApiPathTree = async (ruleType: string)=>{
  const openapi_data = await getOpenApi({})
  const rule_list = await  getRuleList({params: {type: ruleType}})
  const data: ApiPath[] = []

  // @ts-ignore
  for(let key in openapi_data.paths){
    // @ts-ignore
    const openapi_data_path = openapi_data.paths[key]
    key = key.replace(/\/$/, '')
    const openapi_path: ApiPath = {
      path: key,
      level: key.replace(/[^\/]/g,'').length,
      method: []
    }
    for(const type in openapi_data_path) {
      const openapi_path_d = openapi_data_path[type]
      openapi_path.method?.push({
        type,
        ...openapi_path_d
      })
    }
    data.push(openapi_path)
    data.sort((a, b)=>{
      return (a.level || 0) - (b.level || 0)
    })
  }

  // @ts-ignore
  return buildApiTree(data, rule_list.data)
}


export const buildRoutesTree = (route_list: [], ruleList: Rule[], paths: string[])=>{
  const treeRoot: ApiPath[] = []
  route_list.forEach((item: any)=>{
    const findRule = (rule: Rule) => {
      return rule.path == (item.path || item.rule)
    }
    if(item.access == undefined)
      return;
    const path1: ApiPath = {
      description: item.name,
      path: item.path || item.rule,
      name: item.path || item.rule,
      type: 'path',
      rule: ruleList.find(findRule)
    }
    paths.push(item.path || item.rule)

    if(item.routes){
      path1.children = buildRoutesTree(item.routes, ruleList, paths)
    }
    treeRoot.push(path1)
  })

  return treeRoot
}

const getRouteTree = async (ruleType: string) => {
  const rule_list = await  getRuleList({params: {type: ruleType}})
  const paths: string[] = []
  return {data: buildRoutesTree(routes, rule_list.data, paths), paths}
}


export default () => {
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const [currentRule, setCurrentRule] = useState<Rule>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>();
  const [activeKey, setActiveKey] = useState<'front'|'back'|'defined'>('back');


  const actionRef = useRef<ActionType>();
  const dataFormRef = useRef<ProFormInstance>();

  useEffect(() => {

  }, []);


  const getRuleTree = async (key: string) =>{
    if(key=='back')
      return getApiPathTree(key)
    else if(key=='front')
      return getRouteTree(key)

    return {data: []}
  }


  const pathColumns: ProColumns<ApiPath>[] = [
    {
      title: '路径名',
      dataIndex: 'name',
      render: (val, row) =>{
        if(row.type=='path')
          return val;
        // @ts-ignore
        return <span className={style[row.name]}>{val}</span>
      }
    },
    {
      title: '名称',
      dataIndex: 'description',
      render: (val, row)=> {
        return row.description ? row.description.split('\n')[0] : undefined
      }
    },
    {
      title: '权限名称',
      tooltip: '空值不管控',
      dataIndex: 'rule',
      render:(val, row)=>{
        if(row.rule)
          return <>
            { row.rule.validity=='invalid' ?
              <Text delete>
                {row.rule.name}[无效]
              </Text>
              :
              <Text>{row.rule.name}</Text>
            }
            <a style={{marginLeft:'5px'}}
              onClick={()=>{
                setCurrentRule(row.rule);
                setSaveModalVisible(true);
              }}>
              <EditFilled />
            </a>
          </>;
        return '-'
      }
    },
    {
      title: '操作',
      width: '200px',
      align: 'center',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        record.rule==undefined?
        <a
          key="add"
          onClick={() => {
            setCurrentRule({
              name: record.description?.split('\n')[0],
              path: record.path,
              type: activeKey,
              validity: 'valid'
            })
            setSaveModalVisible(true)
          }}
        >
          <LockTwoTone /> 加权限
        </a>:null,
        record.rule!=undefined?
        <Popconfirm
          title={<>确认解除权限[ {record.rule?.name} ]吗?</>}

          placement={"topRight"}
          okText="解除"
          cancelText="取消"
          onVisibleChange={()=>{return}}
          onConfirm={async ()=>{
            const success = await removeRule({
              params: {ruleId: record.rule?.ruleId}
            });
            if (actionRef.current && success) {
              actionRef.current.reload();
            }
          }}
        >
          <a><UnlockTwoTone /> 解除权限</a>
        </Popconfirm>:null,

      ],
    }
  ]

  const definedColumns: ProColumns<Rule>[] = [
    {
      title: '权限名称',
      dataIndex: 'name'
    },
    {
      title: '权限代码',
      dataIndex: 'path'
    },
    {
      title: '状态',
      dataIndex: 'validity',
      key: 'status',
      initialValue: 'all',
      valueType: 'select',
      valueEnum: {
        valid: { text: '有效', status: 'Success' },
        invalid: { text: '无效', status: 'Default' }
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
            key="add"
            onClick={() => {
              setCurrentRule(record)
              setSaveModalVisible(true)
            }}
          >
            修改权限
          </a>,
          <Popconfirm
            title={<>确认删除权限[ {record?.name} ]吗?</>}
            placement={"topRight"}
            okText="删除"
            cancelText="取消"
            onVisibleChange={()=>{return}}
            onConfirm={async ()=>{
              const success = await removeRule({
                params: {ruleId: record.ruleId}
              });
              if (actionRef.current && success) {
                actionRef.current.reload();
              }
            }}
          >
            <a>删除权限</a>
          </Popconfirm>,
      ],
    }
  ]


  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <PageContainer>
      <ProTable<ApiPath>
        className={style.api_table}
        actionRef={actionRef}
        rowKey="path"
        defaultSize='small'
        search={false}
        expandable={{
          showExpandColumn: true,
          expandRowByClick: false,
          defaultExpandAllRows: true,
          //defaultExpandedRowKeys: expandedRowKeys,
          expandedRowKeys: expandedRowKeys
        }}
        request={async (params)=>{
          if(params.type=="defined")
            return await getDefinedList(params)
          const ret = await getRuleTree(params.type)
          setExpandedRowKeys(ret['paths'])
          return ret;
        }}
        params={{type: activeKey}}
        columns={activeKey=='defined'?definedColumns:pathColumns}
        pagination={
          activeKey!='defined'? false :
          {
            pageSize: 12
          }
        }
        options={{
          search: false,
        }}
        onExpandedRowsChange={(keys)=>{
          // @ts-ignore
          setExpandedRowKeys(keys)
        }}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeKey,
            items: [
              {
                key: 'back',
                label: <span>后端API权限</span>,
              },
              {
                key: 'front',
                label: <span>前端路由权限</span>,
              },
              {
                key: 'defined',
                label: <span>自定义权限</span>,
              },
            ],
            onChange: (key) => {
              // @ts-ignore
              setActiveKey(key);
              // actionRef.current?.reload()
            },
          }
        }}
        toolBarRender={() => [
          <Button
            hidden={activeKey!='defined'}
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRule({validity: 'valid', type:'defined'})
              setSaveModalVisible(true);
            }}
          >
            <PlusOutlined /> 新增自定义权限
          </Button>,
        ]}

      />


      {/*编辑权限*/}
      <ModalForm
        formRef={dataFormRef}
        title={currentRule != undefined && currentRule.ruleId != undefined?'编辑权限':'新增权限'}
        width="650px"
        visible={saveModalVisible}
        onVisibleChange={(visible)=>{
          setSaveModalVisible(visible)
          if(visible) {
            dataFormRef.current?.resetFields();
            dataFormRef.current?.setFieldsValue(currentRule);
          }

        }}
        onFinish={async (value) => {
          const success = await saveRule({
            data: value
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
          label={'权限ID'}
          name="ruleId"
          hidden={true}
        />
        <ProFormText
          label={'类型'}
          name="type"
          hidden={true}
        />
        <ProFormText
          label={'权限名称'}
          rules={[
            {
              required: true,
              message: '权限名称为必填项',
            },
          ]}
          name="name"
        />
        <ProFormText
          label={'权限代码'}
          name="path"
          hidden={activeKey!='defined'}
          rules={[
            {
              required: true,
              message: '权限代码为必填项',
            },
          ]}
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
      </ModalForm>
    </PageContainer>
  );
};
