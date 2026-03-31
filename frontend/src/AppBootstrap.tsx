import { useEffect } from "react";
import { useAuthStore } from "./features/auth/auth.store";

export default function AppBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    if (!accessToken) return;

    fetchMe().catch(() => {
      // auth.store đã tự clear nếu token lỗi
    });
  }, [accessToken, fetchMe]);

  return null;
}