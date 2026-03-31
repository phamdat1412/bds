import { Link } from "react-router-dom";
import type { CSSProperties } from "react";

export default function HomePage() {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />

        <div style={styles.heroContent}>
          <div style={styles.kicker}>SGROUP REAL ESTATE</div>

          <h1 style={styles.title}>
            Nền tảng tra cứu dự án và cập nhật thị trường bất động sản
          </h1>

          <p style={styles.sub}>
            Khám phá hệ thống dự án, thông tin quy hoạch, tin tức thị trường và
            cơ hội đầu tư được cập nhật liên tục từ SGROUP.
          </p>

          <div style={styles.actions}>
            <Link to="/projects" style={styles.primaryBtn}>
              Khám phá dự án
            </Link>
            <Link to="/news" style={styles.secondaryBtn}>
              Xem tin tức
            </Link>
          </div>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>DỰ ÁN</div>
            <div style={styles.statLabel}>Danh mục dự án đang cập nhật liên tục</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>TIN TỨC</div>
            <div style={styles.statLabel}>Thông tin thị trường và hoạt động nổi bật</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>TƯ VẤN</div>
            <div style={styles.statLabel}>Kết nối nhanh với đội ngũ SGROUP</div>
          </div>
        </div>
      </section>

      <section style={styles.introSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionKicker}>GIỚI THIỆU</div>
          <h2 style={styles.sectionTitle}>
            Một điểm chạm gọn hơn cho hành trình tìm hiểu bất động sản
          </h2>
        </div>

        <div style={styles.introGrid}>
          <div style={styles.introCardLarge}>
            <div style={styles.cardTag}>VỀ SGROUP</div>
            <h3 style={styles.cardTitle}>
              Hệ thống thông tin giúp khách hàng tiếp cận dự án rõ ràng và trực quan hơn
            </h3>
            <p style={styles.cardDesc}>
              Khu public được xây dựng để người dùng có thể xem dự án, theo dõi
              tin tức, tìm hiểu thị trường và kết nối tư vấn trong một trải nghiệm
              thống nhất, hiện đại và dễ sử dụng.
            </p>
          </div>

          <div style={styles.introCard}>
            <div style={styles.cardTag}>DỰ ÁN</div>
            <p style={styles.smallCardText}>
              Tổng hợp dự án nổi bật, vị trí, mô tả ngắn và lộ trình xem chi tiết.
            </p>
          </div>

          <div style={styles.introCard}>
            <div style={styles.cardTag}>TIN TỨC</div>
            <p style={styles.smallCardText}>
              Cập nhật chuyển động thị trường, hoạt động truyền thông và thông tin mới.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.navigationSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionKicker}>KHÁM PHÁ</div>
          <h2 style={styles.sectionTitle}>Đi nhanh vào nhóm nội dung bạn cần</h2>
        </div>

        <div style={styles.navigationGrid}>
          <Link to="/projects" style={styles.navCard}>
            <div style={styles.navCardTag}>01</div>
            <h3 style={styles.navCardTitle}>Danh sách dự án</h3>
            <p style={styles.navCardDesc}>
              Xem các dự án đang mở bán, sẵn sàng bàn giao hoặc đang được quan tâm.
            </p>
            <div style={styles.navCardLink}>Truy cập trang dự án →</div>
          </Link>

          <Link to="/news" style={styles.navCard}>
            <div style={styles.navCardTag}>02</div>
            <h3 style={styles.navCardTitle}>Tin tức & sự kiện</h3>
            <p style={styles.navCardDesc}>
              Theo dõi thông tin thị trường, dự án và các hoạt động nổi bật của SGROUP.
            </p>
            <div style={styles.navCardLink}>Truy cập trang tin tức →</div>
          </Link>
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <div style={styles.sectionKicker}>KẾT NỐI</div>
          <h2 style={styles.ctaTitle}>
            Bắt đầu từ một dự án phù hợp, hoặc một thông tin đủ đúng thời điểm
          </h2>
          <p style={styles.ctaDesc}>
            SGROUP xây dựng khu vực public này để hành trình tìm hiểu bất động sản
            của khách hàng trở nên trực quan, rõ ràng và hiệu quả hơn.
          </p>

          <div style={styles.actions}>
            <Link to="/projects" style={styles.primaryBtn}>
              Xem dự án ngay
            </Link>
            <Link to="/news" style={styles.secondaryBtn}>
              Đọc tin mới
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    maxWidth: 1320,
    margin: "0 auto",
    padding: "32px 20px 72px",
    display: "grid",
    gap: 40,
    background: "#ffffff",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 32,
    border: "1px solid #ececec",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,248,248,0.94) 50%, rgba(127,29,29,0.10) 100%)",
    padding: "48px 40px 36px",
    display: "grid",
    gap: 32,
    minHeight: 560,
    alignContent: "space-between",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top right, rgba(185,28,28,0.10), transparent 32%)",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 780,
    display: "grid",
    gap: 18,
  },
  kicker: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.8,
    color: "#b91c1c",
  },
  title: {
    margin: 0,
    fontSize: "clamp(36px, 6vw, 62px)",
    lineHeight: 1.05,
    fontWeight: 700,
    color: "#111111",
    maxWidth: 860,
  },
  sub: {
    margin: 0,
    color: "#555555",
    fontSize: 16,
    maxWidth: 680,
    lineHeight: 1.8,
  },
  actions: {
    marginTop: 4,
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
  },
  primaryBtn: {
    background: "#b91c1c",
    color: "#ffffff",
    textDecoration: "none",
    padding: "14px 22px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 12px 30px rgba(185, 28, 28, 0.18)",
  },
  secondaryBtn: {
    background: "#ffffff",
    color: "#111111",
    textDecoration: "none",
    padding: "14px 22px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 15,
    border: "1px solid #d9d9d9",
  },

  heroStats: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "rgba(255,255,255,0.78)",
    border: "1px solid #ececec",
    borderRadius: 24,
    padding: "20px 18px",
    backdropFilter: "blur(8px)",
    display: "grid",
    gap: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111111",
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#666666",
  },

  introSection: {
    display: "grid",
    gap: 22,
  },
  sectionHeader: {
    display: "grid",
    gap: 8,
  },
  sectionKicker: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.4,
    color: "#b91c1c",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.2,
    fontWeight: 700,
    color: "#111111",
    maxWidth: 760,
  },

  introGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) repeat(2, minmax(0, 0.8fr))",
    gap: 20,
  },
  introCardLarge: {
    background: "#ffffff",
    border: "1px solid #ececec",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 16px 40px rgba(0,0,0,0.04)",
    display: "grid",
    gap: 14,
  },
  introCard: {
    background: "#ffffff",
    border: "1px solid #ececec",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 16px 40px rgba(0,0,0,0.04)",
    display: "grid",
    alignContent: "start",
    gap: 12,
  },
  cardTag: {
    fontSize: 12,
    fontWeight: 700,
    color: "#b91c1c",
    letterSpacing: 0.8,
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.25,
    fontWeight: 700,
    color: "#111111",
  },
  cardDesc: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: "#666666",
  },
  smallCardText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: "#666666",
  },

  navigationSection: {
    display: "grid",
    gap: 22,
  },
  navigationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 20,
  },
  navCard: {
    textDecoration: "none",
    color: "inherit",
    background: "#ffffff",
    border: "1px solid #ececec",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 16px 40px rgba(0,0,0,0.04)",
    display: "grid",
    gap: 12,
  },
  navCardTag: {
    width: 42,
    height: 42,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: 700,
    fontSize: 14,
  },
  navCardTitle: {
    margin: 0,
    fontSize: 26,
    lineHeight: 1.25,
    fontWeight: 700,
    color: "#111111",
  },
  navCardDesc: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: "#666666",
  },
  navCardLink: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: 700,
    color: "#b91c1c",
  },

  ctaSection: {
    display: "grid",
  },
  ctaBox: {
    background:
      "linear-gradient(135deg, #111111 0%, #1f1f1f 55%, #7f1d1d 100%)",
    borderRadius: 32,
    padding: "42px 36px",
    display: "grid",
    gap: 14,
  },
  ctaTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.18,
    fontWeight: 700,
    color: "#ffffff",
    maxWidth: 760,
  },
  ctaDesc: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.78)",
    maxWidth: 720,
  },
};