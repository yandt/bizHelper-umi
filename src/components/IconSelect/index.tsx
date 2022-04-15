import React from "react";
import {ProFormSelect} from "@ant-design/pro-form";
import {ProFormSelectProps} from "@ant-design/pro-form/lib/components/Select";

// @ts-ignore
import iconfont from '/public/iconfont/iconfont.json';
import {createFromIconfontCN} from "@ant-design/icons";
import {IconFontProps} from "@ant-design/icons/lib/components/IconFont";

export type IconSelectProps = {

} & ProFormSelectProps

const Icon_ = createFromIconfontCN({
  scriptUrl: '/iconfont/iconfont.js',
})

export const BzIcon = (props: IconFontProps<string>) => {
  return (
    <Icon_ type={iconfont.css_prefix_text+props.type}/>
  )
}

const IconSelect: React.FC<IconSelectProps> = (props) => {
  return (
    <ProFormSelect
      style={{ width: '100%' }}
      {...props}
      request={()=>{
        return iconfont.glyphs.map((item: any)=>(
          {
            label: <><BzIcon type={item.name}/> {item.name}</>,
            value: item.name
          }
        ))
      }}
    />
  )
}

export default  IconSelect
