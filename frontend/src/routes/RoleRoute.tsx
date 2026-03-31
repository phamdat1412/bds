import { Navigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

function getDefaultRedirect(roles: string[]) {
  if (roles.includes("admin")) return "/admin/dashboard";
  if (roles.includes("seller")) return "/seller/dashboard";
  return "/user";
}

export default function RoleRoute({
  allowRoles,
  children,
}: {
  allowRoles: string[];
  children: React.ReactNode;
}) {
  const { roles, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div style={styles.loading}>Đang tải quyền truy cập...</div>;
  }

  const allowed = roles.some((role) => allowRoles.includes(role));

  if (!allowed) {
    return <Navigate to={getDefaultRedirect(roles)} replace />;
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