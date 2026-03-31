import { Navigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div style={styles.loading}>Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    fontSize: 16,
    color: "#6b7280",
    background: "#f8fafc",
  },
};