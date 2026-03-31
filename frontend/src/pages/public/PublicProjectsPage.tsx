import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  getPublicProjectsApi,
  type PublicProjectItem,
} from "../../features/public/publicProjects.api";

export default function PublicProjectsPage() {
  const [items, setItems] = useState<PublicProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProjects() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getPublicProjectsApi();
      setItems(result.data || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được danh sách dự án"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const featured = items[0];
  const projectList = items.slice(1);

  return (
    <div style={styles.page}>
      <section style={styles.wrapper}>
        <div style={styles.bgLayer} />

        <div style={styles.inner}>
          <div style={styles.headingWrap}>
            <h1 style={styles.heading}>DỰ ÁN NỔI BẬT</h1>
          </div>

          {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

          {isLoading ? (
            <div style={styles.loading}>Đang tải dữ liệu...</div>
          ) : items.length === 0 ? (
            <div style={styles.empty}>Chưa có dự án public</div>
          ) : (
            <>
              {featured ? (
                <Link to={`/projects/${featured.slug}`} style={styles.featuredCard}>
                  <div style={styles.featuredImageWrap}>
                    {featured.thumbnailMedia?.url ? (
                      <img
                        src={featured.thumbnailMedia.url}
                        alt={featured.name}
                        style={styles.featuredImage}
                        loading="lazy"
                      />
                    ) : (
                      <div style={styles.noImageLarge}>NO IMAGE</div>
                    )}
                  </div>

                  <div style={styles.featuredContent}>
                    <div style={styles.typeText}>
                      {featured.projectType || "Dự án"}
                    </div>
                    <div style={styles.featuredTitle}>{featured.name}</div>
                    <div style={styles.locationText}>
                      {[featured.district, featured.city].filter(Boolean).join(", ") || "-"}
                    </div>
                    <div style={styles.featuredDesc}>
                      {featured.shortDescription || "Đang cập nhật mô tả dự án"}
                    </div>

                    <div style={styles.featureStats}>
                      <span>{featured.propertyCount ?? 0} sản phẩm</span>
                      <span>Xem chi tiết →</span>
                    </div>
                  </div>
                </Link>
              ) : null}

              {projectList.length > 0 ? (
                <div style={styles.grid}>
                  {projectList.map((item) => (
                    <Link
                      key={item.id}
                      to={`/projects/${item.slug}`}
                      style={styles.card}
                    >
                      <div style={styles.cardImageWrap}>
                        {item.thumbnailMedia?.url ? (
                          <img
                            src={item.thumbnailMedia.url}
                            alt={item.name}
                            style={styles.cardImage}
                            loading="lazy"
                          />
                        ) : (
                          <div style={styles.noImageCard}>NO IMAGE</div>
                        )}
                      </div>

                      <div style={styles.cardContent}>
                        <div style={styles.typeText}>
                          {item.projectType || "Dự án"}
                        </div>
                        <div style={styles.cardTitle}>{item.name}</div>
                        <div style={styles.locationText}>
                          {[item.district, item.city].filter(Boolean).join(", ") || "-"}
                        </div>
                        <div style={styles.cardDesc}>
                          {item.shortDescription || "Đang cập nhật mô tả dự án"}
                        </div>
                        <div style={styles.cardFooter}>
                          <span>{item.propertyCount ?? 0} sản phẩm</span>
                          <span style={styles.cardLink}>Xem thêm</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    width: "100%",
    background: "#f7f7f7",
  },

  wrapper: {
    position: "relative",
    overflow: "hidden",
    minHeight: "100%",
    padding: "42px 0 70px",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(250,250,250,0.90) 50%, rgba(127,29,29,0.08) 100%)",
  },

  bgLayer: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at right center, rgba(185,28,28,0.08), transparent 30%)",
    pointerEvents: "none",
  },

  inner: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 20px",
    display: "grid",
    gap: 28,
  },

  headingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heading: {
    margin: 0,
    fontSize: 54,
    fontWeight: 600,
    letterSpacing: -1,
    color: "#161616",
    lineHeight: 1.05,
  },

  featuredCard: {
    textDecoration: "none",
    color: "inherit",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    background: "transparent",
    gap: 0,
  },

  featuredImageWrap: {
    minHeight: 420,
    overflow: "hidden",
    background: "#ececec",
  },

  featuredImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  featuredContent: {
    background: "rgba(255,255,255,0.95)",
    padding: "28px 26px",
    display: "grid",
    alignContent: "center",
    gap: 10,
  },

  typeText: {
    fontSize: 13,
    color: "#8d8d8d",
    fontWeight: 600,
  },

  featuredTitle: {
    fontSize: 30,
    fontWeight: 500,
    color: "#222",
    lineHeight: 1.35,
  },

  locationText: {
    fontSize: 15,
    color: "#666",
    fontWeight: 500,
  },

  featuredDesc: {
    fontSize: 15,
    lineHeight: 1.75,
    color: "#666",
  },

  featureStats: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#c53b3b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },

  card: {
    textDecoration: "none",
    color: "inherit",
    display: "grid",
    background: "#fff",
  },

  cardImageWrap: {
    height: 240,
    overflow: "hidden",
    background: "#ececec",
  },

  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  cardContent: {
    background: "rgba(255,255,255,0.97)",
    padding: "20px 20px 24px",
    display: "grid",
    gap: 8,
  },

  cardTitle: {
    fontSize: 22,
    lineHeight: 1.4,
    fontWeight: 500,
    color: "#222",
  },

  cardDesc: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#666",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  cardFooter: {
    marginTop: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 700,
    color: "#333",
  },

  cardLink: {
    color: "#c53b3b",
  },

  noImageLarge: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    background: "#efefef",
    color: "#888",
    fontWeight: 700,
  },

  noImageCard: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    background: "#efefef",
    color: "#888",
    fontWeight: 700,
  },

  loading: {
    background: "#fff",
    padding: 24,
    color: "#666",
  },

  empty: {
    background: "#fff",
    padding: 24,
    color: "#666",
  },

  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 14,
    borderRadius: 14,
  },
};