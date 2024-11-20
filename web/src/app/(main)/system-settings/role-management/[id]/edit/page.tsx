"use client";
import { Form, Input, Button, Checkbox, message, Space } from "antd";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWrapper } from "@/lib/utils";

export default function EditRolePage() {
  const [loading, setLoading] = useState(false);
  const [checkedList, setCheckedList] = useState<string[] | null>(null);
  const [checkAll, setCheckAll] = useState(false);
  const [menuOptions, setMenuOptions] = useState<string[]>([]);
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = useParams();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const role = await fetchWrapper(`/role/${id}`);
        form.setFieldsValue({ roleName: role.name });
        setCheckedList(role.roleMenus.map((menu: any) => menu.id));
        setCheckAll(role.roleMenus.length === menuOptions.length);
      } catch (error: any) {
        messageApi.destroy();
        messageApi.error(error?.message || "无法加载角色信息");
      }
    };

    const fetchMenus = async () => {
      try {
        const result = await fetchWrapper("/menu/all");
        setMenuOptions(
          result.data.map((menu: any) => ({ id: menu.id, name: menu.name }))
        );
      } catch (error: any) {
        messageApi.destroy();
        messageApi.error(error?.message || "无法加载菜单选项");
      }
    };

    fetchMenus().then(fetchRole);
  }, [id, form, messageApi, menuOptions.length]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await fetchWrapper(`/role/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: values.roleName,
          menuIds: checkedList,
        }),
      });
      messageApi.destroy();
      messageApi.success("角色信息更新成功");
      router.push("/system-settings/role-management");
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "角色信息更新失败");
    } finally {
      setLoading(false);
    }
  };

  const onCheckAllChange = (e: any) => {
    setCheckedList(e.target.checked ? menuOptions.map((item) => item.id) : []);
    setCheckAll(e.target.checked);
  };

  const onChange = (list: string[]) => {
    setCheckedList(list);
    setCheckAll(list.length === menuOptions.length);
  };

  return (
    <div className="p-6">
      {contextHolder}
      <h1 className="text-2xl font-bold mb-4">编辑角色</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ accessibleMenus: checkedList }}
      >
        <Form.Item
          label="角色名称"
          name="roleName"
          rules={[{ required: true, message: "请输入角色名称!" }]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item label="可访问菜单" name="accessibleMenus">
          <Checkbox
            indeterminate={
              !!checkedList && checkedList.length < menuOptions.length
            }
            onChange={onCheckAllChange}
            checked={checkAll}
          >
            全选
          </Checkbox>
          <Checkbox.Group
            options={menuOptions.map((menu) => ({
              label: menu.name,
              value: menu.id,
            }))}
            value={checkedList || []}
            onChange={onChange}
          />
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
