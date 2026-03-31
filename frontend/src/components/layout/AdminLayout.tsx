import type { CSSProperties } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";

const menus = [
  { label: "🏠 Trang chủ", path: "/" },
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Users", path: "/admin/users" },
  { label: "Leads", path: "/admin/leads" },
  { label: "Projects", path: "/admin/projects" },
  { label: "Properties", path: "/admin/properties" },
  { label: "Media", path: "/admin/media" },
  { label: "News", path: "/admin/news" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    window.location.replace("/login");
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>SGROUP CRM</div>

        <nav style={styles.nav}>
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin/dashboard"}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <div style={styles.topTitle}>CRM Dashboard</div>
            <div style={styles.topSub}>{user?.email || "No user"}</div>
          </div>

          <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
            Đăng xuất
          </button>
        </header>

        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    background: "#f3f4f6",
  },
  sidebar: {
    background: "#111827",
    color: "#fff",
    padding: 20,
  },
  brand: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 24,
  },
  nav: {
    display: "grid",
    gap: 8,
  },
  link: {
    color: "#d1d5db",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 600,
  },
  linkActive: {
    background: "#1f2937",
    color: "#fff",
  },
  main: {
    padding: 24,
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  topTitle: {
    fontSize: 24,
    fontWeight: 800,
  },
  topSub: {
    color: "#6b7280",
    marginTop: 4,
  },
  logoutBtn: {
    border: "none",
    background: "#111827",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  content: {},
};