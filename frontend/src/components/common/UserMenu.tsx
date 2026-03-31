import { useAuth } from "../../app/AuthContext";

function getRoleLabel(roles: string[]) {
  if (roles.includes("admin")) return "Admin";
  if (roles.includes("seller")) return "Seller";
  if (roles.includes("customer")) return "Customer";
  return "User";
}

export default function UserMenu() {
  const { user, roles, logout } = useAuth();

  function handleLogout() {
  logout();
  window.location.replace("/login");
}

  return (
    <div style={styles.wrap}>
      <div style={styles.info}>
        <div style={styles.name}>
          {user?.email || user?.phone || "Người dùng"}
        </div>
        <div style={styles.role}>{getRoleLabel(roles)}</div>
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
    fontSize: 12,
    color: "#6b7280",
  },
  logoutBtn: {
    height: 38,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    background: "#fff",
    color: "#111827",
    padding: "0 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
};