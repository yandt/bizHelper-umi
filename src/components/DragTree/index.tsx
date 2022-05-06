import { Tree } from 'antd';
import React, {useState} from "react";
import './index.less'
import {TreeProps} from "antd/lib/tree/Tree";

export type DragTreeProps<T> = {
  treeData: T[],
  defaultExpandedKeys?: string[],
} & TreeProps

export type TreeDataType = {
  key: string,
  title: string,
  isLeaf: boolean,
  children?: TreeDataType[]
}


const DragTree: React.FC<DragTreeProps<TreeDataType>> = (props) => {

  const [treeData, setTreeData] = useState<any[]>(props.treeData)

  const onDragEnter = (info: any) => {
    console.log(info);
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  };

  const onDrop = (info: any) => {
    console.log(info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data: TreeDataType[], key: string, callback: Function) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          // @ts-ignore
          loop(data[i].children, key, callback);
        }
      }
    };
    const data = [...treeData];

    // Find dragObject
    let dragObj: any;
    loop(data, dragKey, (item: TreeDataType, index: number, arr: TreeDataType[]) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item: TreeDataType) => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item: TreeDataType) => {
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children
      });
    } else {
      let ar: TreeDataType[] = [];
      let i: number = 0;
      loop(data, dropKey, (item: TreeDataType, index: number, arr: TreeDataType[]) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    setTreeData(data)

  };

  return (
    <Tree
      className="draggable-tree"
      draggable
      blockNode
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      {...props}
    />
  );

}

export default DragTree;
