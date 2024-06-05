import {DeleteOutlined, EditOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {Button, Divider, Drawer, message, Modal, Typography} from 'antd';
import React, {useRef, useState} from 'react';
import {FooterToolbar, PageContainer} from '@ant-design/pro-layout';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type {SysLogListItem} from './data.d';
import {queryOperateLogList, removeOperateLog} from './service';

const {Paragraph} = Typography;

const {confirm} = Modal;

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: SysLogListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeOperateLog(selectedRows.map((row) => row.id));
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const SysLogList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<SysLogListItem>();
  const [selectedRowsState, setSelectedRows] = useState<SysLogListItem[]>([]);

  const showDeleteConfirm = (item: SysLogListItem) => {
    confirm({
      title: '是否删除记录?',
      icon: <ExclamationCircleOutlined/>,
      content: '删除的记录不能恢复,请确认!',
      onOk() {
        handleRemove([item]).then(() => {
          actionRef.current?.reloadAndRest?.();
        });
      },
      onCancel() {
      },
    });
  };


  const columns: ProColumns<SysLogListItem>[] = [
    {
      title: '日志编号',
      dataIndex: 'id',
      hideInSearch: true
    },
    {
      title: '系统模块',
      dataIndex: 'title',
      render: (dom, entity) => {
        return <a onClick={() => {
          setCurrentRow(entity);
          setShowDetail(true);
        }}>{dom}</a>;
      },
      hideInTable: true,
      hideInSearch: true
    },

    {
      title: '操作类型',
      dataIndex: 'operationType',
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
    },
    {
      title: '操作系统',
      dataIndex: 'os',
    },
    {
      title: '请求方式',
      dataIndex: 'requestMethod',
    },
    {
      title: '操作方法',
      dataIndex: 'operationUrl',
      hideInTable: true,
    },
    {
      title: '请求参数',
      dataIndex: 'operationParams',
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '响应参数',
      dataIndex: 'operationResponse',
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '操作人员',
      dataIndex: 'operationName',
    },
    {
      title: '部门名称',
      dataIndex: 'deptName',
    },
    {
      title: '操作地址',
      dataIndex: 'operationIp',
    },
    {
      title: '操作状态',
      dataIndex: 'operationStatus',
    },
    {
      title: '执行时间(毫秒)',
      dataIndex: 'useTime',
      hideInSearch: true
    },

    {
      title: '操作时间',
      dataIndex: 'operationTime',
      sorter: true,
      valueType: 'dateTime',
      hideInSearch: true
    },

    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 220,
      render: (_, record) => (
        <>
          <a
            key="sort"
            onClick={() => {
              setShowDetail(true);
              setCurrentRow(record);
            }}
          >
            <EditOutlined/> 查看
          </a>
          <Divider type="vertical"/>
          <a
            key="delete"
            style={{color: '#ff4d4f'}}
            onClick={() => {
              showDeleteConfirm(record);
            }}
          >
            <DeleteOutlined/> 删除
          </a>
        </>
      ),

    },
  ];

  return (
    <PageContainer
      title={false}>
      <ProTable<SysLogListItem>
        headerTitle="操作日志列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={queryOperateLogList}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        pagination={{pageSize: 10}}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{fontWeight: 600}}>{selectedRowsState.length}</a> 项&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined/>}
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false)
        }}
        closable={false}
      >
        <div>
          <Paragraph>请求方法:</Paragraph>
          <Paragraph copyable>{currentRow?.operationUrl}</Paragraph>
        </div>
        <div>
          <Paragraph>请求参数:</Paragraph>
          <Paragraph copyable>{currentRow?.operationParams}</Paragraph>
        </div>
        <div>
          <Paragraph>响应参数:</Paragraph>
          <Paragraph copyable>{currentRow?.operationResponse}</Paragraph>
        </div>
      </Drawer>
    </PageContainer>
  );
};

export default SysLogList;
