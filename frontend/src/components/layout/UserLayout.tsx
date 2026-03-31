import { Link, Outlet } from "react-router-dom";
import UserMenu from "../common/UserMenu";

export default function UserLayout() {
  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>Customer</div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>
            Trang chủ
          </Link>
          <Link to="/user" style={styles.link}>
            Tổng quan
          </Link>
          <Link to="/user/profile" style={styles.link}>
            Hồ sơ
          </Link>
          <Link to="/user/bookmarks" style={styles.link}>
            Dự án quan tâm
          </Link>
        </nav>
      </aside>

      <div style={styles.contentWrap}>
        <header style={styles.header}>
          <UserMenu />
        </header>

        <main style={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    background: "#f8fafc",
  },
  sidebar: {
    padding: 24,
    background: "#111827",
    color: "#fff",
  },
  logo: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 24,
  },
  nav: {
    display: "grid",
    gap: 12,
  },
  link: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontWeight: 600,
  },
  contentWrap: {
    display: "grid",
    gridTemplateRows: "72px 1fr",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 24px",
  },
  main: {
    padding: 24,
  },
};