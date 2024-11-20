import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { zhCN } from "date-fns/locale";
import router from "next/router";

export async function fetchWrapper(url: string, options: RequestInit = {}) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for authentication
      ...options,
    });
    if (!response.ok) {
      const error = await response.json();
      //access token not found, using refresh token to refetch token
      if (response.status === 401 && url !== "/auth/refresh-from-redis") {
        await fetchWrapper("/auth/refresh-from-redis", {
          method: "POST",
        });
      } else if (error.code === -2) {
        router.push("/login");
        throw new Error("请重新登录");
      } else if (error.code === -1) {
        throw new Error(error?.message?.message);
      } else {
        throw new Error("Something went wrong");
      }
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

export function formatRelativeDate(from: Date) {
  const currentDate = new Date();
  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(from, { addSuffix: true, locale: zhCN });
  } else {
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM d", { locale: zhCN });
    } else {
      return formatDate(from, "MMM d, yyyy", { locale: zhCN });
    }
  }
}
