// path: frontend/src/pages/public/PublicProjectDetailPage.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  getPublicProjectDetailApi, 
  type PublicProjectDetail 
} from "../../features/public/publicProjects.api";
import { useCart } from "../../features/cart/cart.store";

export default function PublicProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<PublicProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const result = await getPublicProjectDetailApi(slug);
        setProject(result.data);
      } catch (error) {
        console.error("Lỗi tải chi tiết dự án:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (isLoading) return <div style={styles.loading}>Đang tải thông tin dự án...</div>;
  if (!project) return <div style={styles.error}>Không tìm thấy dự án</div>;

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>{project.name}</h1>
          <p style={styles.location}>📍 {project.locationText || [project.district, project.city].filter(Boolean).join(", ")}</p>
        </div>
      </div>

      <div style={styles.container}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Giới thiệu dự án</h2>
          <div style={styles.description}>{project.description || project.shortDescription}</div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Danh sách sản phẩm ({project.properties.length})</h2>
          <div style={styles.grid}>
            {project.properties.map((item) => (
              <div key={item.id} style={styles.card}>
                <Link to={`/properties/${item.id}`} style={styles.cardLink}>
                  <div style={styles.imageBox}>
                    {item.thumbnail?.url ? (
                      <img src={item.thumbnail.url} alt={item.title} style={styles.img} />
                    ) : (
                      <div style={styles.noImg}>SGROUP IMAGE</div>
                    )}
                  </div>
                  <div style={styles.cardContent}>
                    <div style={styles.propertyCode}>{item.code}</div>
                    <h3 style={styles.propertyTitle}>{item.title}</h3>
                    <div style={styles.price}>
                      {item.price ? `${Number(item.price).toLocaleString()} ${item.currency}` : "Liên hệ"}
                    </div>
                    <div style={styles.meta}>
                      <span>🏠 {item.propertyType}</span>
                      {item.areaGross && <span>📐 {item.areaGross} m²</span>}
                    </div>
                  </div>
                </Link>

                <div style={{ padding: "0 16px 16px" }}>
                  <button 
                    style={styles.cartBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addItem({
                        id: item.id,
                        code: item.code,
                        title: item.title,
                        price: item.price,
                        projectSlug: project.slug,
                        thumbnailUrl: item.thumbnail?.url || null
                      });
                      alert(`Đã lưu căn ${item.code} vào danh sách quan tâm!`);
                    }}
                  >
                    🛒 Lưu giỏ hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { background: "#f9f9f9", minHeight: "100vh", paddingBottom: 60 },
  hero: { background: "#fff", padding: "40px 0", borderBottom: "1px solid #eee", marginBottom: 30 },
  container: { maxWidth: 1200, margin: "0 auto", padding: "0 20px" },
  title: { fontSize: 36, fontWeight: 700, marginBottom: 10, color: "#111" },
  location: { color: "#666", fontSize: 16 },
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 24, fontWeight: 700, marginBottom: 20, color: "#111", borderLeft: "4px solid #cf2027", paddingLeft: 15 },
  description: { fontSize: 16, lineHeight: 1.8, color: "#444", whiteSpace: "pre-wrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 },
  card: { background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid #eee" },
  cardLink: { textDecoration: "none", color: "inherit", display: "block" },
  imageBox: { height: 180, background: "#eee" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { height: "100%", display: "grid", placeItems: "center", color: "#999", fontWeight: 700 },
  cardContent: { padding: 16 },
  propertyCode: { fontSize: 12, fontWeight: 700, color: "#cf2027", marginBottom: 4 },
  propertyTitle: { fontSize: 18, fontWeight: 600, marginBottom: 10, height: 44, overflow: "hidden" },
  price: { fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 10 },
  meta: { display: "flex", gap: 15, fontSize: 14, color: "#666", marginBottom: 15 },
  cartBtn: { width: "100%", padding: "12px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 },
  loading: { padding: 100, textAlign: "center", fontSize: 18, color: "#666" },
  error: { padding: 100, textAlign: "center", color: "#cf2027", fontSize: 18 }
};