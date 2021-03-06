import { PageContainer } from '@ant-design/pro-layout';
import {useState, useEffect, useRef, Key} from 'react';
import {Col, Collapse, Dropdown, Empty, Layout, Menu, Row, Tabs} from 'antd';
import './index.less';
import Sider from "antd/es/layout/Sider";
import {Content} from "antd/es/layout/layout";
import SqlEditor from "@/pages/grid/console/SqlEditor";
import {ModalForm, ProFormInstance, ProFormText} from "@ant-design/pro-form";
import {ConsoleSqlOutlined, PlusOutlined} from "@ant-design/icons";
import {getConnectList} from "@/pages/grid/connect/List/service";
import {Connect} from "@/pages/grid/connect/List/data";
import {Console} from "@/pages/grid/console/List/data";
import {getConsoleTree, saveConsole} from "@/pages/grid/console/List/service";
import DragTree from "@/components/DragTree";
import { isArray } from 'lodash';

const { TabPane } = Tabs;
const { Panel } = Collapse;

type ConsoleGroup = {
  [key: number]: Console[]
}

export default () => {

  const [connectActiveKey, setConnectActiveKey] = useState<string | string[]>()
  const [connectList, setConnectList] = useState<Connect[]>()
  const [editConsole, setEditConsole] = useState<Console>()
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false)
  const [consoleGroup, setConsoleGroup] = useState<ConsoleGroup>()
  const [openConsoles, setOpenConsoles] = useState<Console[]>([])
  const [currentConsoleKey, setCurrentConsoleKey] = useState<string>('')
  const [selectConsoleKey, setSelectConsoleKey] = useState<string>('')

  const [consoleList, setConsoleList] = useState<Console[]>([])


  const dataFormRef = useRef<ProFormInstance>();

  const loadConnectList = async () => {
    const body = await getConnectList({
      params: {validity: 'valid'}
    })
    setConnectList(body.data)
    if (connectActiveKey == undefined && body.data.length > 0)
      setConnectActiveKey(body.data[0].connectId + '')
  }

  const loadConsoleTree = async () => {
    const body = await getConsoleTree()
    setConsoleList(body.data)
    const cg: ConsoleGroup = {}
    body.data.forEach((item: Console) => {
      if (cg[item.connectId || 0] == undefined)
        cg[item.connectId || 0] = []
      cg[item.connectId || 0].push(item)
    })
    setConsoleGroup(cg)
  }

  useEffect(() => {
    loadConnectList().then(() => {
      loadConsoleTree().then(() => {
      })
    })
  }, []);


  const connect_menu = (connect: Connect) => {
    return (
      <Menu>
        <Menu.Item key={'add_folter_connect_'+connect.connectId} onClick={() => {
          setEditConsole({
            connectId: connect.connectId,
            name: '',
            isFolder: 1,
            parentId: 0
          })
          setSaveModalVisible(true)
        }}>
          ????????????
        </Menu.Item>
        <Menu.Item key={'add_console_connect_'+connect.connectId} onClick={() => {
          setEditConsole({
          connectId: connect.connectId,
          name: '',
          isFolder: 0,
          parentId: 0
        })
          setSaveModalVisible(true)
        }}>
        ???????????????
        </Menu.Item>
      </Menu>
    )
  }

  const console_menu = (console: Console) => {
    return (
      <Menu>
        <Menu.Item key={'add_folder_'+console.consoleId} onClick={() => {
          setEditConsole({
            connectId: console.connectId,
            name: '',
            isFolder: 1,
            parentId: console.consoleId
          })
          setSaveModalVisible(true)
        }}>
          ????????????
        </Menu.Item>
        <Menu.Item key={'add_console_'+console.consoleId} onClick={() => {
          setEditConsole({
            connectId: console.connectId,
            name: '',
            isFolder: 0,
            parentId: console.consoleId
          })
          setSaveModalVisible(true)
        }}>
          ???????????????
        </Menu.Item>
        <Menu.Item key={'modify_'+console.consoleId} onClick={() => {
          setEditConsole(console)
          setSaveModalVisible(true)
        }}>
          ??????
        </Menu.Item>
        <Menu.Item key={'delete_'+console.consoleId} onClick={() => {

        }}>
          ??????
        </Menu.Item>
      </Menu>
    )
  }


  const getConnectExtra = (connect: Connect) => {
    return <Dropdown overlay={connect_menu(connect)} placement={'bottomRight'}><PlusOutlined style={{marginRight: 5}}/></Dropdown>
  }

  const filterConsoleList = (list: Console[], key: string): Console[] => {
    const relist = list.filter((c: Console)=>{
      return (c.consoleId+'' == key)
    })
    if(relist != undefined && relist.length>0)
      return relist;
    for(let i=0;i<list.length;i++){
      if(list[i].isFolder){
        return filterConsoleList(list[i].children || [], key)
      }
    }
    return []
  }

  const selectConsoleKeys = (key: Key)=>{
    const ocs = openConsoles;
    const curConsoleArr: Console[] = filterConsoleList(consoleList, key+'');
    if(curConsoleArr.length==0)
      return;
    const curConsole = curConsoleArr[0]
    if(!ocs.find((c: Console)=>{
      return (c.consoleId+'') == key
    })){
      if(!curConsole.isFolder) {
        ocs.push(curConsole)
      }
      setOpenConsoles(ocs)
    }
    setSelectConsoleKey(key.toString())
    if(!curConsole.isFolder) {
      setCurrentConsoleKey(key.toString())
    }
  }

  // @ts-ignore
  const getConsoleTreeData = (con_list: Console[]) => {
    return con_list.map((con)=>{
      return {
        key: con.consoleId+'',
        title: con.name,
        isLeaf: !con.isFolder,
        icon: con.isFolder?null:<ConsoleSqlOutlined />,
        console: con,
        children: isArray(con.children)?getConsoleTreeData(con.children): undefined
      }
    })
  }

  const getConnectCollapse = () => {
    return (
      <Collapse
        activeKey={connectActiveKey}
        onChange={setConnectActiveKey}
        expandIconPosition={'left'}
        collapsible="header"
        accordion
      >
        {
          connectList?.map((connect) => (
            <Panel header={connect.name} key={connect.connectId+''} extra={getConnectExtra(connect)}>
              {
                consoleGroup == undefined ||
                consoleGroup[connect.connectId||0]==undefined ||
                consoleGroup[connect.connectId||0].length==0?
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>:
                  <DragTree
                    showIcon={true}
                    treeData={getConsoleTreeData(consoleGroup[connect.connectId||0])}
                    onSelect={(keys: Key[])=>{
                      selectConsoleKeys(keys[0])
                    }}
                    selectedKeys={[selectConsoleKey]}
                    titleRender={(node)=>{
                      // @ts-ignore
                      return <Dropdown overlay={console_menu(node.console)}
                                       trigger={['contextMenu']}><div style={{display: "inline-block"}}>{node.title}</div></Dropdown>
                    }}

                  />
              }
            </Panel>
          ))
        }
      </Collapse>
    )
  }

  return (
    <PageContainer
      pageHeaderRender={()=>null}
      prefixCls={'console'}
    >
      <Layout>
        <Sider theme={'light'} width={260} className={'bz-sider'}>
          <Row className={"bz-sider-header"}>
            <Col span={8}>Console</Col>
            <Col span={16}></Col>
          </Row>
          {getConnectCollapse()}
        </Sider>
        <Layout>
          <Content>
            <Tabs
              activeKey={currentConsoleKey+''}
              size={'small'}
              onChange={(key)=>setCurrentConsoleKey(key)}
              type="editable-card"
              onEdit={(t)=>{
                const ocs = openConsoles
                const idx = ocs.findIndex((c)=>{
                  return (c.consoleId+'') == t
                })
                console.log(t, idx)
                if(idx>=0){
                  ocs.splice(idx,1)
                  setOpenConsoles([...ocs])
                  if(currentConsoleKey==t && ocs.length>0)
                    setCurrentConsoleKey(ocs[0].consoleId+'')
                }

              }}
              hideAdd
            >
              {
                openConsoles.map(console=>(
                  <TabPane key={console.consoleId+''} tab={console.name} closable={true}>
                    <SqlEditor consoleId={console.consoleId||0} download/>
                  </TabPane>
                ))
              }
            </Tabs>
          </Content>
        </Layout>
      </Layout>

      {/*??????*/}
      <ModalForm
        key={'edit'}
        formRef={dataFormRef}
        title={(editConsole?.consoleId != undefined?'??????':`??????`)+editConsole?.isFolder?"??????":"?????????"}
        width="540px"
        visible={saveModalVisible}
        onVisibleChange={(visible)=>{
          if(visible) {
            dataFormRef.current?.resetFields();
            dataFormRef.current?.setFieldsValue(editConsole);
          }
          setSaveModalVisible(visible)
        }}
        onFinish={async (value) => {
          const new_console = await saveConsole({
            data: value
          });

          if (new_console.success) {
            setSaveModalVisible(false);
            await loadConsoleTree()
            setConnectActiveKey(new_console.data.connectId+'')
            openConsoles.push(new_console.data)
            setOpenConsoles(openConsoles)
            selectConsoleKeys(new_console.data.consoleId+'')
          }
        }}
      >
        <ProFormText
          label={'?????????ID'}
          name="consoleId"
          hidden={true}
        />
        <ProFormText
          label={'??????ID'}
          name="connectId"
          hidden={true}
        />
        <ProFormText
          label={'??????ID'}
          name="parentId"
          hidden={true}
        />
        <ProFormText
          label={'????????????'}
          name="isFolder"
          hidden={true}
        />
        <ProFormText
          label={(editConsole?.isFolder?"??????":"?????????")+'??????'}
          rules={[
            {
              required: true,
              message: '??????????????????',
            },
          ]}
          name="name"
        />
      </ModalForm>

    </PageContainer>
  );
};
