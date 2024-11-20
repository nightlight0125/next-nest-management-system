"use client";
import { Table, Button, Space, Popconfirm, message, DatePicker } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWrapper, formatRelativeDate } from "@/lib/utils";
import { DownloadOutlined } from "@ant-design/icons";
import zhCN from "antd/lib/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

// Define data type
interface UnitDataType {
  key: string;
  id: string;
  unit: string;
  yearMonth: string;
  selfCheckedScore: string;
  perUnitSelfCheckedCondition: [];
  examinationCondition: [];
  reviewStateOfPerformanceTeam: [];
  createdAt: Date;
}

interface SelfCheckedDepartmentDataType {
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
  const [yearMonth, setYearMonth] = useState<string>("");
  const [selfCheckedDepartmentCount, setSelfCheckedDepartmentCount] =
    useState<SelfCheckedDepartmentDataType | null>(null);

  const fetchData = async (page: number, pageSize: number) => {
    try {
      setLoading(true);
      const result = await fetchWrapper(
        `/current-year-month-unit-performance?page=${page}&limit=${pageSize}&month=${yearMonth}`
      );

      const selfCheckedDepartmentCount = await fetchWrapper(
        `/self-checked-department/${yearMonth}`
      );
      setSelfCheckedDepartmentCount(selfCheckedDepartmentCount);
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

  const getCurrentYearMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so add 1
    return `${year}-${month}`;
  };

  useEffect(() => {
    try {
      const month = window.location.href.split("=")[1] || getCurrentYearMonth();
      setYearMonth(month);
    } catch {
      messageApi.destroy();
      messageApi.error("Failed to fetch data");
    }
  }, []);

  useEffect(() => {
    if (yearMonth) {
      fetchData(pagination.current!, pagination.pageSize!);
    }
  }, [yearMonth]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    fetchData(pagination.current!, pagination.pageSize!);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await fetchWrapper(`/current-year-month-unit-performance/${id}`, {
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
      await fetchWrapper(`/current-year-month-unit-performance`, {
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
      title: "单位",
      dataIndex: "unit",
      key: "unit",
      width: 150,
      render: (_, record) => {
        return record.unit?.name;
      },
    },
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
      title: "单位部门自查得分",
      dataIndex: "selfCheckedScore",
      key: "selfCheckedScore",
      width: 150,
      render: (_, record) => {
        return record.selfCheckedScore + "分";
      },
    },
    {
      title: "各单位自查情况",
      dataIndex: "perUnitSelfCheckedCondition",
      key: "perUnitSelfCheckedCondition",
      width: 150,
      render: (_, record) => {
        return record.perUnitSelfCheckedCondition.length
          ? record.perUnitSelfCheckedCondition.map(
              (item: any, index: number) => {
                return (
                  index +
                  1 +
                  "." +
                  item.responsiblePerson +
                  "" +
                  item.responsiblePersonScore +
                  "分：" +
                  item.responsiblePersonRemark +
                  "\n"
                );
              }
            )
          : "无自查情况";
      },
    },
    {
      title: "检查情况",
      dataIndex: "examinationCondition",
      key: "examinationCondition",
      width: 150,
      render: (_, record) => {
        return record.examinationCondition?.length ? (
          record.examinationCondition.map((item: any, index: number) => {
            return (
              index +
              1 +
              "." +
              item.relatedSelfCheckedID +
              "" +
              item.examinationScore +
              "分 ：" +
              item.examinationContent +
              "\n"
            );
          })
        ) : (
          <span className="bg-red-500 text-white px-2 py-1 rounded-md opacity-85">
            未完成
          </span>
        );
      },
    },
    {
      title: "绩效考核小组核定情况",
      dataIndex: "reviewStateOfPerformanceTeam",
      key: "reviewStateOfPerformanceTeam",
      width: 150,
      render: (_, record) => {
        return record.reviewStateOfPerformanceTeam?.length ? (
          record.reviewStateOfPerformanceTeam.map(
            (item: any, index: number) => {
              return (
                index +
                1 +
                "." +
                item?.relatedExaminationID +
                "" +
                item.examinationScore +
                "分 ：" +
                item.examinationContent +
                "\n"
              );
            }
          )
        ) : (
          <span className="bg-red-500 text-white px-2 py-1 rounded-md opacity-85">
            未完成
          </span>
        );
      },
    },
    // {
    //   title: "备注",
    //   dataIndex: "remark",
    //   key: "remark",
    //   width: 150,
    // },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (_, record) => {
        const lastUpdateTime = new Date(record.createdAt);
        return formatRelativeDate(lastUpdateTime);
      },
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          {(!record?.editPersonId || !record?.auditPersonId) && (
            <Link
              href={
                record?.editPersonId
                  ? `/performance-management/unit-performance/${record.id}/audit`
                  : `/performance-management/unit-performance/${record.id}/edit`
              }
            >
              <Button type="link">编辑</Button>
            </Link>
          )}
          <Link
            href={`/performance-management/unit-performance/${record.id}/detail`}
          >
            <Button type="link">详情</Button>
          </Link>
          {record?.wordFile && (
            <Link href={record.wordFile}>
              <Button type="link">下载附件</Button>
            </Link>
          )}
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

  const handleMonthChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setYearMonth(date.format("YYYY-MM"));
    }
  };

  const handleBatchExport = () => {
    const selectedData = data.filter((item) =>
      selectedRowKeys.includes(item.key)
    );

    // 清楚选中
    setSelectedRowKeys([]);
    console.log("导出选中的记录:", selectedData);
    handleExport(selectedData, "month");
  };

  const handleExportAll = async () => {
    try {
      const result = await fetchWrapper(
        `/current-year-month-unit-performance/all?month=${yearMonth}`
      );
      handleExport(result.data, "month");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "导出失败");
    }
  };

