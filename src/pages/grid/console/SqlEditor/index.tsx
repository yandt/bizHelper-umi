import React, {useEffect, useRef, useState} from "react";
import CodeMirror, {ReactCodeMirrorRef} from '@uiw/react-codemirror';
import {sql} from '@codemirror/lang-sql';
import {io} from "socket.io-client";

import {Button, message} from "antd";
import BzQueryResult, {BzQueryResultInstance} from "@/components/BhQueryResult";
import './index.less';
import {CaretRightOutlined, DownloadOutlined, SaveOutlined } from "@ant-design/icons";
import {getConsole, saveConsole} from "@/pages/grid/console/List/service";
import {Console} from "../List/data"
import {getAccess} from "@/utils/accessUtils";
import {Socket} from "socket.io-client/build/esm/socket";

export type SqlEditorProps = {
  consoleId: number,
  download: boolean
}

const SqlEditor: React.FC<SqlEditorProps> = (props) => {

  const [sqlContent, setSqlContent] = useState<string>('')
  const [currentConsole, setCurrentConsole] = useState<Console>()
  const [commandLength, setCommandLength] = useState(0)
  const [execCount, setExecCount] = useState(0)
  const [execLoading, setExecLoading] = useState(false)
  const [downLoading, setDownLoading] = useState(false)


  const bzQueryRef = useRef<BzQueryResultInstance>(null);
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null)
  const socketRef = useRef<Socket>()

  useEffect(() => {
    getConsole(props.consoleId).then((body)=>{
      setCurrentConsole(body.data)
      setSqlContent(body.data.content||'')
    })

  }, []);




  const getCodeMirrorSelectText = ()=>{
    const sel_ranges = codeMirrorRef.current?.view?.state.selection.ranges
    if(sel_ranges!=undefined && sel_ranges.length>0){
      const range = sel_ranges[0]
      // console.log(range, sqlContent.substring(range.from, range.to))
      if(range.from != range.to)
        return sqlContent.substring(range.from, range.to)
    }
    return sqlContent
  }

  // @ts-ignore
  return (

    <div className={'bz-sql-editor'}>
      <div className={'bz-sql-editor-toolbar'}>
        <Button size={'small'} type={'default'} title={'保存控制台设置'}>
          <SaveOutlined onClick={async () => {
            if (currentConsole == undefined)
              return;
            currentConsole.content = sqlContent
            await saveConsole({data: currentConsole})
          }}/>
        </Button>
        <Button size={'small'} title={'执行SQL'}  disabled={execLoading} onClick={async () => {
          // await executeConsole({
          //   data: {
          //     consoleId: currentConsole?.consoleId,
          //     content: getCodeMirrorSelectText()
          //   }
          // })
          setExecLoading(true)
          setExecCount(0)
          const access = getAccess()
          const socket = io("ws://127.0.0.1:8090/console", {
            reconnectionDelayMax: 100000,
            reconnectionDelay: 100000,
            path: '/ws',
            auth: access,
          });
          socketRef.current = socket

          let name_count = {}

          const finish = ()=>{
            bzQueryRef.current?.finish()
            socket.close()
            name_count = {}
            setExecLoading(false)
          }

          // @ts-ignore
          socket.on('header',(data)=>{
            // @ts-ignore
            bzQueryRef.current?.setColHeaders(data)
            //console.log(data)
          })

          // @ts-ignore
          socket.on('row',(data)=>{
            // @ts-ignore
            bzQueryRef.current?.appendData([data])
          })


          // @ts-ignore
          socket.on('new',(data)=>{
            let name = data.name
            if(name_count.hasOwnProperty(name)) {
              name_count[name] = name_count[name]+1
              name = `${name}(${name_count[name]})`
            }else{
              name_count[name] = 0
            }
            // @ts-ignore
            bzQueryRef.current?.appendTables(data.key, name)
          })

          // @ts-ignore
          socket.on('finish', ()=>{
            // @ts-ignore
            finish()
          })

          // @ts-ignore
          socket.on('connect_success', ()=>{
            bzQueryRef.current?.setLoading(true)
          })


          // @ts-ignore
          socket.on('logs', (logs)=>{
            bzQueryRef.current?.setLogs(logs)
          })

          // @ts-ignore
          socket.on('length', (length)=>setCommandLength(length))

          // @ts-ignore
          socket.on('count', (count)=>setExecCount(count))


          // @ts-ignore
          bzQueryRef.current?.clearTables()

          // @ts-ignore
          socket.emit('query', {
            consoleId: currentConsole?.consoleId,
            content: getCodeMirrorSelectText()
          })

          socket.prependAny((event, ...args) => {
            console.log(`got ${event}`, args);
          });


        }} type={'default'}><CaretRightOutlined /></Button>

        {/*<Button size={'small'} title={'终止执行'} onClick={async () => {*/}
        {/*  const hide = message.loading('正在终止执行', 1)*/}
        {/*  // @ts-ignore*/}
        {/*  socketRef.current.emit('breakup')*/}
        {/*  socketRef.current?.close()*/}

        {/*  hide()*/}
        {/*}}  type={'default'} hidden={!props.download}><CloseSquareFilled /></Button>*/}

        <Button size={'small'} title={'保存为Excel文件'} disabled={downLoading} onClick={async () => {
          setDownLoading(true)
          const hide = message.loading('开始下载', 1)
          // @ts-ignore
          await bzQueryRef.current.downloadExcel(currentConsole.name)
          hide()
          setDownLoading(false)
        }}  type={'default'} hidden={!props.download}><DownloadOutlined/></Button>
      </div>
      <div className={'bz-sql-editor-content'}>
        <CodeMirror
          ref={codeMirrorRef}
          value={sqlContent}
          //height="30em"
          extensions={[sql(
            {
              // dialect: PostgreSQL,
              // tables:{'costdb':{}, 'abcdb':{}},
              // schema: {
              //   'costdb':['decdb'],
              //   'abcdb':['mmmdb']
              // }
            })]}

          onChange={(value) => {
            setSqlContent(value)
            // console.log('value:', value);
          }}
          onSelect={(e)=>console.log(e)}

        />
      </div>

      <BzQueryResult ref={bzQueryRef} className={'bz-query-result'}
                     commandLength={commandLength} execCount={execCount}/>

    </div>

  );
};

export default SqlEditor;
