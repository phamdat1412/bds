// path: frontend/src/components/common/UserMenu.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";

function getRoleLabel(roles: string[]) {
  if (roles.includes("admin")) return "Admin";
  if (roles.includes("seller")) return "Seller";
  if (roles.includes("customer")) return "Customer";
  return "User";
}

export default function UserMenu() {
  const { user, roles, logout } = useAuth();

  const dashboardLink = roles.includes("admin")
    ? "/admin/dashboard"
    : roles.includes("seller")
    ? "/seller/dashboard"
    : "/user";

  function handleLogout() {
    logout();
    window.location.replace("/login");
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.userCluster}>
        <div style={styles.info}>
          <div style={styles.name}>
            {user?.email || user?.phone || "Người dùng"}
          </div>
          <div style={styles.role}>{getRoleLabel(roles)}</div>
        </div>

        <Link to={dashboardLink} style={styles.mgmtBtn}>
          Quản lý
        </Link>
      </div>

      <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "#fff",
    padding: "4px 4px 4px 12px",
    borderRadius: 12,
    border: "1px solid #ececec",
  },
  userCluster: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  info: {
    display: "grid",
    gap: 2,
    textAlign: "right",
  },
  name: {
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
  },
  role: {
    fontSize: 11,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  mgmtBtn: {
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    background: "#cf2027",
    padding: "6px 12px",
    borderRadius: 8,
  },
  logoutBtn: {
    height: 34,
    border: "none",
    background: "transparent",
    color: "#6b7280",
    padding: "0 8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
};