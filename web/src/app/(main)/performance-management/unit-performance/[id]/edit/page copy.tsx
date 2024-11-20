"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Space,
  Card,
  InputNumber,
  Divider,
  DatePicker,
  Select,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { fetchWrapper } from "@/lib/utils";
import LoadingPage from "@/components/LoadingPage";
import { v4 as uuidv4 } from "uuid";
import zhCN from "antd/lib/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import { useRouter, useParams } from "next/navigation";

interface SelfCheckItem {
  id: string;
  examinationContent: string;
  examinationScore: number;
  relatedSelfCheckedID: string;
}

export default function PerformanceEdit() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [selfCheckItems, setSelfCheckItems] = useState<SelfCheckItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const { id } = useParams();

  const fetchDetailData = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const res = await fetchWrapper(`/user/${user.id}`);
    setUserData(res.data);
    const detailData = await fetchWrapper(
      `/current-year-month-unit-performance/${id}`
    );
    setDetailData(detailData);
  };

  useEffect(() => {
    try {
      setLoading(true);
      fetchDetailData();
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error.message || "获取用户数据失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <LoadingPage />;

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (!values.examination) {
        messageApi.error("请添加检查项");
        return;
      }
      const examinationCondition: any[] = [];
      Object.keys(values.examination).forEach((key) => {
        examinationCondition.push({
          examinationContent: values.examination[key].examinationContent,
          examinationScore: values.examination[key].score,
          relatedSelfCheckedID: values.examination[key].relatedSelfCheckedID,
        });
      });
      const data = {
        editPersonId: userData?.id,
        examinationCondition: JSON.stringify(examinationCondition),
      };

      await fetchWrapper(`/current-year-month-unit-performance/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      messageApi.destroy();
      messageApi.success("更新成功");
      router.back();
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error.message || "更新失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 添加新的自查项
  const addSelfCheckItem = () => {
    const newItem: SelfCheckItem = {
      id: uuidv4(),
      examinationContent: "",
      examinationScore: 0,
      relatedSelfCheckedID: "",
    };
    setSelfCheckItems([...selfCheckItems, newItem]);
  };

  const deleteItem = (key) => {
    setSelfCheckItems([...selfCheckItems.filter((i) => key !== i.key)]);
  };

  return (
    <div style={{ padding: "24px" }}>
      <ConfigProvider locale={zhCN}>
        {contextHolder}
        {userData?.unitId ? (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* 单位选择 */}
            <Form.Item
              label="单位"
              name="unitId"
              initialValue={userData?.unit?.name}
              rules={[{ required: true, message: "请输入单位" }]}
            >
              <Input placeholder="请输入单位" disabled />
            </Form.Item>

            {/* 选择月份 */}

            <Form.Item
              label="月份"
              name="month"
              rules={[{ required: true, message: "请选择月份" }]}
              initialValue={dayjs(detailData?.yearMonth)}
            >
              <DatePicker.MonthPicker
                value={dayjs(detailData?.yearMonth)}
                placeholder="选择年月"
                disabled
              />
            </Form.Item>

            {/* 综合得分 */}

            <Form.Item
              key={detailData?.id}
              label="综合得分"
              name="selfCheckedScore"
              rules={[{ required: true, message: "请输入综合得分" }]}
              initialValue={detailData?.selfCheckedScore}
            >
              <InputNumber
                key={detailData?.id}
                min={0}
                max={100}
                value={detailData?.selfCheckedScore}
                disabled
              />
            </Form.Item>

            {/* 自查情况列表 */}

            <>
              <Divider>各单位自查情况</Divider>
              {detailData?.perUnitSelfCheckedCondition?.map((item: any) => (
                <Card key={item.id} style={{ marginBottom: "16px" }}>
                  <Space direction="horizontal" style={{ width: "100%" }}>
                    <Form.Item
                      label="责任人"
                      name={["selfCheck", item.id, "responsible"]}
                      rules={[{ required: true, message: "请输入责任人" }]}
                      initialValue={item.responsiblePerson}
                      style={{ flex: "0 0 150px" }} // Adjust width
                    >
                      <Input placeholder="请输入责任人" disabled />
                    </Form.Item>
                    <Form.Item
                      label="得分"
                      name={["selfCheck", item.id, "score"]}
                      rules={[{ required: true, message: "请输入得分" }]}
                      initialValue={item.responsiblePersonScore}
                    >
                      <InputNumber placeholder="请输入得分" disabled />
                    </Form.Item>
                    <Form.Item
                      label="原因"
                      name={["selfCheck", item.id, "reason"]}
                      rules={[{ required: true, message: "请输入原因" }]}
                      initialValue={item.responsiblePersonRemark}
                      style={{ flex: "1" }} // Adjust width
                    >
                      <Input placeholder="请输入原因" disabled />
                    </Form.Item>
                  </Space>
                </Card>
              ))}
            </>

            {/* 检查情况 */}
            {detailData?.examinationCondition ? (
              <>
                <Divider>检查情况</Divider>
                {detailData?.examinationCondition?.map((item: any) => (
                  <Card key={item.id} style={{ marginBottom: "16px" }}>
                    <Space direction="horizontal" style={{ width: "100%" }}>
                      <Form.Item
                        label="检查内容"
                        name={["examination", item.id, "examinationContent"]}
                        rules={[{ required: true, message: "请输入检查内容" }]}
                        initialValue={item.examinationContent}
                        style={{ flex: "0 0 150px" }} // Adjust width
                      >
                        <Input placeholder="请输入检查内容" disabled />
                      </Form.Item>
                      <Form.Item
                        label="得分"
                        name={["examination", item.id, "examinationScore"]}
                        rules={[{ required: true, message: "请输入得分" }]}
                        initialValue={item.examinationScore}
                      >
                        <InputNumber placeholder="请输入得分" disabled />
                      </Form.Item>
                    </Space>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Divider>检查情况</Divider>
                {selfCheckItems.map((item) => (
                  <Card key={item.id} style={{ marginBottom: "16px" }}>
                    <Space direction="horizontal" style={{ width: "100%" }}>
                      <Form.Item
                        label="责任人"
                        name={["examination", item.id, "relatedSelfCheckedID"]}
                        style={{ flex: "1", width: "180px" }} // Adjust width
                      >
                        <Select
                          placeholder="请选择责任人"
                          mode="tags"
                          onChange={(value) => {
                            if (value.length > 1) {
                              value.pop(); // Remove the last added item if more than 2
                            }
                          }}
                        >
                          {detailData?.perUnitSelfCheckedCondition?.map(
                            (item: any) => (
                              <Select.Option
                                key={item.id}
                                value={item.responsiblePerson}
                              >
                                {item.responsiblePerson}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label="得分"
                        name={["examination", item.id, "score"]}
                        rules={[{ required: true, message: "请输入得分" }]}
                      >
                        <InputNumber placeholder="请输入得分" />
                      </Form.Item>
                      <Form.Item
                        label="原因"
                        name={["examination", item.id, "examinationContent"]}
                        rules={[{ required: true, message: "请输入原因" }]}
                        style={{ flex: "0 0 150px" }} // Adjust width
                      >
                        <Input placeholder="请输入原因" />
                      </Form.Item>
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteItem(item.key)}
                      >
                        删除
                      </Button>
                    </Space>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={addSelfCheckItem}
                  block
                  icon={<PlusOutlined />}
                  className="mb-12"
                >
                  添加检查项
                </Button>
              </>
            )}

            <Form.Item>
              <Space>
                <Button onClick={() => router.back()}>取消</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  更新
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <div className="text-center text-lg mt-12 text-gray-500 rounded-lg">
            请绑定单位
          </div>
        )}
      </ConfigProvider>
    </div>
  );
}
