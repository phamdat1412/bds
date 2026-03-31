import type { CSSProperties } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";

const menus = [
  { label: "Dashboard", path: "/seller/dashboard" },
  { label: "Leads", path: "/seller/leads" },
  { label: "Projects", path: "/seller/projects" },
  { label: "Properties", path: "/seller/properties" },
];

export default function SellerLayout() {
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    window.location.replace("/login");
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>SGROUP SELLER</div>

        <nav style={styles.nav}>
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/seller/dashboard"}
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
            <div style={styles.topTitle}>Seller Portal</div>
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
    background: "#0f172a",
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
    background: "#1e293b",
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
    background: "#0f172a",
    color: "#fff",
    borderRadius: 12,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  content: {},
};