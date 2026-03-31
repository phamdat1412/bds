import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import UserMenu from "../common/UserMenu";

export default function PublicLayout() {
  const { isAuthenticated, roles } = useAuth();
  const location = useLocation();

  const dashboardLink = roles.includes("admin")
    ? "/admin/dashboard"
    : roles.includes("seller")
    ? "/seller/dashboard"
    : "/user";

  function isActive(path: string) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.leftGroup}>
            <Link to="/" style={styles.brand}>
              <div style={styles.brandMark}>S</div>
              <div style={styles.brandText}>SGROUP</div>
            </Link>
          </div>

          <nav style={styles.nav}>
            <Link
              to="/"
              style={{
                ...styles.link,
                ...(isActive("/") ? styles.linkActive : {}),
              }}
            >
              Trang chủ
            </Link>

            <Link
              to="/projects"
              style={{
                ...styles.link,
                ...(isActive("/projects") ? styles.linkActive : {}),
              }}
            >
              Dự án
            </Link>

            <Link
              to="/news"
              style={{
                ...styles.link,
                ...(isActive("/news") ? styles.linkActive : {}),
              }}
            >
              Tin tức & sự kiện
            </Link>

            {isAuthenticated ? (
              <Link to={dashboardLink} style={styles.link}>
                Quản lý thông tin
              </Link>
            ) : (
              <>
                <Link to="/login" style={styles.link}>
                  Đăng nhập
                </Link>
                <Link to="/register" style={styles.ctaLink}>
                  Đăng ký
                </Link>
              </>
            )}
          </nav>

          <div style={styles.rightGroup}>
            {isAuthenticated ? <UserMenu /> : null}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>SGROUP</div>
          <div style={styles.footerText}>
            Nền tảng tra cứu dự án, cập nhật tin tức và kết nối tư vấn bất động sản.
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f6f6",
    color: "#111111",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid #ececec",
  },

  headerInner: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "0 20px",
    minHeight: 84,
    display: "grid",
    gridTemplateColumns: "220px 1fr 220px",
    alignItems: "center",
    gap: 16,
  },

  leftGroup: {
    display: "flex",
    alignItems: "center",
  },

  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    color: "#111111",
  },

  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "linear-gradient(135deg, #cf2027 0%, #991b1b 100%)",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontSize: 18,
    boxShadow: "0 10px 24px rgba(185,28,28,0.18)",
  },

  brandText: {
    fontSize: 28,
    fontWeight: 800,
    color: "#cf2027",
    letterSpacing: 0.6,
  },

  nav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    flexWrap: "wrap",
  },

  link: {
    textDecoration: "none",
    color: "#2d2d2d",
    fontSize: 15,
    fontWeight: 600,
    padding: "10px 0",
  },

  linkActive: {
    color: "#cf2027",
  },

  ctaLink: {
    textDecoration: "none",
    color: "#ffffff",
    background: "#cf2027",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 10px 24px rgba(185,28,28,0.16)",
  },

  rightGroup: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  main: {
    minHeight: "calc(100vh - 84px - 90px)",
  },

  footer: {
    borderTop: "1px solid #ececec",
    background: "#ffffff",
  },

  footerInner: {
    maxWidth: 1320,
    margin: "0 auto",
    padding: "24px 20px 32px",
    display: "grid",
    gap: 8,
  },

  footerBrand: {
    fontSize: 22,
    fontWeight: 800,
    color: "#cf2027",
  },

  footerText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#666666",
  },
};