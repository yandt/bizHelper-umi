import {Avatar, Breadcrumb, Button, Col, Divider, Dropdown, List, Menu, Radio, Row, Skeleton, Space, Typography} from 'antd';
import {PageContainer} from '@ant-design/pro-layout';

import React, {useRef, useState} from "react";
import ProList from '@ant-design/pro-list';
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  HomeOutlined,
  RollbackOutlined,
  ScissorOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";
import {getDictPageList, getDictParentList, removeDict, saveDict} from './service';
import {DictListItemType} from "@/pages/dms/dict/List/data";

import style from './index.less'
import {ActionType} from "@ant-design/pro-table";
import classNames from 'classnames';
import {ModalForm, ProFormInstance, ProFormRadio, ProFormText} from "@ant-design/pro-form";
import DictSelect from "@/components/DictSelect";

const { Paragraph, Text } = Typography;

const DictList: React.FC = () => {

  const rootDict: DictListItemType = {
    dictId:0,
    name:'字典根',
    isFolder: 1,
    parentId: 0,
    validity: "valid"
  }

  const [currentDict, setCurrentDict] = useState<DictListItemType>(rootDict);
  const [parentDict, setParentDict] = useState<DictListItemType>();
  const [editDict, setEditDict] = useState<DictListItemType>();
  const [breadcrumbList, setBreadcrumbList] = useState<DictListItemType[]>([])
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false)
  const [moveModalVisible, setMoveModalVisible] = useState<boolean>(false)
  const [showType, setShowType] = useState<'folder'|'list'>("folder")

  const actionRef = useRef<ActionType>();
  const {dict_item_folder, dict_icon, dict_select, dict_name, dict_value, dict_paste, dict_item_list, dict_item_col} = style
  const saveFormRef = useRef<ProFormInstance>();
  const moveFormRef = useRef<ProFormInstance>();


  const openDict = async (item?: DictListItemType) => {
    if (item == undefined || item.isFolder == 1) {
      if (item == undefined) {
        setCurrentDict(rootDict)
        setParentDict(undefined)
        setBreadcrumbList([])
      } else {
        setCurrentDict(item)
        if(item.dictId||0>0) {
          const parent_list = await getDictParentList({dictId: item.dictId||0})
          if (parent_list.data.length >= 2)
            setParentDict(parent_list.data[parent_list.data.length - 2])
          else
            setParentDict(rootDict)
          setBreadcrumbList(parent_list.data)
        } else {
          setBreadcrumbList([])
          setParentDict(undefined)
        }

      }

    } else {
      setSaveModalVisible(true)
    }
  }

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={()=>
        setSaveModalVisible(true)
      }><EditOutlined /> 修改</Menu.Item>
      <Menu.Item key="2" onClick={()=>{
        setMoveModalVisible(true)
      }}><ScissorOutlined /> 移动</Menu.Item>
      <Menu.Item key="3" onClick={async ()=> {
        if(editDict){
          await removeDict({params:{dictId: editDict?.dictId}})
          actionRef.current?.reload()
        }
      }}><DeleteOutlined /> 删除</Menu.Item>
    </Menu>
  );


  const renderDictItem_folder = (item: DictListItemType)=>(
    <List.Item
      key={item.dictId}
      onDoubleClick={async ()=>{
        await openDict(item)
      }}
      onClick={()=>{
        setEditDict(item)
      }}
    >
      <Dropdown overlay={menu} trigger={['contextMenu']} onVisibleChange={(visible)=>{
        if(visible)
          setEditDict(item)
        else
          setEditDict(undefined)
      }}>
      <div className={classNames(dict_item_folder, editDict?.dictId == item.dictId ? dict_select : 0)}>

        <div className={dict_icon}>
          {
            item.isFolder ?
              <img src={item.validity=='valid'?'/folder.svg':'/folder_invalid.svg'}/>
              :
              <img src={item.validity=='valid'?'/node.svg':'/node_invalid.svg'}/>
          }
        </div>
        <div className={dict_name}>
          {item.name}
        </div>
        {
          item.isFolder ? null:
            <div className={dict_value}>
              {item.value}
            </div>
        }
        <Paragraph
          className={dict_paste}
          copyable={{
            text: item.path ,
            tooltips: ['复制引用路径','复制成功']
          }}/>
      </div>
      </Dropdown>
    </List.Item>
  )


  const renderDictItem_list = (item: DictListItemType)=>(
    <List.Item
      className={dict_item_list}
      key={item.dictId}
      onDoubleClick={async ()=>{
        await openDict(item)
      }}
      onClick={()=>{
        setEditDict(item)
      }}
    >
      <Skeleton avatar title={false} loading={false} active>
        <Row wrap={false}>
          <Col flex="40px">
            {
              item.isFolder ?
                <Avatar shape="square" src={item.validity=='valid'?'/folder.svg':'/folder_invalid.svg'} />
                :
                <Avatar shape="square" src={item.validity=='valid'?'/node.svg':'/node_invalid.svg'} />
            }
          </Col>
          <Col flex="auto" className={dict_item_col}>
            <Space>
              <Text
                className={dict_paste}
                copyable={{
                  text: item.path ,
                  tooltips: ['复制引用路径','复制成功']
                }}>{item.name}</Text>
              {item.isFolder?null:<Text className={dict_value}>{item.value}</Text>}
            </Space>
          </Col>
          <Col flex="120px" className={dict_item_col}>
            <Space size={'small'}>
              <a onClick={()=>
                setSaveModalVisible(true)
              }>修改</a>
              <a onClick={()=>{
                setMoveModalVisible(true)
              }}>移动</a>
              <a onClick={async ()=> {
                if(editDict){
                  await removeDict({params:{dictId: editDict?.dictId}})
                  actionRef.current?.reload()
                }
              }}>删除</a>
            </Space>
          </Col>

        </Row>
      </Skeleton>
    </List.Item>
  )

  return (
    <PageContainer>
      <ProList<any>
        actionRef={actionRef}
        pagination={{
          defaultPageSize: 24,
          showSizeChanger: false,
        }}
        showActions="hover"
        rowSelection={{}}
        grid={
          showType == 'list'? { column: 1 }:
            {
              gutter: 16,
              xs: 3,
              sm: 4,
              md: 5,
              lg: 6,
              xl: 7,
              xxl: 8,
            }
        }
        options={{
          search: true,
          density: false,
          setting: false
        }}
        toolbar={{
          multipleLine: true,
          filter: (
            <div>
              <Breadcrumb separator=">" >
                <Breadcrumb.Item href={"#"} onClick={async ()=>{ await openDict() }}><HomeOutlined /></Breadcrumb.Item>
                {
                  breadcrumbList.map((item)=>(
                    <Breadcrumb.Item key={item.dictId} href="#" onClick={async ()=>{ await openDict(item) }}>{item.name}</Breadcrumb.Item>
                  ))
                }
            </Breadcrumb>
            </div>
          )
        }}
        toolBarRender={() => [
          <Radio.Group value={showType} onChange={e=>setShowType(e.target.value)}>
            <Radio.Button value="folder" name={'以图标方式显示'}><AppstoreOutlined /></Radio.Button>
            <Radio.Button value="list" name={'以列表方式显示'}><UnorderedListOutlined /></Radio.Button>
          </Radio.Group>,
          <Divider type={'vertical'} key={'d'}/>,
          <Button
            type="text"
            key="primary"
            disabled={parentDict==undefined}
            onClick={async () => {
              await openDict(parentDict)
            }}
          >
            <RollbackOutlined /> 返回
          </Button>,
          <Button
            type="text"
            key="primary"
            onClick={() => {
              setSaveModalVisible(true)
              setEditDict({isFolder:1, validity:'valid', parentId: currentDict?.dictId || 0})
            }}
          >
            <FolderAddOutlined /> 新建目录
          </Button>,
          <Button
            type="text"
            key="primary"
            onClick={() => {
              // handleSaveModalVisible(true);
              // handleCurrentRow({validity: 'valid', parentId: 0})
              setSaveModalVisible(true)
              setEditDict({isFolder:0, validity: 'valid', parentId: currentDict?.dictId || 0, parentName: currentDict.name})
            }}
          >
            <FileAddOutlined /> 新建节点
          </Button>,
          <Divider type={'vertical'}/>
        ]}
        request={getDictPageList}
        params={{parentId: currentDict.dictId}}
        renderItem={ showType=='list' ? renderDictItem_list : renderDictItem_folder}
      />

      <ModalForm
        formRef={saveFormRef}
        title={(editDict?.dictId?'修改':'新增')+(editDict?.isFolder?'目录':'节点')}
        width="650px"
        visible={saveModalVisible}
        onVisibleChange={(visible)=>{
          setSaveModalVisible(visible)
          if(visible) {
            saveFormRef.current?.resetFields()
            saveFormRef.current?.setFieldsValue(editDict)
          }
        }}
        onFinish={async (value) => {
          const success = await saveDict({
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
          label={'ID'}
          name="dictId"
          hidden={true}
        />
        <ProFormText
          label={'ID'}
          name="parentId"
          hidden={true}
        />
        <ProFormText
          label={'是否目录'}
          name="isFolder"
          hidden={true}
        />
        <ProFormText
          label={'归属目录'}
          readonly={true}
          name="parentName"
          initialValue={currentDict.name}
        />
        <ProFormText
          label={(editDict?.isFolder?'目录':'节点')+'名称'}
          rules={[
            {
              required: true,
              message: '名称为必填项',
            },
          ]}
          name="name"
        />
        {
          editDict?.isFolder ? null :
            <ProFormText
              label={'节点值'}
              rules={[
                {
                  required: true,
                  message: '节点值为必填项',
                },
              ]}
              name="value"
            />
        }
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

      <ModalForm
        formRef={moveFormRef}
        title={'移动'+(editDict?.isFolder?'目录':'节点')}
        width="650px"
        visible={moveModalVisible}
        onVisibleChange={(visible)=>{
          setMoveModalVisible(visible)
          if(visible) {
            moveFormRef.current?.resetFields()
            moveFormRef.current?.setFieldsValue(editDict)
          }
        }}
        onFinish={async (value) => {
          const success = await saveDict({
            data: value
          });

          if (success) {
            setMoveModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}

      >
        <ProFormText
          label={'ID'}
          name="dictId"
          hidden={true}
        />
        <ProFormText
          readonly={true}
          label={(editDict?.isFolder?'目录':'节点')+'名称'}
          rules={[
            {
              required: true,
              message: '名称为必填项',
            },
          ]}
          name="name"
        />
        <DictSelect path={'/'} name={'parentId'} nodeType={'folder'} includeRootNode={true}/>
      </ModalForm>

    </PageContainer>
  )
}

export default DictList;
