"use client";
import { Table, Button, Space, Popconfirm, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWrapper, formatRelativeDate } from "@/lib/utils"; // Assuming this utility is available

// Define data type
interface UserDataType {
  key: string;
  username: string;
  unit: string;
  role: string;
  createdAt: Date;
}

export default function UserManagementPage() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<UserDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isBatchDeleteLoading, setIsBatchDeleteLoading] =
    useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const result = await fetchWrapper(`/user?page=${page}&limit=${pageSize}`);
      setData(
        result.data.map((item: UserDataType) => ({ ...item, key: item.id }))
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
    fetchData(pagination.current!, pagination.pageSize!);
  }, []);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetchData(pagination.current!, pagination.pageSize!);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchWrapper(`/user/${id}`, { method: "DELETE" });
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
      await fetchWrapper(`/user`, {
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
  const columns: ColumnsType<UserDataType> = [
    {
      title: "账号",
      dataIndex: "username",
      key: "username",
      width: 150,
    },
    {
      title: "单位",
      dataIndex: "unit",
      key: "unit",
      width: 150,
      render: (_, record) => record.unit?.name,
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      width: 150,
      render: (_, record) => record.role?.name,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "id",
      width: 200,
      render: (_, record) => {
        const createdAt = new Date(record.createdAt);
        return formatRelativeDate(createdAt);
      },
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Link href={`/system-settings/user-management/${record.key}/edit`}>
            <Button type="link">编辑</Button>
          </Link>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.key)}
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
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Space>
          <Link href="/system-settings/user-management/add">
            <Button type="primary">新增</Button>
          </Link>
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
