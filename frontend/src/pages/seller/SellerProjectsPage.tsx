import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjectsApi, type ProjectItem } from "../../features/projects/projects.api";

export default function SellerProjectsPage() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProjects() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getProjectsApi({ page: 1, pageSize: 100 });
      setItems(result.data?.items || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được projects"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div style={styles.page}>
      <div>
        <h1 style={styles.title}>Projects</h1>
        <div style={styles.sub}>Danh sách dự án seller có thể xem</div>
      </div>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      <div style={styles.grid}>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={styles.card}>
              <Link
                to={`/seller/projects/${item.id}`}
                style={styles.cardLink}
              >
                {item.thumbnailMedia?.url ? (
                  <img
                    src={item.thumbnailMedia.url}
                    alt={item.name}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.imagePlaceholder}>NO IMAGE</div>
                )}

                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{item.name}</div>
                  <div style={styles.cardMeta}>
                    {[item.district, item.city].filter(Boolean).join(", ") || "-"}
                  </div>
                  <div style={styles.cardDesc}>
                    {item.shortDescription || "Đang cập nhật mô tả"}
                  </div>
                </div>
              </Link>

              <div style={styles.actions}>
                <Link
                  to={`/seller/projects/${item.id}`}
                  style={styles.detailBtn}
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "grid", gap: 20 },
  title: { margin: 0, fontSize: 34, fontWeight: 800, color: "#111827" },
  sub: { marginTop: 6, color: "#6b7280" },
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
    display: "block",
    textDecoration: "none",
    color: "inherit",
  },
  image: {
    width: "100%",
    height: 220,
    objectFit: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    color: "#6b7280",
    fontWeight: 700,
  },
  cardBody: {
    padding: 18,
    display: "grid",
    gap: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  cardMeta: {
    fontSize: 14,
    color: "#4b5563",
  },
  cardDesc: {
    fontSize: 14,
    color: "#6b7280",
  },
  actions: {
    padding: "0 18px 18px 18px",
  },
  detailBtn: {
    display: "inline-block",
    textDecoration: "none",
    background: "#2388ff",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
  },
};