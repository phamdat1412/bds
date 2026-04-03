// path: frontend/src/pages/public/PublicProjectsPage.tsx
import { useEffect, useState, useCallback, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  getPublicProjectsApi, 
  getPublicLocationsApi, 
  type PublicProjectItem 
} from "../../features/public/publicProjects.api";
import { toggleProjectBookmarkApi } from "../../features/bookmarks/bookmarks.api"; // API Bookmark của Hà
import Pagination from "../../components/ui/Pagination";

export default function PublicProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<PublicProjectItem[]>([]);
  const [locations, setLocations] = useState<Record<string, string[]>>({});
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minArea, setMinArea] = useState(searchParams.get("minArea") || "");
  const [maxArea, setMaxArea] = useState(searchParams.get("maxArea") || "");

  useEffect(() => {
    getPublicLocationsApi().then(res => setLocations(res.data)).catch(console.error);
  }, []);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = Object.fromEntries(searchParams.entries());
      const result = await getPublicProjectsApi(query);
      setItems(result.data.items || []);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error("Lỗi tải dự án");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // Logic QUAN TÂM DỰ ÁN (Lưu vào Database qua API)
  const handleToggleBookmark = async (projectId: string, projectName: string) => {
    try {
      const res = await toggleProjectBookmarkApi(projectId);
      if (res.success) {
        alert(res.data.bookmarked ? `Đã quan tâm dự án: ${projectName}` : `Đã bỏ quan tâm dự án: ${projectName}`);
      }
    } catch (error) {
      alert("Vui lòng đăng nhập để lưu dự án quan tâm.");
    }
  };

  const updateSimpleFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");
    if (value) newParams.set(key, value); else newParams.delete(key);
    if (key === "city") newParams.delete("district");
    setSearchParams(newParams);
  };

  return (
    <div style={styles.page}>
      <section style={styles.wrapper}>
        <div style={styles.inner}>
          <div style={styles.filterSection}>
            <h1 style={styles.heading}>KHÁM PHÁ DỰ ÁN</h1>
            <div style={styles.filterBar}>
               {/* ... (Các bộ lọc giữ nguyên) */}
               <select value={searchParams.get("city") || ""} onChange={(e) => updateSimpleFilter("city", e.target.value)} style={styles.select}>
                  <option value="">Tỉnh/Thành</option>
                  {Object.keys(locations).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
               <button onClick={() => {
                 const newParams = new URLSearchParams(searchParams);
                 if (minPrice) newParams.set("minPrice", minPrice);
                 if (maxPrice) newParams.set("maxPrice", maxPrice);
                 setSearchParams(newParams);
               }} style={styles.btnApply}>Lọc</button>
            </div>
          </div>

          {isLoading ? (
            <div style={styles.loading}>Đang tải dự án...</div>
          ) : (
            <div style={styles.grid}>
              {items.map((item) => (
                <div key={item.id} style={styles.cardWrapper}>
                  <Link to={`/projects/${item.slug}`} style={styles.card}>
                    <div style={styles.cardImageWrap}>
                      {item.thumbnailMedia ? <img src={item.thumbnailMedia.url} style={styles.cardImage} alt="" /> : <div style={styles.noImageCard}>SGROUP</div>}
                    </div>
                    <div style={styles.cardContent}>
                      <div style={styles.typeText}>{item.projectType || "Dự án"}</div>
                      <div style={styles.cardTitle}>{item.name}</div>
                      <div style={styles.locationText}>{[item.district, item.city].filter(Boolean).join(", ")}</div>
                    </div>
                  </Link>
                  
                  {/* NÚT QUAN TÂM - GỌI API SERVER */}
                  <button 
                    style={styles.floatingBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleBookmark(item.id, item.name);
                    }}
                  >
                    ❤️ Quan tâm
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { width: "100%", background: "#f7f7f7" },
  wrapper: { padding: "42px 0 70px" },
  inner: { maxWidth: 1280, margin: "0 auto", padding: "0 20px", display: "grid", gap: 28 },
  filterSection: { display: "grid", gap: 20 },
  heading: { fontSize: 32, fontWeight: 700, color: "#161616" },
  filterBar: { display: "flex", flexWrap: "wrap", gap: 12, background: "#fff", padding: 16, borderRadius: 12 },
  select: { padding: "10px", borderRadius: 8, border: "1px solid #ddd", minWidth: 140 },
  btnApply: { padding: "10px 24px", borderRadius: 8, border: "none", background: "#cf2027", color: "#fff", fontWeight: 700, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 },
  cardWrapper: { position: "relative" },
  card: { textDecoration: "none", color: "inherit", background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #eee", display: "block" },
  cardImageWrap: { height: 220, background: "#f0f0f0" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  cardContent: { padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  typeText: { fontSize: 12, color: "#888", fontWeight: 700 },
  locationText: { fontSize: 14, color: "#666" },
  floatingBtn: { position: "absolute", top: 12, right: 12, background: "#fff", border: "1px solid #eee", borderRadius: "8px", padding: "6px 12px", color: "#cf2027", fontWeight: 700, fontSize: "12px", cursor: "pointer", zIndex: 10 },
  loading: { padding: 40, textAlign: "center" },
  noImageCard: { height: "100%", display: "grid", placeItems: "center", color: "#999" }
};