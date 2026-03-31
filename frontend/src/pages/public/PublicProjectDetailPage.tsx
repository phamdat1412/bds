import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPublicProjectDetailApi,
  type PublicProjectDetail,
} from "../../features/public/publicProjects.api";
import {
  getProjectBookmarkStatusApi,
  toggleProjectBookmarkApi,
} from "../../features/bookmarks/bookmarks.api";
import { formatMoneyShort } from "../../utils/formatMoneyShort";
import { getRoles, getAccessToken } from "../../utils/storage";

export default function PublicProjectDetailPage() {
  const { slug = "" } = useParams();
  const [item, setItem] = useState<PublicProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  const roles = getRoles();
  const token = getAccessToken();
  const isCustomer = Boolean(token) && roles.includes("customer");

  async function loadDetail() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getPublicProjectDetailApi(slug);
      setItem(result.data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được chi tiết dự án"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadBookmarkStatus(projectId: string) {
    if (!isCustomer) return;

    try {
      const result = await getProjectBookmarkStatusApi(projectId);
      setIsBookmarked(result.data.bookmarked);
    } catch {
      setIsBookmarked(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [slug]);

  useEffect(() => {
    if (item?.id) {
      loadBookmarkStatus(item.id);
    }
  }, [item?.id]);

  async function handleToggleBookmark() {
    if (!item) return;

    setIsBookmarkLoading(true);
    try {
      const result = await toggleProjectBookmarkApi(item.id);
      setIsBookmarked(result.data.bookmarked);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể lưu dự án"
      );
    } finally {
      setIsBookmarkLoading(false);
    }
  }

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
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div>
            <h1 style={styles.title}>{item.name}</h1>
            <div style={styles.meta}>
              {[item.district, item.city].filter(Boolean).join(", ") || "-"}
            </div>
            <div style={styles.desc}>
              {item.description ||
                item.shortDescription ||
                "Đang cập nhật thông tin chi tiết dự án"}
            </div>

            <div style={styles.badges}>
              <span style={styles.badge}>{item.projectType || "Dự án"}</span>
              <span style={styles.badge}>{item.propertyCount} sản phẩm</span>
              <span style={styles.badge}>
                {item.developerName || "Đang cập nhật CĐT"}
              </span>
            </div>

            {isCustomer ? (
              <div style={styles.bookmarkWrap}>
                <button
                  type="button"
                  style={isBookmarked ? styles.savedBtn : styles.saveBtn}
                  onClick={handleToggleBookmark}
                  disabled={isBookmarkLoading}
                >
                  {isBookmarkLoading
                    ? "Đang xử lý..."
                    : isBookmarked
                    ? "Đã quan tâm"
                    : "Quan tâm dự án"}
                </button>
              </div>
            ) : null}
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

      <section style={styles.section}>
        <div style={styles.sectionTitle}>Sản phẩm tiêu biểu</div>

        <div style={styles.propertyGrid}>
          {item.properties.map((property) => (
            <div key={property.id} style={styles.propertyCard}>
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
            </div>
          ))}

          {item.properties.length === 0 ? (
            <div style={styles.empty}>Chưa có sản phẩm public</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "grid", gap: 24 },
  hero: {
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #e5e7eb",
  },
  heroContent: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 24,
    alignItems: "center",
  },
  title: { margin: 0, fontSize: 38, fontWeight: 800, color: "#111827" },
  meta: { marginTop: 8, fontSize: 15, color: "#4b5563" },
  desc: { marginTop: 14, fontSize: 15, lineHeight: 1.7, color: "#6b7280" },
  badges: {
    marginTop: 18,
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
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
  bookmarkWrap: {
    marginTop: 18,
  },
  saveBtn: {
    height: 44,
    border: "none",
    borderRadius: 12,
    background: "#2388ff",
    color: "#fff",
    padding: "0 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  savedBtn: {
    height: 44,
    border: "none",
    borderRadius: 12,
    background: "#16a34a",
    color: "#fff",
    padding: "0 16px",
    fontWeight: 700,
    cursor: "pointer",
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
    borderRadius: 20,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    color: "#6b7280",
    fontWeight: 700,
  },
  section: {
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 18,
  },
  propertyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },
  propertyCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    overflow: "hidden",
    background: "#fff",
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
    padding: 20,
  },
};