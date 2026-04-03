// path: frontend/src/components/layout/PublicLayout.tsx
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import UserMenu from "../common/UserMenu";
import { useCart } from "../../features/cart/cart.store";

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const { items } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [globalKeyword, setGlobalKeyword] = useState("");

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalKeyword.trim()) {
      navigate(`/projects?keyword=${encodeURIComponent(globalKeyword.trim())}`);
      setGlobalKeyword(""); 
    }
  };

  function isActive(path: string) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          {/* 1. Logo */}
          <div style={styles.leftGroup}>
            <Link to="/" style={styles.brand}>
              <div style={styles.brandMark}>S</div>
              <div style={styles.brandText}>SGROUP</div>
            </Link>
          </div>

          {/* 2. Thanh tìm kiếm toàn cục */}
          <form onSubmit={handleGlobalSearch} style={styles.searchBar}>
            <input
              placeholder="Tìm dự án, khu vực..."
              value={globalKeyword}
              onChange={(e) => setGlobalKeyword(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>🔍</button>
          </form>

          {/* 3. Menu điều hướng chính */}
          <nav style={styles.nav}>
            {/* <Link to="/" style={{ ...styles.link, ...(isActive("/") ? styles.linkActive : {}) }}>
              Trang chủ
            </Link> */}
            <Link to="/projects" style={{ ...styles.link, ...(isActive("/projects") ? styles.linkActive : {}) }}>
              Dự án
            </Link>
            {/* Đã khôi phục lại Tin tức & Sự kiện */}
            <Link to="/news" style={{ ...styles.link, ...(isActive("/news") ? styles.linkActive : {}) }}>
              Tin tức & sự kiện
            </Link>
            
            {/* Biểu tượng Giỏ hàng */}
            <Link to="/cart" style={styles.cartLink}>
              <span style={{fontSize: 22}}>🛒</span>
              {items.length > 0 && <span style={styles.badge}>{items.length}</span>}
            </Link>

            {/* Cụm User/Auth */}
            {isAuthenticated ? (
              <UserMenu /> 
            ) : (
              <div style={styles.authGroup}>
                <Link to="/login" style={styles.link}>Đăng nhập</Link>
                <Link to="/register" style={styles.ctaLink}>Đăng ký</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>SGROUP</div>
          <div style={styles.footerText}>
            Nền tảng tra cứu dự án, cập nhật tin tức và kết nối tư vấn bất động sản chuyên nghiệp.
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f6f6", color: "#111111" },
  header: { 
    position: "sticky", 
    top: 0, 
    zIndex: 50, 
    background: "rgba(255,255,255,0.95)", 
    backdropFilter: "blur(10px)", 
    borderBottom: "1px solid #ececec" 
  },
  headerInner: { 
    maxWidth: 1320, 
    margin: "0 auto", 
    padding: "0 20px", 
    minHeight: 84, 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: 20 
  },
  leftGroup: { display: "flex", alignItems: "center" },
  brand: { display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" },
  brandMark: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    background: "#cf2027", 
    color: "#fff", 
    display: "grid", 
    placeItems: "center", 
    fontWeight: 800, 
    fontSize: 18 
  },
  brandText: { fontSize: 24, fontWeight: 800, color: "#cf2027", letterSpacing: 0.5 },
  searchBar: { 
    flex: 1, 
    maxWidth: 320, 
    display: "flex", 
    background: "#f1f1f1", 
    borderRadius: 99, 
    padding: "4px 16px", 
    border: "1px solid #eee" 
  },
  searchInput: { 
    flex: 1, 
    border: "none", 
    background: "transparent", 
    padding: "8px", 
    outline: "none", 
    fontSize: 14 
  },
  searchButton: { border: "none", background: "transparent", cursor: "pointer", fontSize: 16 },
  nav: { display: "flex", alignItems: "center", gap: 24 },
  link: { textDecoration: "none", color: "#2d2d2d", fontSize: 15, fontWeight: 600 },
  linkActive: { color: "#cf2027" },
  cartLink: { position: "relative", textDecoration: "none" },
  badge: { 
    position: "absolute", 
    top: -8, 
    right: -10, 
    background: "#cf2027", 
    color: "#fff", 
    fontSize: 10, 
    padding: "2px 6px", 
    borderRadius: 10, 
    fontWeight: "bold" 
  },
  authGroup: { display: "flex", alignItems: "center", gap: 16 },
  ctaLink: { 
    textDecoration: "none", 
    color: "#fff", 
    background: "#cf2027", 
    padding: "10px 20px", 
    borderRadius: 99, 
    fontWeight: 700, 
    fontSize: 14 
  },
  main: { minHeight: "calc(100vh - 84px - 140px)" },
  footer: { borderTop: "1px solid #ececec", background: "#fff", padding: "32px 0" },
  footerInner: { maxWidth: 1320, margin: "0 auto", padding: "0 20px", display: "grid", gap: 8 },
  footerBrand: { fontSize: 20, fontWeight: 800, color: "#cf2027" },
  footerText: { fontSize: 14, color: "#666", lineHeight: 1.6 },
};