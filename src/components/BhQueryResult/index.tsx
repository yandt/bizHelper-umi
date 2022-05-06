import 'handsontable/dist/handsontable.full.css';
import React, {createRef, RefObject, useImperativeHandle, useRef, useState} from "react";

import {Modal, Progress, Tabs, Typography} from "antd";
import BzTable, {BzTableInstance} from "@/components/BhTable";
import ProTable, {ProColumns} from "@ant-design/pro-table";
import {
  BellTwoTone,
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  PlayCircleTwoTone,
  SyncOutlined
} from "@ant-design/icons";

import './index.less'
import ExcelJs from "exceljs";
import {isArray} from "lodash";


const {TabPane} = Tabs;

const {Paragraph, Text} = Typography;

export type BzTableProps = {
  refreshSize?: number;
  className?: string;
  commandLength: number;
  execCount: number;
}

export type BzQueryResultInstance = {
  setLoading: (loading: boolean) => void,
  setLogs: (logs: []) => void,
  appendTables: (key: string, name: string) => void,
  clearTables: () => void,
  setColHeaders: (headers: string[]) => void,
  setData: (data: [][]) => void;
  appendData: (data: []) => void;
  finish: () => void;
  downloadExcel: (filename: string) => void;
}

export type ExecuteLog = {
  time: string,
  status: string,
  command?: string,
  exec?: number
  fetch?: number
  rows?: number
  message?: string
  sql?: string
}

export type ResultTable = {
  key: string,
  name: string,
  data?: [][],
  headers?: string[],
  bzTableRef?: RefObject<BzQueryResultInstance>
}

