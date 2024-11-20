import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Layout, Menu, theme, Button, Dropdown, message } from "antd";
import type { MenuProps } from "antd";
const { Header } = Layout;
import { Avatar } from "antd";
import { useRouter } from "next/navigation";
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { fetchWrapper } from "@/lib/utils";

export default function Navbar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      await fetchWrapper("/auth/logout", {
        method: "POST",
      });
      localStorage.removeItem("menuItems");
      localStorage.removeItem("user");
      messageApi.success("退出成功");
      router.push("/login");
    } catch {
      messageApi.error("发生错误");
    }
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(currentUser);
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

    socket.on("logout", (data) => {
      // Logic to handle user logout, e.g., redirect to login page
      if (data?.userId === currentUser?.id) {
        messageApi.info(
          data?.message === "delete"
            ? "您的账号已删除"
            : data?.message === "update"
              ? "您的账号已修改密码，请重新登录"
              : "您的账号已在其他设备登录"
        );
        handleLogout();
        if (socket) {
          socket.close();
          console.log("WebSocket connection closed");
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const menu: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Menu>
          <Menu.Item key="logout" onClick={handleLogout}>
            退出登录
          </Menu.Item>
        </Menu>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Header
        style={{
          padding: 0,
          background: colorBgContainer,
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="flex items-center justify-between px-6 h-full">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <div className="flex items-center">
            <Dropdown
              placement="bottom"
              menu={{ items: menu }}
              className="p-0 d-block"
            >
              <Avatar
                icon={<UserOutlined />}
                className="cursor-pointer"
                style={{
                  backgroundColor: "#165dff",
                }}
              />
            </Dropdown>
            <span className="ml-2">{user?.username}</span>
          </div>
        </div>
      </Header>
    </>
  );
}
