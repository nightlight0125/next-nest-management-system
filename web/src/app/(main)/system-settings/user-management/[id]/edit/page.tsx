"use client";
import { Form, Input, Button, Select, message, Space } from "antd";
import { useState, useEffect } from "react";
import { fetchWrapper } from "@/lib/utils"; // Ensure this utility is available
import { useParams, useRouter } from "next/navigation";

const { Option } = Select;

export default function EditUserPage() {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [roles, setRoles] = useState([]);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { id } = useParams();

  useEffect(() => {
    // Fetch units and roles from the API
    const fetchUnitsAndRoles = async () => {
      try {
        const [unitsData, rolesData] = await Promise.all([
          fetchWrapper("/unit/all"), // Adjust the endpoint as needed
          fetchWrapper("/role/all"), // Adjust the endpoint as needed
        ]);
        setUnits(unitsData.data);
        setRoles(rolesData.data);
      } catch (error) {
        messageApi.destroy();
        messageApi.error("无法获取单位和角色信息");
      }
    };

    fetchUnitsAndRoles();

    // Simulate fetching user data
    const fetchUserData = async () => {
      try {
        const userData = await fetchWrapper(`/user/${id}`);
        form.setFieldsValue(userData.data);
      } catch (error) {
        messageApi.destroy();
        messageApi.error("无法获取用户信息");
      }
    };

    fetchUserData();
  }, [form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await fetchWrapper(`/user/${id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      messageApi.destroy();
      messageApi.success("用户信息更新成功");
      router.push("/system-settings/user-management");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "用户信息更新失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {contextHolder}
      <h1 className="text-2xl font-bold mb-4">编辑用户</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ remember: true }}
      >
        <Form.Item
          label="账号"
          name="username"
          rules={[{ required: true, message: "请输入账号!" }]}
        >
          <Input placeholder="请输入账号" maxLength={50} />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入密码!" }]}
        >
          <Input.Password placeholder="请输入密码" maxLength={50} />
        </Form.Item>

        <Form.Item label="单位" name="unitId">
          <Select placeholder="请选择单位" loading={units.length === 0}>
            {units.map((unit: any) => (
              <Option key={unit.id} value={unit.id}>
                {unit.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="角色" name="roleId">
          <Select placeholder="请选择角色" loading={roles.length === 0}>
            {roles.map((role: any) => (
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
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
