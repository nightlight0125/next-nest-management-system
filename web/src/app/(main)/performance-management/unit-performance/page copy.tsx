"use client";
import { Table, Button, DatePicker, Space, Popconfirm, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import Link from "next/link";
import { DownloadOutlined } from "@ant-design/icons";

// 定义数据类型
interface DataType {
  key: string;
  createTime: string;
  month: string;
  unit: string;
  selfScore: string;
  selfCheckStatus: string;
  checkStatus: string;
  performanceCheckStatus: string;
  remark: string;
  updateTime: string;
}

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 示例数据
  const data: DataType[] = [
    {
      key: "1",
      createTime: "2024-03-20 10:00:00",
      month: "2024-03",
      unit: "技术部",
      selfScore: "95",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "表现优秀",
      updateTime: "2024-03-20 15:30:00",
    },
    {
      key: "2",
      createTime: "2024-03-20 09:30:00",
      month: "2024-03",
      unit: "市场部",
      selfScore: "88",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "市场推广效果良好",
      updateTime: "2024-03-20 16:00:00",
    },
    {
      key: "3",
      createTime: "2024-03-19 14:20:00",
      month: "2024-03",
      unit: "人力资源部",
      selfScore: "92",
      selfCheckStatus: "已完成",
      checkStatus: "审核中",
      performanceCheckStatus: "审核中",
      remark: "团队管理有序",
      updateTime: "2024-03-19 17:45:00",
    },
    {
      key: "4",
      createTime: "2024-03-19 11:15:00",
      month: "2024-03",
      unit: "财务部",
      selfScore: "94",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "财务管理规范",
      updateTime: "2024-03-19 16:30:00",
    },
    {
      key: "5",
      createTime: "2024-03-18 09:45:00",
      month: "2024-03",
      unit: "销售部",
      selfScore: "87",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "销售目标达成率高",
      updateTime: "2024-03-18 14:20:00",
    },
    {
      key: "6",
      createTime: "2024-03-18 08:30:00",
      month: "2024-03",
      unit: "客服部",
      selfScore: "90",
      selfCheckStatus: "已完成",
      checkStatus: "待审核",
      performanceCheckStatus: "待审核",
      remark: "客户满意度提升",
      updateTime: "2024-03-18 13:15:00",
    },
    {
      key: "7",
      createTime: "2024-03-17 15:40:00",
      month: "2024-03",
      unit: "研发部",
      selfScore: "96",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "研发进度超前",
      updateTime: "2024-03-17 18:00:00",
    },
    {
      key: "8",
      createTime: "2024-03-17 14:10:00",
      month: "2024-03",
      unit: "运营部",
      selfScore: "89",
      selfCheckStatus: "进行中",
      checkStatus: "待审核",
      performanceCheckStatus: "待审核",
      remark: "运营效率提升",
      updateTime: "2024-03-17 17:30:00",
    },
    {
      key: "9",
      createTime: "2024-03-16 13:20:00",
      month: "2024-03",
      unit: "品控部",
      selfScore: "93",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "质量控制严格",
      updateTime: "2024-03-16 16:45:00",
    },
    {
      key: "10",
      createTime: "2024-03-16 10:30:00",
      month: "2024-03",
      unit: "采购部",
      selfScore: "91",
      selfCheckStatus: "已完成",
      checkStatus: "审核中",
      performanceCheckStatus: "审核中",
      remark: "采购成本优化",
      updateTime: "2024-03-16 15:20:00",
    },
    {
      key: "11",
      createTime: "2024-03-15 16:25:00",
      month: "2024-03",
      unit: "行政部",
      selfScore: "88",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "行政支持到位",
      updateTime: "2024-03-15 18:30:00",
    },
    {
      key: "12",
      createTime: "2024-03-15 14:15:00",
      month: "2024-03",
      unit: "法务部",
      selfScore: "94",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "合规性保障良好",
      updateTime: "2024-03-15 17:40:00",
    },
    {
      key: "13",
      createTime: "2024-03-14 11:30:00",
      month: "2024-03",
      unit: "战略发展部",
      selfScore: "95",
      selfCheckStatus: "已完成",
      checkStatus: "审核中",
      performanceCheckStatus: "审核中",
      remark: "战略规划完善",
      updateTime: "2024-03-14 16:20:00",
    },
    {
      key: "14",
      createTime: "2024-03-14 09:45:00",
      month: "2024-03",
      unit: "培训部",
      selfScore: "89",
      selfCheckStatus: "进行中",
      checkStatus: "待审核",
      performanceCheckStatus: "待审核",
      remark: "培训效果显著",
      updateTime: "2024-03-14 14:30:00",
    },
    {
      key: "15",
      createTime: "2024-03-13 15:50:00",
      month: "2024-03",
      unit: "设计部",
      selfScore: "92",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "创意设计出色",
      updateTime: "2024-03-13 18:15:00",
    },
    {
      key: "16",
      createTime: "2024-03-13 13:40:00",
      month: "2024-03",
      unit: "物流部",
      selfScore: "87",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "配送效率提高",
      updateTime: "2024-03-13 16:50:00",
    },
    {
      key: "17",
      createTime: "2024-03-12 10:20:00",
      month: "2024-03",
      unit: "安保部",
      selfScore: "90",
      selfCheckStatus: "已完成",
      checkStatus: "审核中",
      performanceCheckStatus: "审核中",
      remark: "安全保障有力",
      updateTime: "2024-03-12 15:40:00",
    },
    {
      key: "18",
      createTime: "2024-03-12 09:15:00",
      month: "2024-03",
      unit: "公关部",
      selfScore: "93",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "公共关系良好",
      updateTime: "2024-03-12 14:25:00",
    },
    {
      key: "19",
      createTime: "2024-03-11 16:30:00",
      month: "2024-03",
      unit: "数据分析部",
      selfScore: "96",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "数据分析精准",
      updateTime: "2024-03-11 18:45:00",
    },
    {
      key: "20",
      createTime: "2024-03-11 14:25:00",
      month: "2024-03",
      unit: "产品部",
      selfScore: "91",
      selfCheckStatus: "进行中",
      checkStatus: "待审核",
      performanceCheckStatus: "待审核",
      remark: "产品创新突出",
      updateTime: "2024-03-11 17:35:00",
    },
    {
      key: "21",
      createTime: "2024-03-10 11:40:00",
      month: "2024-03",
      unit: "质检部",
      selfScore: "94",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "质量把控严格",
      updateTime: "2024-03-10 16:15:00",
    },
    {
      key: "22",
      createTime: "2024-03-10 09:35:00",
      month: "2024-03",
      unit: "企划部",
      selfScore: "88",
      selfCheckStatus: "已完成",
      checkStatus: "审核中",
      performanceCheckStatus: "审核中",
      remark: "策划方案创新",
      updateTime: "2024-03-10 14:50:00",
    },
    {
      key: "23",
      createTime: "2024-03-09 15:45:00",
      month: "2024-03",
      unit: "国际业务部",
      selfScore: "95",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "国际业务拓展顺利",
      updateTime: "2024-03-09 18:20:00",
    },
    {
      key: "24",
      createTime: "2024-03-09 13:50:00",
      month: "2024-03",
      unit: "知识产权部",
      selfScore: "92",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "专利申请增加",
      updateTime: "2024-03-09 17:10:00",
    },
    {
      key: "25",
      createTime: "2024-03-09 10:15:00",
      month: "2024-03",
      unit: "环保部",
      selfScore: "89",
      selfCheckStatus: "已完成",
      checkStatus: "已审核",
      performanceCheckStatus: "已审核",
      remark: "环保指标达标",
      updateTime: "2024-03-09 15:30:00",
    },
  ];

  // 处理编辑
  const handleEdit = (record: DataType) => {
    console.log("编辑:", record);
  };

  // 处理查看详情
  const handleView = (record: DataType) => {
    console.log("查看详情:", record);
  };

  // 处理删除
  const handleDelete = (record: DataType) => {
    console.log("删除:", record);
    message.success("删除成功");
  };

  // 定义列
  const columns: ColumnsType<DataType> = [
    {
      title: "单位",
      dataIndex: "unit",
      key: "unit",
      width: 150,
    },
    {
      title: "月份",
      dataIndex: "month",
      key: "month",
      width: 150,
    },
    {
      title: "单位部门自查得分",
      dataIndex: "selfScore",
      key: "selfScore",
      width: 250,
    },
    {
      title: "各单位自查情况",
      dataIndex: "selfCheckStatus",
      key: "selfCheckStatus",
      width: 250,
    },
    {
      title: "检查情况",
      dataIndex: "checkStatus",
      key: "checkStatus",
      width: 250,
    },
    {
      title: "绩效考核小组核定情况",
      dataIndex: "performanceCheckStatus",
      key: "performanceCheckStatus",
      width: 150,
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      width: 150,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 150,
    },
    {
      title: "操作",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space>
          <Link href={`/performance/${record.key}/edit`}>
            <Button type="link">编辑</Button>
          </Link>
          <Link href={`/performance/${record.key}/detail`}>
            <Button type="link">详情</Button>
          </Link>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record)}
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

  // 处理月份变化
  const handleMonthChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      setLoading(true);
      // 这里可以添加获取数据的逻辑
      setTimeout(() => setLoading(false), 500);
    }
  };

  // 处理导出Excel
  const handleExport = (data: DataType[]) => {
    // 准备导出数据
    const exportData = data.map((item) => ({
      单位: item.unit,
      月份: item.month,
      单位部门自查得分: item.selfScore,
      各单位自查情况: item.selfCheckStatus,
      检查情况: item.checkStatus,
      绩效考核小组核定情况: item.performanceCheckStatus,
      备注: item.remark,
      创建时间: item.createTime,
      更新时间: item.updateTime,
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 设置列宽
    const colWidths = [
      { wch: 20 }, // 创建时间
      { wch: 15 }, // 单位
      { wch: 15 }, // 自查得分
      { wch: 15 }, // 自查情况
      { wch: 15 }, // 检查情况
      { wch: 30 }, // 备注
      { wch: 20 }, // 更新时间
    ];
    ws["!cols"] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "绩效数据");

    // 生成文件名（使用当前选择的年月）
    const fileName = `绩效数据_${selectedDate.format("YYYY年MM月")}.xlsx`;

    // 导出文件
    XLSX.writeFile(wb, fileName);
    message.success("导出成功");
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleBatchDelete = () => {
    console.log("删除选中的记录:", selectedRowKeys);
    message.success("批量删除成功");
    // 在这里添加删除逻辑
  };

  const handleBatchExport = () => {
    const selectedData = data.filter((item) =>
      selectedRowKeys.includes(item.key)
    );
    // 清楚选中
    setSelectedRowKeys([]);
    console.log("导出选中的记录:", selectedData);
    handleExport(selectedData);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">单位绩效</h1>
        <Space>
          <div className="text-gray-500">自查部门数：10/25</div>
          <div className="text-gray-500">
            最后更新时间：{data[0]?.updateTime || "-"}
          </div>
          {/* <DatePicker.MonthPicker
            value={selectedDate}
            onChange={handleMonthChange}
            placeholder="选择年月"
          /> */}
          <Button
            onClick={handleBatchDelete}
            disabled={!selectedRowKeys.length}
          >
            批量删除
          </Button>
          <Button
            onClick={handleBatchExport}
            disabled={!selectedRowKeys.length}
          >
            导出选中
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleExport(data)}
          >
            导出全部
          </Button>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          total: data.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1300 }}
      />
    </div>
  );
}
