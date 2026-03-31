import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyProjectBookmarksApi,
  toggleProjectBookmarkApi,
  type BookmarkItem,
} from "../../features/bookmarks/bookmarks.api";

export default function UserBookmarksPage() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadBookmarks() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getMyProjectBookmarksApi();
      setItems(result.data || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được danh sách quan tâm"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function handleRemove(projectId: string) {
    try {
      await toggleProjectBookmarkApi(projectId);
      await loadBookmarks();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể bỏ lưu dự án"
      );
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Dự án quan tâm</h1>
        <div style={styles.sub}>
          Danh sách dự án bạn đã lưu để theo dõi sau
        </div>
      </div>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      {isLoading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => (
            <div key={item.id} style={styles.card}>
              <Link to={`/projects/${item.project.slug}`} style={styles.cardLink}>
                {item.project.thumbnailMedia?.url ? (
                  <img
                    src={item.project.thumbnailMedia.url}
                    alt={item.project.name}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.imagePlaceholder}>NO IMAGE</div>
                )}

                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{item.project.name}</div>
                  <div style={styles.cardMeta}>
                    {[item.project.district, item.project.city]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </div>
                  <div style={styles.cardDesc}>
                    {item.project.shortDescription || "Đang cập nhật mô tả"}
                  </div>
                </div>
              </Link>

              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.removeBtn}
                  onClick={() => handleRemove(item.project.id)}
                >
                  Bỏ quan tâm
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 ? (
            <div style={styles.empty}>Bạn chưa lưu dự án nào</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "grid", gap: 20 },
  hero: {
    background: "#fff",
    borderRadius: 24,
    padding: 28,
    border: "1px solid #e5e7eb",
  },
  title: { margin: 0, fontSize: 34, fontWeight: 800, color: "#111827" },
  sub: { marginTop: 10, fontSize: 16, color: "#6b7280" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  cardLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
  },
  image: { width: "100%", height: 220, objectFit: "cover" },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    color: "#6b7280",
    fontWeight: 700,
  },
  cardBody: { padding: 18, display: "grid", gap: 8 },
  cardTitle: { fontSize: 22, fontWeight: 800, color: "#111827" },
  cardMeta: { fontSize: 14, color: "#4b5563" },
  cardDesc: { fontSize: 14, color: "#6b7280" },
  actions: {
    padding: "0 18px 18px 18px",
  },
  removeBtn: {
    width: "100%",
    height: 42,
    border: "none",
    borderRadius: 12,
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
  },
  empty: { color: "#6b7280", padding: 20 },
};