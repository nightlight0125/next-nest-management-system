"use client";
import { fetchWrapper } from "@/lib/utils";
import { Form, Input, Button, message, Space } from "antd";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditUnitPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const unit = await fetchWrapper(`/unit/${id}`);
        form.setFieldsValue(unit);
      } catch (error: any) {
        messageApi.error(error?.message || "无法加载单位信息");
      }
    };
    fetchUnit();
  }, [id, form, messageApi]);

  const onFinish = async (values: { name: string }) => {
    try {
      setLoading(true);
      await fetchWrapper(`/unit/${id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      messageApi.destroy();
      messageApi.success("单位更新成功");
      router.push("/unit-management");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "单位更新失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {contextHolder}
      <h1 className="text-2xl font-bold mb-4">编辑单位</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ remember: true }}
      >
        <Form.Item
          label="单位名称"
          name="name"
          rules={[{ required: true, message: "请输入单位名称!" }]}
        >
          <Input placeholder="请输入单位名称" maxLength={50} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button onClick={() => router.back()}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              更新
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
