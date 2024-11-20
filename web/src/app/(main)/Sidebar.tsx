import Link from "next/link";
import { Layout } from "antd";
const { Sider } = Layout;
import Menu from "./Menu";

export default function Page({ collapsed }: { collapsed: boolean }) {
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme="light"
      style={{
        boxShadow: "1px 0 8px rgba(0, 0, 0, 0.08)",
        zIndex: 20,
        overflow: "auto",
        position: "fixed",
        width: collapsed ? 80 : 200,
        transition: "all 0.2s",
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: "#fff",
      }}
    >
      <div className="h-16 flex items-center justify-center border-b">
        <div
          className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all ${collapsed ? "scale-0" : "scale-100"}`}
        >
          <Link href="/">管理系统</Link>
        </div>
      </div>
      <Menu />
    </Sider>
  );
}
