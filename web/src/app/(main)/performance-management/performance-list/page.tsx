"use client";
import { Table, Button, Space, Popconfirm, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWrapper, formatRelativeDate } from "@/lib/utils";
import dayjs from "dayjs";

// Define data type
interface UnitDataType {
  key: string;
  id: string;
  yearMonth: string;
  unitTotal: number;
  numberOfSelfCheckedUnits: number;
  lastUpdateTime: Date;
}

export default function UnitManagementPage() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<UnitDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isBatchDeleteLoading, setIsBatchDeleteLoading] =
    useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [user, setUser] = useState(null);

  const fetchData = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const result = await fetchWrapper(
        `/self-checked-department?page=${page}&limit=${pageSize}`
      );
      setData(
        result.data.map((item: UnitDataType) => ({ ...item, key: item.id }))
      );
      setPagination({
        ...pagination,
        total: result.meta.total,
        current: page,
        pageSize: pageSize,
      });
    } catch {
      messageApi.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(user);
    fetchData(pagination.current!, pagination.pageSize!);
  }, []);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetchData(pagination.current!, pagination.pageSize!);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await fetchWrapper(`/self-checked-department/${id}`, {
        method: "DELETE",
      });
      messageApi.destroy();
      messageApi.success("删除成功");
      fetchData(pagination.current!, pagination.pageSize!);
    } catch {
      messageApi.destroy();
      messageApi.error("删除失败");
    }
  };

  const handleBatchDelete = async () => {
    try {
      setIsBatchDeleteLoading(true);
      await fetchWrapper(`/self-checked-department`, {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedRowKeys }),
      });
      messageApi.destroy();
      messageApi.success("批量删除成功");
      fetchData(pagination.current!, pagination.pageSize!);
      setSelectedRowKeys([]);
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "批量删除失败");
    } finally {
      setIsBatchDeleteLoading(false);
    }
  };

  // Define columns
  const columns: ColumnsType<UnitDataType> = [
    {
      title: "年月",
      dataIndex: "yearMonth",
      key: "yearMonth",
      width: 150,
      render: (_, record) => {
        return dayjs(record.yearMonth).format("YYYY年MM月");
      },
    },
    {
      title: "已上传单位数",
      dataIndex: "unitTotal",
      key: "unitTotal",
      width: 150,
      render: (_, record) => {
        return record.numberOfSelfCheckedUnits + "/" + record.unitTotal;
      },
    },
    {
      title: "最新上传时间",
      dataIndex: "lastUpdateTime",
      key: "lastUpdateTime",
      width: 200,
      render: (_, record) => {
        const lastUpdateTime = new Date(record.lastUpdateTime);
        return formatRelativeDate(lastUpdateTime);
      },
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Link
            href={`/performance-management/unit-performance?month=${record.yearMonth}`}
          >
            <Button type="link">详情</Button>
          </Link>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">绩效列表</h1>
        <Space>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button
              disabled={!selectedRowKeys.length}
              loading={isBatchDeleteLoading}
            >
              批量删除
            </Button>
          </Popconfirm>
        </Space>
      </div>
      {contextHolder}
      <Table
        loading={loading}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />
    </div>
  );
}
