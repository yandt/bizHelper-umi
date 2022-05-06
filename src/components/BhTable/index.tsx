import { HotTable } from "@handsontable/react";
import 'handsontable/dist/handsontable.full.css';
import { registerAllModules } from 'handsontable/registry';
import { registerLanguageDictionary, zhCN } from 'handsontable/i18n';
import React, {useEffect, useImperativeHandle, useState} from "react";
import ExcelJs from "exceljs";
import {Col, Empty, Pagination, Row} from "antd";
import './index.less'
import { isArray } from "lodash";

registerAllModules()
registerLanguageDictionary(zhCN)

export type BzTableProps = {
  pagination?: {
    pageSize?: number;
  }
  data: [][],
  headers: string[]
}

export type BzTableInstance = {
  downloadFile: (filename: string) => void;
}

const DEFAULT_PAGE_SIZE=50

const BzTable = React.forwardRef<BzTableInstance, BzTableProps>((props, ref) => {
  const [tableData, setTableData] = useState<any[][]>([])
  const [pageSize, setPageSize] = useState<number>(props.pagination?.pageSize || DEFAULT_PAGE_SIZE)

  // const hotTableComponent = useRef(null);

  useEffect(() => {
    setTableData(props.data.slice(0, pageSize||DEFAULT_PAGE_SIZE))
  }, []);

  useImperativeHandle(ref, () => ({
    downloadFile: (filename) => {
      const workbook = new ExcelJs.Workbook();
      workbook.properties.date1904 = true;
      const sheet = workbook.addWorksheet('sheet1');
      if(isArray(props.headers)){
        sheet.columns = props.headers.map((h)=>{
          return {header: h, key: h}
        })
      }
      sheet.addRows(props.data||[])

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
  if(props.data==undefined || props.data.length==0)
    return (<Empty style={{ height:"calc(100%)" }} image={Empty.PRESENTED_IMAGE_SIMPLE}/>)
  // @ts-ignore
  return (
    <>
      {/*@ts-ignore*/}
      <HotTable
        className={'bz-table-hot-table'}
        data={tableData}
        height={'calc(100% - 36px)'}
        dropdownMenu={false}
        colHeaders={props.headers}
        hiddenColumns={{
          indicators: true
        }}
        contextMenu={true}
        multiColumnSorting={true}
        manualColumnResize={true}
        rowHeaders={true}
        readOnly={true}
        language={zhCN.languageCode}
        columnSorting={false}
        licenseKey="non-commercial-and-evaluation"
        autoColumnSize={true}
      ></HotTable>
      <Row className={'bz-table-status'}>
        <Col span={24}>
          <Pagination
            size="small"
            total={props.data.length}
            pageSize={pageSize}
            showTotal={(total)=>`共${total}条数据`}
            showSizeChanger
            showQuickJumper
            onChange={(page, page_size)=>{
              setPageSize(page_size)
              setTableData(props.data.slice((page-1)*page_size, (page-1)*page_size+page_size))
            }}
          />
        </Col>
      </Row>
    </>
  )
})

export default BzTable
