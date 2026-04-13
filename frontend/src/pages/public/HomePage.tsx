import { Link } from "react-router-dom";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import PublicSearchBox from "../../features/public/components/PublicSearchBox";

type PublicProjectItem = {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  district?: string | null;
  locationText?: string | null;
  shortDescription?: string | null;
  projectType?: string | null;
  thumbnailMedia?: {
    url: string;
  } | null;
};

type PublicNewsItem = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  publishedAt?: string | null;
  thumbnailMedia?: {
    url: string;
  } | null;
};

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";
}

function normalizeProjectItems(payload: any): PublicProjectItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function normalizeNewsItems(payload: any): PublicNewsItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function formatDate(value?: string | null) {
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleDateString("vi-VN");
}

function getProjectLocation(project: PublicProjectItem) {
  return project.locationText || project.district || project.city || "Vị trí đang cập nhật";
}

export default function HomePage() {
  const [projects, setProjects] = useState<PublicProjectItem[]>([]);
  const [newsItems, setNewsItems] = useState<PublicNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        setLoading(true);

        const apiBaseUrl = getApiBaseUrl();

        const [projectsRes, newsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/public/projects?page=1&pageSize=12`),
          fetch(`${apiBaseUrl}/public/news?page=1&pageSize=4`),
        ]);

        const [projectsJson, newsJson] = await Promise.all([
          projectsRes.json(),
          newsRes.json(),
        ]);

        if (!isMounted) return;

        setProjects(normalizeProjectItems(projectsJson));
        setNewsItems(normalizeNewsItems(newsJson));
      } catch (error) {
        console.error("Load homepage data failed", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroImages = useMemo(() => {
    const images = projects
      .map((item) => item.thumbnailMedia?.url)
      .filter((url): url is string => !!url)
      .slice(0, 4);

    if (images.length > 0) return images;

    return [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80",
    ];
  }, [projects]);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [heroImages]);

  const featuredAreas = useMemo(() => {
    const areaMap = new Map<string, { name: string; count: number }>();

    projects.forEach((project) => {
      const rawArea = project.district || project.city || project.locationText || "";
      const area = rawArea.trim();

      if (!area) return;

      const current = areaMap.get(area);
      if (current) {
        current.count += 1;
      } else {
        areaMap.set(area, { name: area, count: 1 });
      }
    });

    return Array.from(areaMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [projects]);

  const featuredProjects = useMemo(() => projects.slice(0, 6), [projects]);
  const featuredNews = useMemo(() => newsItems.slice(0, 4), [newsItems]);

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        {heroImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            style={{
              ...styles.heroBg,
              backgroundImage: `url("${image}")`,
              opacity: index === heroIndex ? 1 : 0,
            }}
          />
        ))}

        <div style={styles.heroBackdrop} />
        <div style={styles.heroShade} />

        <div style={styles.heroInner}>
          <div style={styles.heroTopLine}>SGROUP REAL ESTATE PLATFORM</div>

          <h1 style={styles.heroTitle}>
            Kênh tra cứu dự án, tin thị trường và kết nối tư vấn bất động sản
          </h1>

          <p style={styles.heroDesc}>
            Tìm dự án phù hợp, cập nhật thị trường nhanh và gửi yêu cầu tư vấn
            trong một trải nghiệm gọn, rõ và dễ dùng.
          </p>

          <div style={styles.searchPanel}>
            <div style={styles.searchTabs}>
              <button type="button" style={{ ...styles.searchTab, ...styles.searchTabActive }}>
                Nhà đất bán
              </button>
              <button type="button" style={styles.searchTab}>
                Dự án
              </button>
              <button type="button" style={styles.searchTab}>
                Tin tức
              </button>
            </div>

            <div style={styles.searchBoxWrap}>
              <PublicSearchBox placeholder="Tìm theo tên dự án, khu vực, loại hình..." />
            </div>
          </div>

          <div style={styles.heroActions}>
            <Link to="/projects" style={styles.primaryBtn}>
              Xem danh sách dự án
            </Link>
            <Link to="/news" style={styles.secondaryBtn}>
              Cập nhật tin thị trường
            </Link>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionKicker}>KHU VỰC NỔI BẬT</div>
          <h2 style={styles.sectionTitle}>Bất động sản theo khu vực nổi bật</h2>
        </div>

        <div style={styles.areaGrid}>
          {featuredAreas.length === 0 ? (
            <div style={styles.emptyCard}>
              {loading ? "Đang tải khu vực..." : "Chưa có dữ liệu khu vực"}
            </div>
          ) : (
            featuredAreas.map((area) => (
              <Link
                key={area.name}
                to={`/projects?keyword=${encodeURIComponent(area.name)}`}
                style={styles.areaCard}
              >
                <div style={styles.areaName}>{area.name}</div>
                <div style={styles.areaMeta}>{area.count} dự án</div>
                <div style={styles.areaLink}>Xem khu vực →</div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeaderRow}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>DỰ ÁN NỔI BẬT</div>
            <h2 style={styles.sectionTitle}>Danh sách dự án đang được quan tâm</h2>
          </div>

          <Link to="/projects" style={styles.viewAllLink}>
            Xem tất cả →
          </Link>
        </div>

        <div style={styles.projectGrid}>
          {featuredProjects.length === 0 ? (
            <div style={styles.emptyCard}>
              {loading ? "Đang tải dự án..." : "Chưa có dự án nổi bật"}
            </div>
          ) : (
            featuredProjects.map((project) => (
              <Link key={project.id} to={`/projects/${project.slug}`} style={styles.projectCard}>
                <div
                  style={{
                    ...styles.projectThumb,
                    backgroundImage: project.thumbnailMedia?.url
                      ? `url("${project.thumbnailMedia.url}")`
                      : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  }}
                />
                <div style={styles.projectBody}>
                  <div style={styles.projectType}>
                    {project.projectType || "Dự án bất động sản"}
                  </div>
                  <h3 style={styles.projectTitle}>{project.name}</h3>
                  <div style={styles.projectLocation}>{getProjectLocation(project)}</div>
                  <p style={styles.projectDesc}>
                    {project.shortDescription || "Thông tin dự án đang được cập nhật chi tiết trên hệ thống."}
                  </p>
                  <div style={styles.projectLink}>Xem chi tiết →</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeaderRow}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionKicker}>TIN MỚI</div>
            <h2 style={styles.sectionTitle}>Tin tức nổi bật</h2>
          </div>

          <Link to="/news" style={styles.viewAllLink}>
            Xem tất cả →
          </Link>
        </div>

        <div style={styles.newsGrid}>
          {featuredNews.length === 0 ? (
            <div style={styles.emptyCard}>
              {loading ? "Đang tải tin tức..." : "Chưa có tin tức nổi bật"}
            </div>
          ) : (
            featuredNews.map((item) => (
              <Link key={item.id} to={`/news/${item.slug}`} style={styles.newsCard}>
                <div
                  style={{
                    ...styles.newsThumb,
                    backgroundImage: item.thumbnailMedia?.url
                      ? `url("${item.thumbnailMedia.url}")`
                      : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  }}
                />
                <div style={styles.newsBody}>
                  <div style={styles.newsDate}>{formatDate(item.publishedAt)}</div>
                  <h3 style={styles.newsTitle}>{item.title}</h3>
                  <p style={styles.newsSummary}>
                    {item.summary || "Cập nhật nội dung mới từ thị trường và hệ thống dự án."}
                  </p>
                  <div style={styles.newsLink}>Đọc tiếp →</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <div style={styles.sectionKickerLight}>BẮT ĐẦU NGAY</div>
          <h2 style={styles.ctaTitle}>
            Từ một dự án phù hợp đến một quyết định đúng thời điểm
          </h2>
          <p style={styles.ctaDesc}>
            Tìm dự án, đọc tin thị trường hoặc gửi yêu cầu tư vấn để đội ngũ
            SGROUP đồng hành cùng khách hàng trong hành trình an cư và đầu tư.
          </p>

          <div style={styles.ctaActions}>
            <Link to="/projects" style={styles.ctaPrimaryBtn}>
              Tìm dự án ngay
            </Link>
            <Link to="/cart" style={styles.ctaSecondaryBtn}>
              Gửi yêu cầu tư vấn
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
    background: "#f6f7f9",
    paddingBottom: 56,
  },

  hero: {
    position: "relative",
    minHeight: 640,
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 0.9s ease",
  },
  heroBackdrop: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.48) 100%)",
  },
  heroShade: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at top left, rgba(185,28,28,0.18), transparent 32%)",
  },
  heroInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1240,
    margin: "0 auto",
    padding: "72px 20px 88px",
    display: "grid",
    gap: 18,
  },
  heroTopLine: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.4,
  },
  heroTitle: {
    margin: 0,
    maxWidth: 860,
    color: "#ffffff",
    fontSize: "clamp(34px, 6vw, 58px)",
    lineHeight: 1.08,
    fontWeight: 800,
  },
  heroDesc: {
    margin: 0,
    maxWidth: 760,
    color: "rgba(255,255,255,0.9)",
    fontSize: 17,
    lineHeight: 1.7,
  },
  searchPanel: {
    marginTop: 8,
    maxWidth: 980,
    background: "#ffffff",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
    display: "grid",
    gap: 16,
  },
  searchTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  searchTab: {
    border: "none",
    background: "#f1f3f5",
    color: "#333333",
    padding: "10px 16px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  searchTabActive: {
    background: "#b91c1c",
    color: "#ffffff",
  },
  searchBoxWrap: {
    width: "100%",
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 10,
  },
  primaryBtn: {
    textDecoration: "none",
    background: "#b91c1c",
    color: "#ffffff",
    padding: "14px 22px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 12px 28px rgba(185,28,28,0.25)",
  },
  secondaryBtn: {
    textDecoration: "none",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    padding: "14px 22px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    border: "1px solid rgba(255,255,255,0.25)",
    backdropFilter: "blur(4px)",
  },

  section: {
    maxWidth: 1240,
    margin: "48px auto 0",
    padding: "0 20px",
    display: "grid",
    gap: 18,
  },
  sectionHeader: {
    display: "grid",
    gap: 8,
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: 16,
    flexWrap: "wrap",
  },
  sectionKicker: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 1.2,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#111827",
  },
  viewAllLink: {
    textDecoration: "none",
    color: "#b91c1c",
    fontSize: 15,
    fontWeight: 700,
  },

  areaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  areaCard: {
    textDecoration: "none",
    color: "inherit",
    background: "#ffffff",
    border: "1px solid #edf0f3",
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 14px 36px rgba(15,23,42,0.05)",
    display: "grid",
    gap: 10,
  },
  areaName: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  areaMeta: {
    fontSize: 14,
    color: "#5b6472",
  },
  areaLink: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 700,
    color: "#b91c1c",
  },

  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  projectCard: {
    textDecoration: "none",
    color: "inherit",
    background: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #edf0f3",
    boxShadow: "0 14px 36px rgba(15,23,42,0.05)",
    display: "grid",
  },
  projectThumb: {
    height: 220,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  projectBody: {
    padding: 18,
    display: "grid",
    gap: 10,
  },
  projectType: {
    fontSize: 12,
    fontWeight: 800,
    color: "#b91c1c",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  projectTitle: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.3,
    fontWeight: 800,
    color: "#111827",
  },
  projectLocation: {
    fontSize: 14,
    color: "#6b7280",
  },
  projectDesc: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#5b6472",
  },
  projectLink: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 700,
    color: "#b91c1c",
  },

  newsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 20,
  },
  newsCard: {
    textDecoration: "none",
    color: "inherit",
    background: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #edf0f3",
    boxShadow: "0 14px 36px rgba(15,23,42,0.05)",
    display: "grid",
  },
  newsThumb: {
    height: 190,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  newsBody: {
    padding: 18,
    display: "grid",
    gap: 10,
  },
  newsDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  newsTitle: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.35,
    fontWeight: 800,
    color: "#111827",
  },
  newsSummary: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#5b6472",
  },
  newsLink: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 700,
    color: "#b91c1c",
  },

  emptyCard: {
    background: "#ffffff",
    borderRadius: 20,
    padding: 22,
    border: "1px solid #edf0f3",
    color: "#5b6472",
  },

  ctaSection: {
    maxWidth: 1240,
    margin: "48px auto 0",
    padding: "0 20px",
  },
  ctaBox: {
    borderRadius: 28,
    padding: "40px 32px",
    background: "linear-gradient(135deg, #111827 0%, #1f2937 60%, #7f1d1d 100%)",
    display: "grid",
    gap: 14,
  },
  sectionKickerLight: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 1.2,
  },
  ctaTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.18,
    fontWeight: 800,
    color: "#ffffff",
    maxWidth: 760,
  },
  ctaDesc: {
    margin: 0,
    color: "rgba(255,255,255,0.82)",
    fontSize: 15,
    lineHeight: 1.75,
    maxWidth: 760,
  },
  ctaActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
  },
  ctaPrimaryBtn: {
    textDecoration: "none",
    background: "#ffffff",
    color: "#111827",
    padding: "14px 22px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 15,
  },
  ctaSecondaryBtn: {
    textDecoration: "none",
    background: "transparent",
    color: "#ffffff",
    padding: "14px 22px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 15,
    border: "1px solid rgba(255,255,255,0.24)",
  },
};