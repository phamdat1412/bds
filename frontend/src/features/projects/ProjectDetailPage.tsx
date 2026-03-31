import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectDetailApi, type ProjectDetailItem } from "./projects.api";
import { formatMoneyShort } from "../../utils/formatMoneyShort";

export default function ProjectDetailPage() {
  const { id = "" } = useParams();
  const [item, setItem] = useState<ProjectDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDetail() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getProjectDetailApi(id);
      setItem(result.data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được chi tiết dự án"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (isLoading) {
    return <div>Đang tải chi tiết dự án...</div>;
  }

  if (errorMessage) {
    return <div style={styles.error}>{errorMessage}</div>;
  }

  if (!item) {
    return <div>Không có dữ liệu</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{item.name}</h1>
          <div style={styles.sub}>
            {[item.district, item.city].filter(Boolean).join(", ") || "-"}
          </div>
        </div>

        <Link to="/seller/projects" style={styles.backBtn}>
          Quay lại danh sách
        </Link>
      </div>

      <section style={styles.heroCard}>
        <div style={styles.heroGrid}>
          <div>
            <div style={styles.metaWrap}>
              <span style={styles.badge}>{item.projectType || "Dự án"}</span>
              <span style={styles.badge}>{item.status}</span>
              <span style={styles.badge}>{item.propertyCount} sản phẩm</span>
            </div>

            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Chủ đầu tư</div>
                <div style={styles.infoValue}>
                  {item.developerName || "-"}
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Vị trí</div>
                <div style={styles.infoValue}>
                  {item.locationText || "-"}
                </div>
              </div>

              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Mô tả ngắn</div>
                <div style={styles.infoValue}>
                  {item.shortDescription || "-"}
                </div>
              </div>
            </div>
          </div>

          {item.thumbnailMedia?.url ? (
            <img
              src={item.thumbnailMedia.url}
              alt={item.name}
              style={styles.heroImage}
            />
          ) : (
            <div style={styles.heroPlaceholder}>NO IMAGE</div>
          )}
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>Mô tả dự án</div>
        <div style={styles.description}>
          {item.description || "Chưa có mô tả dự án"}
        </div>
      </section>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Sản phẩm</div>
          <div style={styles.statValue}>{item.propertyCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Leads</div>
          <div style={styles.statValue}>{item.leadCount}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Bookmarks</div>
          <div style={styles.statValue}>{item.bookmarkCount}</div>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>Sản phẩm thuộc dự án</div>

        <div style={styles.propertyGrid}>
          {item.properties.map((property) => (
            <Link
              key={property.id}
              to={`/seller/properties/${property.id}`}
              style={styles.propertyCard}
            >
              {property.thumbnail?.url ? (
                <img
                  src={property.thumbnail.url}
                  alt={property.title}
                  style={styles.propertyImage}
                />
              ) : (
                <div style={styles.propertyPlaceholder}>NO IMAGE</div>
              )}

              <div style={styles.propertyBody}>
                <div style={styles.propertyTitle}>
                  {property.code} - {property.title}
                </div>

                <div style={styles.propertyMeta}>
                  {property.propertyType} · {property.inventoryStatus}
                </div>

                <div style={styles.propertyInfo}>
                  {[property.blockName, property.floorNo]
                    .filter(Boolean)
                    .join(" / ") || "-"}
                </div>

                <div style={styles.propertyInfo}>
                  {property.areaGross ? `${property.areaGross} m²` : "-"}
                </div>

                <div style={styles.propertyPrice}>
                  {property.price ? formatMoneyShort(property.price) : "Liên hệ"}
                </div>
              </div>
            </Link>
          ))}

          {item.properties.length === 0 ? (
            <div style={styles.empty}>Chưa có sản phẩm trong dự án</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: 20,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 800,
    color: "#111827",
  },
  sub: {
    marginTop: 6,
    color: "#6b7280",
    fontSize: 15,
  },
  backBtn: {
    textDecoration: "none",
    background: "#fff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 700,
  },
  heroCard: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: 20,
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: 340,
    objectFit: "cover",
    borderRadius: 20,
  },
  heroPlaceholder: {
    width: "100%",
    height: 340,
    display: "grid",
    placeItems: "center",
    borderRadius: 20,
    background: "#f3f4f6",
    color: "#6b7280",
    fontWeight: 700,
  },
  metaWrap: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  badge: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 700,
  },
  infoList: {
    display: "grid",
    gap: 14,
  },
  infoItem: {
    display: "grid",
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: 600,
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#374151",
    whiteSpace: "pre-wrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 700,
  },
  statValue: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: 800,
    color: "#111827",
  },
  propertyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },
  propertyCard: {
    textDecoration: "none",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    overflow: "hidden",
    background: "#fff",
    color: "inherit",
  },
  propertyImage: {
    width: "100%",
    height: 180,
    objectFit: "cover",
  },
  propertyPlaceholder: {
    width: "100%",
    height: 180,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    color: "#6b7280",
    fontWeight: 700,
  },
  propertyBody: {
    padding: 16,
    display: "grid",
    gap: 8,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },
  propertyMeta: {
    fontSize: 13,
    color: "#4b5563",
  },
  propertyInfo: {
    fontSize: 13,
    color: "#6b7280",
  },
  propertyPrice: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
  },
  empty: {
    color: "#6b7280",
    padding: 8,
  },
};