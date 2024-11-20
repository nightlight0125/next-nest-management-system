"use client";

import { useRouter } from "next/navigation";
import { fetchWrapper } from "@/lib/utils";
import { useState } from "react";
import { useEffect } from "react";
import LoadingPage from "@/components/LoadingPage";
import { Layout as AntLayout } from "antd";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // check if the cookie contains access_token
  useEffect(() => {
    const checkCookie = async () => {
      try {
        await fetchWrapper("/auth/check-cookie");
        router.push("/");
      } catch {
        setLoading(false);
      }
    };

    checkCookie();
  }, [router]);
  return (
    <AntLayout className="min-h-screen">
      {loading ? <LoadingPage /> : children}
    </AntLayout>
  );
}
