import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPublicNewsDetailApi,
  type PublicNewsItem,
} from "../../features/public/publicNews.api";

export default function PublicNewsDetailPage() {
  const { slug = "" } = useParams();
  const [item, setItem] = useState<PublicNewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDetail() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getPublicNewsDetailApi(slug);
      setItem(result.data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được bài viết"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [slug]);

  if (isLoading) return <div>Đang tải bài viết...</div>;
  if (errorMessage) return <div style={styles.error}>{errorMessage}</div>;
  if (!item) return <div>Không có dữ liệu</div>;

  return (
    <div style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>{item.title}</h1>
        <div style={styles.sub}>{item.summary || "Tin tức SGROUP"}</div>

        {item.thumbnailMedia?.url ? (
          <img
            src={item.thumbnailMedia.url}
            alt={item.title}
            style={styles.image}
          />
        ) : null}

        <div style={styles.content}>
          {item.content || "Đang cập nhật nội dung bài viết"}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "grid", gap: 20 },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: 28,
    border: "1px solid #e5e7eb",
  },
  title: { margin: 0, fontSize: 36, fontWeight: 800, color: "#111827" },
  sub: { marginTop: 10, fontSize: 16, color: "#6b7280" },
  image: {
    marginTop: 18,
    width: "100%",
    maxHeight: 420,
    objectFit: "cover",
    borderRadius: 20,
  },
  content: {
    marginTop: 22,
    fontSize: 16,
    lineHeight: 1.8,
    color: "#374151",
    whiteSpace: "pre-wrap",
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
  },
};