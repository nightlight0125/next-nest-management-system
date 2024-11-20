"use client";
import { Descriptions, Table, Card, Button, Space, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { fetchWrapper } from "@/lib/utils";
import { useEffect, useState } from "react";

// 定义详情数据类型
interface DetailData {
  id: string;
  unit: { name: string };
  yearMonth: string;
  selfCheckedScore: string;
  perUnitSelfCheckedCondition: any[];
  examinationCondition: any[];
  reviewStateOfPerformanceTeam: any[];
  createPerson: string;
  editPerson: string;
  createdAt: Date;
  remark: string;
}

// 定义记录数据类型
interface RecordData {
  key: string;
  date: string;
  operator: string;
  action: string;
  description: string;
}

export default function DetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageApi, contextHolder] = message.useMessage();

  // 模拟操作记录数据
  const recordData: RecordData[] = [
    {
      key: "1",
      date: "2024-03-20 10:00:00",
      operator: "张三",
      action: "创建",
      description: "创建自查报告",
    },
    {
      key: "2",
      date: "2024-03-20 11:30:00",
      operator: "张三",
      action: "更新",
      description: "更新自查得分",
    },
    {
      key: "3",
      date: "2024-03-20 15:30:00",
      operator: "李四",
      action: "审核",
      description: "完成审核并通过",
    },
  ];

  // 定义记录表格列
  const columns: ColumnsType<RecordData> = [
    {
      title: "操作时间",
      dataIndex: "date",
      key: "date",
      width: 180,
    },
    {
      title: "操作人",
      dataIndex: "operator",
      key: "operator",
      width: 120,
    },
    {
      title: "操作类型",
      dataIndex: "action",
      key: "action",
      width: 120,
    },
    {
      title: "操作说明",
      dataIndex: "description",
      key: "description",
    },
  ];

  const fetchDetailData = async (id: string) => {
    try {
      setLoading(true);
      const data = await fetchWrapper(
        `/current-year-month-unit-performance/${id}`
      );
      setDetailData(data);
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "Failed to fetch detail data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetailData(id as string);
    }
  }, [id]);

  return (
    <div className="p-6">
      {contextHolder}
      {/* 顶部返回按钮 */}
      <div className="mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          返回
        </Button>
      </div>
      {/* 基本信息卡片 */}
      <Card title="基本信息" className="mb-4">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="单位">
            {detailData?.unit?.name}
          </Descriptions.Item>
          <Descriptions.Item label="年月">
            {detailData?.yearMonth}
          </Descriptions.Item>
          <Descriptions.Item label="自查得分">
            {detailData?.selfCheckedScore}
          </Descriptions.Item>
          <Descriptions.Item label="各单位自查情况" span={2}>
            {detailData?.perUnitSelfCheckedCondition.map((item) => (
              <div key={item.id}>
                {item.responsiblePerson +
                  "：" +
                  item.responsiblePersonScore +
                  " " +
                  item.responsiblePersonRemark}
              </div>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="检查情况">
            {detailData?.examinationCondition ? (
              detailData?.examinationCondition?.map((item) => (
                <div key={item.id}>
                  {item.relatedSelfCheckedID +
                    "" +
                    item.examinationScore +
                    "分 ：" +
                    item.examinationContent +
                    "\n"}
                </div>
              ))
            ) : (
              <span className="bg-red-500 text-white px-2 py-1 rounded-md opacity-85">
                未完成
              </span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="绩效考核小组核定情况">
            {detailData?.reviewStateOfPerformanceTeam ? (
              detailData?.reviewStateOfPerformanceTeam?.map((item) => (
                <div key={item.id}>
                  {item.relatedExaminationID +
                    "" +
                    item.examinationScore +
                    "分 ：" +
                    item.examinationContent +
                    "\n"}
                </div>
              ))
            ) : (
              <span className="bg-red-500 text-white px-2 py-1 rounded-md opacity-85">
                未完成
              </span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="备注">
            {detailData?.remark}
          </Descriptions.Item>
          <Descriptions.Item label="创建人">
            {detailData?.createPerson?.username}
          </Descriptions.Item>
          <Descriptions.Item label="编辑人">
            {detailData?.editPerson?.username}
          </Descriptions.Item>
          <Descriptions.Item label="审查人">
            {detailData?.auditPerson?.username}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>
            {detailData?.createdAt
              ? new Date(detailData?.createdAt).toLocaleString()
              : ""}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      {/* 操作记录表格 */}
      {/* <Card title="操作记录">
        <Table columns={columns} dataSource={recordData} pagination={false} />
      </Card> */}
    </div>
  );
}
