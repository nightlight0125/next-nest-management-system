"use client";

import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { fetchWrapper } from "@/lib/utils";

export default function Login() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const user = await fetchWrapper("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });
      console.log(user?.data?.role?.roleMenus);
      if (
        !user?.data?.role?.roleMenus ||
        user?.data?.role?.roleMenus?.length === 0
      ) {
        messageApi.error("您没有权限访问系统");
        return;
      }
      // Store user data
      localStorage.setItem("user", JSON.stringify(user?.data));
      localStorage.setItem(
        "menuItems",
        JSON.stringify(
          user?.data?.role?.roleMenus?.map((item: any) => item?.menu?.path) ||
            []
        )
      );
      messageApi.destroy();
      messageApi.success("登录成功");
      router.push(user?.data?.role?.roleMenus?.[0]?.menu?.description || "/");
      // Handle successful login, e.g., store tokens, redirect, etc.
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error("账号或密码错误");
      // Handle login failure, e.g., show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-2/3 ml-auto mr-auto">
          <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            欢迎登录
          </h1>
          <div className="space-y-5">
            {contextHolder}
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              className="transition-all duration-300"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: "请输入用户名!" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="用户名"
                  className="h-12 rounded-lg transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "请输入密码!" }]}
              >
                <Input
                  prefix={<LockOutlined className="text-gray-400" />}
                  type="password"
                  placeholder="密码"
                  className="h-12 rounded-lg transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  loading={loading}
                  block
                  type="primary"
                  htmlType="submit"
                  className="h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                >
                  登录
                </Button>
              </Form.Item>
              {/* <Form.Item className="mb-0">
                <Flex align="center" justify="space-between">
                  <a className="text-gray-500 hover:text-blue-500 transition-colors duration-300">
                    忘记密码?
                  </a>
                  <Link
                    href="/register"
                    className="text-blue-500 hover:text-blue-600 transition-colors duration-300"
                  >
                    立即注册
                  </Link>
                </Flex>
              </Form.Item> */}
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}
