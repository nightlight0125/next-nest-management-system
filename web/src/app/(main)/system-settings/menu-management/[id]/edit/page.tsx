"use client";
import { fetchWrapper } from "@/lib/utils";
import { Form, Input, Button, message, Space } from "antd";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditMenuPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menu = await fetchWrapper(`/menu/${id}`);
        form.setFieldsValue(menu);
      } catch (error: any) {
        messageApi.error(error?.message || "无法加载菜单信息");
      }
    };
    fetchMenu();
  }, [id, form, messageApi]);

  const onFinish = async (values: {
    name: string;
    path: string;
    description?: string;
  }) => {
    try {
      setLoading(true);
      await fetchWrapper(`/menu/${id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      messageApi.destroy();
      messageApi.success("菜单更新成功");
      router.push("/system-settings/menu-management");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "菜单更新失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {contextHolder}
      <h1 className="text-2xl font-bold mb-4">编辑菜单</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ remember: true }}
      >
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
              更新
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
