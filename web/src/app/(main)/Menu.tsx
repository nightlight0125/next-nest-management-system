"use client";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HomeOutlined,
  UploadOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  ApartmentOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { usePathname } from "next/navigation";

type MenuItem = Required<MenuProps>["items"][number];

export default function Page() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const pathname = usePathname();
  const menu = [
    {
      key: "home",
      path: "/",
      label: <Link href="/">首页</Link>,
      icon: <HomeOutlined />,
    },
    {
      key: "uploadPerformance",
      path: "/upload-performance",
      label: <Link href="/upload-performance">上传绩效</Link>,
      icon: <UploadOutlined />,
    },
    {
      key: "performanceManagement",
      label: "绩效管理",
      icon: <BarChartOutlined />,
      children: [
        {
          key: "performanceList",
          path: "/performance-management/performance-list",
          label: (
            <Link href="/performance-management/performance-list">
              绩效列表
            </Link>
          ),
          icon: <UnorderedListOutlined />,
        },
        {
          key: "unitPerformance",
          path: "/performance-management/unit-performance",
          label: (
            <Link href="/performance-management/unit-performance">
              单位绩效
            </Link>
          ),
          icon: <ApartmentOutlined />,
        },
      ],
    },
    {
      key: "unitManagement",
      path: "/unit-management",
      label: <Link href="/unit-management">单位管理</Link>,
      icon: <TeamOutlined />,
    },
    {
      key: "systemSettings",
      label: "系统设置",
      icon: <SettingOutlined />,
      children: [
        {
          key: "userManagement",
          path: "/system-settings/user-management",
          label: <Link href="/system-settings/user-management">用户管理</Link>,
          icon: <UserOutlined />,
        },
        {
          key: "roleManagement",
          path: "/system-settings/role-management",
          label: <Link href="/system-settings/role-management">角色管理</Link>,
          icon: <SafetyOutlined />,
        },
        {
          key: "menuManagement",
          path: "/system-settings/menu-management",
          label: <Link href="/system-settings/menu-management">菜单管理</Link>,
          icon: <MenuOutlined />,
        },
      ],
    },
  ];

  const generateMenuItems = async () => {
    try {
      const menuItems = JSON.parse(localStorage.getItem("menuItems") || "[]");
      const accessMenuItems: MenuItem[] = [];
      menu.forEach((item: MenuItem) => {
        if (menuItems.includes(item?.key)) accessMenuItems.push(item);
      });
      setMenuItems(accessMenuItems);
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "无法加载菜单选项");
    }
  };

  useEffect(() => {
    generateMenuItems();
  }, []);

  return (
    <>
      {contextHolder}
      <Menu
        mode="inline"
        defaultSelectedKeys={[pathname]}
        defaultOpenKeys={["/"]}
        items={menuItems}
        className="border-none"
        style={{
          height: "calc(100% - 64px)",
          overflowY: "auto",
        }}
      />
    </>
  );
}
