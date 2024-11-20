"use client";
import { fetchWrapper } from "@/lib/utils";
import { Form, Input, Button, message, Space } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddMenuPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: {
    name: string;
    path: string;
    description?: string;
  }) => {
    try {
      setLoading(true);
      await fetchWrapper("/menu", {
        method: "POST",
        body: JSON.stringify(values),
      });
      messageApi.destroy();
      messageApi.success("菜单添加成功");
      router.push("/system-settings/menu-management");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "菜单添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {contextHolder}
      <h1 className="text-2xl font-bold mb-4">新增菜单</h1>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="菜单名称"
          name="name"
          rules={[{ required: true, message: "请输入菜单名称!" }]}
        >
          <Input placeholder="请输入菜单名称" maxLength={50} />
        </Form.Item>

        <Form.Item
          label="路径"
          name="description"
          rules={[{ required: true, message: "请输入路径!" }]}
        >
          <Input placeholder="请输入路径" maxLength={100} />
        </Form.Item>

        <Form.Item
          label="描述"
          name="path"
          rules={[{ required: true, message: "请输入描述!" }]}
        >
          <Input.TextArea placeholder="请输入描述" rows={4} maxLength={200} />
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
