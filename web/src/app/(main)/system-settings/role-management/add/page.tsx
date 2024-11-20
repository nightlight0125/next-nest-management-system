"use client";
import { fetchWrapper } from "@/lib/utils";
import {
  Form,
  Input,
  Button,
  message,
  Space,
  Select,
  Checkbox,
  Spin,
} from "antd";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface MenuOption {
  id: string;
  name: string;
}

export default function AddRolePage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [menuOptions, setMenuOptions] = useState<MenuOption[] | null>(null);

  const router = useRouter();

  const fetchMenus = async () => {
    try {
      const result = await fetchWrapper("/menu/all");
      setMenuOptions(result.data as MenuOption[]);
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "无法加载菜单选项");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const onFinish = async (values: { name: string; menuIds: string[] }) => {
    try {
      setLoading(true);
      await fetchWrapper("/role", {
        method: "POST",
        body: JSON.stringify(values),
      });
      messageApi.destroy();
      messageApi.success("角色添加成功");
      router.push("/system-settings/role-management");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "角色添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {contextHolder}
      <h1 className="text-2xl font-bold mb-4">新增角色</h1>
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ menuIds: [] }}
      >
        <Form.Item
          label="角色名称"
          name="name"
          rules={[{ required: true, message: "请输入角色名称!" }]}
        >
          <Input placeholder="请输入角色名称" maxLength={50} />
        </Form.Item>

        <Form.Item label="菜单" name="menuIds" rules={[{ required: false }]}>
          <Checkbox.Group>
            {menuOptions?.map((menu) => (
              <Checkbox key={menu.id} value={menu.id}>
                {menu.name}
              </Checkbox>
            ))}
            {menuOptions?.length === 0 && (
              <div className="text-gray-500">暂无菜单</div>
            )}
          </Checkbox.Group>
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