const BzQueryResult = React.forwardRef<BzQueryResultInstance, BzTableProps>((props, ref) => {

  const [loading, setLoading] = useState<boolean>(false)
  const [activeKey, setActiveKey] = useState<string>('logs')
  const [rowsCount, setRowsCount] = useState(0)
  const [logs, setLogs] = useState([])
  const [tables, setTables] = useState<ResultTable[]>([])
  const [activeTable, setActiveTable] = useState<ResultTable>()

  const bzTableRef = useRef<{[key: string]: BzTableInstance}>({});


  useImperativeHandle(ref, () => ({
    setLoading,
    setLogs,
    setColHeaders: (headers) => {
      if(activeTable){
        activeTable.headers = headers
      }

    },
    setData: (data)=>{
      if(activeTable)
        activeTable.data = data
      setRowsCount(rowsCount+data.length)
    },
    appendData: (data) => {
      if(activeTable) {
        if(activeTable.data == undefined) activeTable.data = []
        activeTable.data = activeTable.data?.concat(data)
      }
      setRowsCount(rowsCount+1)
    },
    appendTables: (key: string, name: string) =>{
      const resultTable: ResultTable = {
        key,
        name,
        bzTableRef: createRef<BzQueryResultInstance>()
      }
      const new_tables = tables.concat(resultTable)
      setTables(new_tables)
      setActiveTable(resultTable)
      setRowsCount(0)
    },
    clearTables: ()=>{
      setTables([])
      setActiveKey('logs')
    },
    finish: ()=>{
      setLoading(false)
      setActiveKey('logs')
      setRowsCount(0)
    },
    downloadExcel: (filename)=>{
      const workbook = new ExcelJs.Workbook();
      workbook.properties.date1904 = true;
      tables.forEach((t)=>{
        const sheet = workbook.addWorksheet(t.name);
        if(isArray(t.headers)){
          sheet.columns = t.headers.map((h)=>{
            return {header: h, key: h}
          })
        }
        sheet.addRows(t.data||[])
      })
      // 将二进制转为Excel并下载
      const writeFile = (fileName: string, content: ExcelJs.Buffer) => {
        const a = document.createElement("a");
        const blob = new Blob([content], { type: "text/plain" });
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.click();
      };
      workbook.xlsx.writeBuffer().then((buffer) => {
        writeFile(`${filename}.xlsx`, buffer);
      });
    }
  }));

  const columns: ProColumns<ExecuteLog>[] = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 90,
      align: 'center',
      render: (time, row) =>{
        const t = new Date(row.time)
        let hh = t.getHours()+''
        let mm = t.getMinutes()+''
        let ss = t.getSeconds()+''
        if (hh.length==1) hh = "0" + hh;
        if (mm.length==1) mm = "0" + mm;
        if (ss.length==1) ss = "0" + ss;
        return `${hh}:${mm}:${ss}`
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (val)=>{
        switch (val){
          case "SUCCESS":
            return <Text type={'success'}><CheckCircleFilled /> {val}</Text>
          case "EXECUTING":
            return <Text mark><LoadingOutlined /> {val}</Text>
          case "FAILED":
            return <Text type="danger"><CloseCircleFilled /> {val}</Text>
          case "STARTED":
            return <Text><PlayCircleTwoTone /> {val}</Text>
          case "FINISHED":
            return <Text strong><BellTwoTone /> {val}</Text>
          case "FETCHING":
            return <Text type="danger"><SyncOutlined spin /> {val}</Text>
          default:
            return {val}
        }

      }
    },
    {
      title: '命令',
      dataIndex: 'command',
      key: 'command',
      width: 80,
      align: 'center',
    },
    {
      title: '执行',
      dataIndex: 'exec',
      key: 'exec',
      width: 70,
      align: 'center',
    },
    {
      title: '获取',
      dataIndex: 'fetch',
      key: 'fetch',
      width: 70,
      align: 'center',
    },
    {
      title: '行数',
      dataIndex: 'rows',
      key: 'rows',
      width: 60,
      align: 'center'
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      width: 300,
      render: (val, row)=>{
        return <Paragraph
          style={{margin: 0,whiteSpace:'pre-line'}}
          ellipsis={{
            rows: 1,
            expandable: true
          }}
          title={`${val}`}
        >
          {
            row.status == 'FETCHING' ?
              `已获取${rowsCount}行，请稍候...`
              :
              val
          }
        </Paragraph>
      }
    },
    {
      title: 'Sql',
      dataIndex: 'sql',
      key: 'sql',
      render: (val,row)=>{
        return <code><Paragraph
          style={{margin: 5, maxWidth: 280}}
          ellipsis={true}
        >{
          row.sql != undefined && row.sql != null && (row.sql.split('\n').length>1 || row.sql.length>20)?
          <a onClick={() => {
            Modal.info({
              title: '查看SQL',
              content: (
                <code style={{whiteSpace: 'pre-line', maxHeight: 500, overflow: 'auto', display: 'block', fontSize: 14}}>
                  {val}
                </code>
              ),
              onOk() {
              },
              width: 800,
            });
          }
          }>{row.sql}</a> : row.sql
        }
        </Paragraph></code>
      }
    },
  ]



  return (
    <div className={props.className}>
      <Tabs defaultActiveKey="1" size={'small'}
            activeKey={activeKey} onChange={(key) => setActiveKey(key)}>
        <TabPane tab="Logs" key="logs">
          <ProTable
            rowKey={'key'}
            columns={columns}
            dataSource={logs}
            size={'small'}
            pagination={false}
            style={{height: 'calc(100%)', overflow: 'auto'}}
            search={false}
            toolBarRender={false}
            bordered
          />
        </TabPane>
        {
          tables.map((table)=>(
            <TabPane tab={table.name} key={table.key}>
              <BzTable
                ref={(f) => {
                    // @ts-ignore
                  bzTableRef.current[table.key] = f
                }}
                pagination={{pageSize: 50}}
                data={table.data||[]}
                headers={table.headers||[]}/>
            </TabPane>
          ))
        }
      </Tabs>
      <div className={'query-progress'} hidden={!loading}>
        <Progress percent={Math.round(props.execCount/props.commandLength*100)} status="active"/>
      </div>
    </div>
)
})

export default BzQueryResult
