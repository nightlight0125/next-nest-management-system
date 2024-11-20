import React from "react";
import { Layout } from "antd";
const { Footer } = Layout;

export default function Page() {
  return (
    <Footer className="text-center text-gray-500 bg-transparent">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-sm">
          © {new Date().getFullYear()} 管理系统. All rights reserved.
        </div>
        <div className="text-xs mt-1 text-gray-400">
          Powered by Next.js & Ant Design
        </div>
      </div>
    </Footer>
  );
}
