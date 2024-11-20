"use client";
import { fetchWrapper } from "@/lib/utils";
import { Form, Input, Button, message, Space } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddUserPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { name: string }) => {
    try {
      setLoading(true);
      await fetchWrapper("/unit", {
        method: "POST",
        body: JSON.stringify(values),
      });
      messageApi.destroy();
      messageApi.success("单位添加成功");
      router.push("/unit-management");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "单位添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {contextHolder}
      <h1 className="text-2xl font-bold mb-4">新增单位</h1>
      <Form
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
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