  const handleExportYear = async () => {
    try {
      const result = await fetchWrapper(
        `/current-year-month-unit-performance/allYear?year=${yearMonth.split("-")[0]}`
      );
      handleExport(result.data, "year");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "导出失败");
    }
  };

  // 处理导出Excel
  const handleExport = (data: UnitDataType[], type: "month" | "year") => {
    // 准备导出数据
    const exportData = data.map((item, index) => {
      let positiveIncentiveTimes = 0;
      let negativeIncentiveTimes = 0;
      if (
        item?.reviewStateOfPerformanceTeam &&
        item?.reviewStateOfPerformanceTeam.length > 0
      ) {
        item?.reviewStateOfPerformanceTeam.map((inerItem) => {
          if (inerItem?.examinationScore > 100) {
            positiveIncentiveTimes += 1;
          }
          if (inerItem?.examinationScore < 100) {
            negativeIncentiveTimes += 1;
          }
        });
      }

      return {
        序号: index + 1,
        单位: item.unit?.name,
        // 年月: item.yearMonth,
        "单位、部门自查得分": item.selfCheckedScore,
        各单位自查情况: item.perUnitSelfCheckedCondition?.length
          ? item.perUnitSelfCheckedCondition
              .map(
                (item: any, index: number) =>
                  index +
                  1 +
                  "." +
                  item.responsiblePerson +
                  "" +
                  item.responsiblePersonScore +
                  "分：" +
                  item.responsiblePersonRemark +
                  "\n"
              )
              .join("")
          : "无",
        检查情况: item.examinationCondition?.length
          ? item.examinationCondition
              .map((item: any, index: number) => {
                return (
                  index +
                  1 +
                  "." +
                  item.relatedSelfCheckedID +
                  "" +
                  item.examinationScore +
                  "分 ：" +
                  item.examinationContent +
                  "\n"
                );
              })
              .join("")
          : "无",
        绩效考核领导小组核定情况: item.reviewStateOfPerformanceTeam?.length
          ? item.reviewStateOfPerformanceTeam
              .map((item: any, index: number) => {
                return (
                  index +
                  1 +
                  "." +
                  item.relatedExaminationID +
                  "" +
                  item.examinationScore +
                  "分 ：" +
                  item.examinationContent +
                  "\n"
                );
              })
              .join("")
          : "无",
        正激励人次: positiveIncentiveTimes === 0 ? "-" : positiveIncentiveTimes,
        负激励人次: negativeIncentiveTimes === 0 ? "-" : negativeIncentiveTimes,
        备注: item?.remark,
      };
    });
    // 生成文件名（使用当前选择的年月）
    const fileName = `${dayjs(yearMonth).format(
      type === "month" ? "YYYY年MM月" : "YYYY年"
    )}绩效考核评分情况表.xlsx`;
    const ws = XLSX.utils.aoa_to_sheet([[fileName]]);

    // Merge cells from A1 to G1
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge A1:G1
    ];

    XLSX.utils.sheet_add_json(ws, exportData, {
      origin: "A2",
      header: [
        "序号",
        "单位",
        "单位、部门自查得分",
        "各单位自查情况",
        "检查情况",
        "绩效考核领导小组核定情况",
        "正激励人次",
        "负激励人次",
        "备注",
      ],
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 设置列宽
    const colWidths = [
      { wch: 10 }, // 序号
      { wch: 20 }, // 单位
      { wch: 20 }, // 单位、部门自查得分
      { wch: 25 }, // 各单位自查情况
      { wch: 25 }, // 检查情况
      { wch: 25 }, // 绩效考核领导小组核定情况
      { wch: 20 }, // 正激励人次
      { wch: 20 }, // 负激励人次
      { wch: 20 }, // 备注
    ];
    ws["!cols"] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, fileName);
    // 导出文件
    XLSX.writeFile(wb, fileName);
    message.success("导出成功");
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">单位绩效</h1>
        <Space>
          {selfCheckedDepartmentCount?.lastUpdateTime && (
            <div className="flex gap-2">
              <div className="text-gray-500">
                自查部门数：
                {selfCheckedDepartmentCount?.numberOfSelfCheckedUnits}/
                {selfCheckedDepartmentCount?.unitTotal}
              </div>
              <div className="text-gray-500">
                最后更新时间：
                {selfCheckedDepartmentCount?.lastUpdateTime
                  ? formatRelativeDate(
                      new Date(selfCheckedDepartmentCount.lastUpdateTime)
                    )
                  : "-"}
              </div>
            </div>
          )}
          <ConfigProvider locale={zhCN}>
            <DatePicker.MonthPicker
              value={dayjs(yearMonth)}
              onChange={handleMonthChange}
              placeholder="选择年月"
            />
          </ConfigProvider>
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
          <Button
            onClick={handleBatchExport}
            disabled={!selectedRowKeys.length}
          >
            导出选中
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleExportYear()}
          >
            {dayjs(yearMonth).format("YYYY年")}
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleExportAll()}
          >
            {dayjs(yearMonth).format("YYYY年MM月")}
          </Button>
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
        scroll={{ x: 1800 }}
      />
    </div>
  );
}
