"use client";

import React, { useEffect, useState } from "react";
import { Layout, message, theme } from "antd";
const { Content } = Layout;
import { useRouter, usePathname } from "next/navigation";
import { fetchWrapper } from "@/lib/utils";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import LoadingPage from "@/components/LoadingPage";
export default function App({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [accessPath, setAccessPath] = useState<string[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const pathname = usePathname();

  const menu = [
    {
      key: "home",
      path: "/",
    },
    {
      key: "uploadPerformance",
      path: "/upload-performance",
    },
    {
      key: "performanceManagement",
      children: [
        {
          key: "performanceList",
          path: "/performance-management/performance-list",
        },
        {
          key: "unitPerformance",
          path: "/performance-management/unit-performance",
        },
      ],
    },
    {
      key: "unitManagement",
      path: "/unit-management",
    },
    {
      key: "systemSettings",
      label: "系统设置",
      children: [
        {
          key: "userManagement",
          path: "/system-settings/user-management",
        },
        {
          key: "roleManagement",
          path: "/system-settings/role-management",
        },
        {
          key: "menuManagement",
          path: "/system-settings/menu-management",
        },
      ],
    },
  ];

  const generateMenuItems = async () => {
    try {
      const menuItems = JSON.parse(localStorage.getItem("menuItems") || "[]");
      const accessPath: string[] = [];
      menu.forEach((item) => {
        if (menuItems.includes(item?.key)) {
          if (item?.children) {
            item?.children.forEach((child) => {
              accessPath.push(child?.path);
            });
          } else {
            accessPath.push(item?.path);
          }
        }
      });
      setAccessPath(accessPath);
    } catch (error: any) {
      messageApi.destroy();
      messageApi.error(error?.message || "无法加载菜单选项");
    }
  };

  const getPathAfterSecondSlash = (path: string) => {
    const parts = path.split("/");
    if (parts.length > 2) {
      return parts.slice(0, 2).join("/");
    }
    return path;
  };

  // check if the cookie contains access_token
  useEffect(() => {
    const checkCookie = async () => {
      try {
        await fetchWrapper("/auth/check-cookie");
        await generateMenuItems();
        setLoading(false);
      } catch {
        router.push("/login");
      }
    };
    checkCookie();
  }, [router]);

  useEffect(() => {
    let flag = false;
    if (pathname === "/login") return;
    if (accessPath.length > 0) {
      if (pathname !== "/") {
        accessPath.forEach((path) => {
          if (path.startsWith(getPathAfterSecondSlash(pathname))) {
            flag = true;
          }
        });
      } else {
        if (accessPath.includes("/")) {
          flag = true;
        }
      }
      if (!flag) {
        flag = false;
        router.push(accessPath[0]);
      }
    }
  }, [pathname, router, accessPath]);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className="min-h-screen">
      {contextHolder}
      {loading ? (
        <LoadingPage />
      ) : (
        <>
          <Sidebar collapsed={collapsed} />
          <Layout
            style={{
              marginLeft: collapsed ? 80 : 200,
              transition: "all 0.2s",
            }}
          >
            <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Content className="p-6 md:p-8">
              <div
                className="min-h-[280px] rounded-lg bg-white p-6 shadow-sm"
                style={{
                  background: colorBgContainer,
                }}
              >
                {children}
              </div>
            </Content>
            <Footer />
          </Layout>
        </>
      )}
    </Layout>
  );
}
