"use client";

import { Button, Form, Input } from "antd";
import Link from "next/link";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const App: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Received values of form: ", values);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
      <div className="flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl bg-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl ">
        <div className="w-full space-y-8 overflow-y-auto p-10 md:w-2/3 ml-auto mr-auto">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              创建新账号
            </h1>
            <p className="text-gray-500">欢迎加入我们</p>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            scrollToFirstError
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              name="nickname"
              rules={[
                {
                  required: true,
                  message: "请输入用户名!",
                  whitespace: true,
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
                className="h-12 rounded-lg transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "请输入密码!",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
                className="h-12 rounded-lg transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "请确认密码!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="确认密码"
                className="h-12 rounded-lg transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item className="mt-6 mb-0">
              <Button
                type="primary"
                htmlType="submit"
                className="h-12 w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
              >
                注册
              </Button>
            </Form.Item>

            <Form.Item className="mb-0 text-center">
              <p className="text-gray-500">
                已有账号？
                <Link
                  href="/login"
                  className="text-blue-500 hover:text-blue-600 transition-colors duration-300 ml-2"
                >
                  立即登录
                </Link>
              </p>
            </Form.Item>
          </Form>
        </div>
      </div>
    </main>
  );
};

export default App;
