// path: frontend/src/pages/public/CartPage.tsx
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../features/cart/cart.store";
import { getMyProjectBookmarksApi, toggleProjectBookmarkApi } from "../../features/bookmarks/bookmarks.api";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart(); // Lấy căn hộ từ LocalStorage
  const [bookmarkedProjects, setBookmarkedProjects] = useState<any[]>([]);
  const [isProjectLoading, setIsProjectLoading] = useState(false);

  // Load dự án đã quan tâm từ Server
  const loadProjectBookmarks = async () => {
    setIsProjectLoading(true);
    try {
      const res = await getMyProjectBookmarksApi();
      setBookmarkedProjects(res.data || []);
    } catch { console.error("Cần đăng nhập để xem dự án quan tâm"); }
    finally { setIsProjectLoading(false); }
  };

  useEffect(() => { loadProjectBookmarks(); }, []);

  const handleUnbookmark = async (projectId: string) => {
    await toggleProjectBookmarkApi(projectId);
    loadProjectBookmarks();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        {/* PHẦN 1: DỰ ÁN QUAN TÂM (SERVER-SIDE) */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Dự án đang quan tâm ({bookmarkedProjects.length})</h2>
          {isProjectLoading ? <p>Đang tải dự án...</p> : bookmarkedProjects.length === 0 ? (
             <p style={styles.emptyText}>Chưa có dự án nào được lưu.</p>
          ) : (
            <div style={styles.list}>
              {bookmarkedProjects.map((item) => (
                <div key={item.id} style={styles.item}>
                   <div style={styles.info}>
                      <Link to={`/projects/${item.project.slug}`} style={styles.itemTitle}>{item.project.name}</Link>
                      <div style={styles.locationText}>{item.project.locationText}</div>
                   </div>
                   <button onClick={() => handleUnbookmark(item.project.id)} style={styles.removeBtn}>Bỏ quan tâm</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PHẦN 2: GIỎ HÀNG CĂN HỘ (LOCAL-SIDE) */}
        <section style={{ ...styles.section, marginTop: 40 }}>
          <div style={styles.headerRow}>
            <h2 style={styles.sectionTitle}>Căn hộ đã chọn ({items.length})</h2>
            {items.length > 0 && <button onClick={clearCart} style={styles.clearBtn}>Xóa tất cả căn hộ</button>}
          </div>

          {items.length === 0 ? (
            <p style={styles.emptyText}>Giỏ hàng căn hộ đang trống.</p>
          ) : (
            <div style={styles.list}>
              {items.map((item) => (
                <div key={item.id} style={styles.item}>
                  <div style={styles.itemMain}>
                    <div style={styles.imgBox}>
                      {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" style={styles.img} /> : <div style={styles.noImg}>NO IMG</div>}
                    </div>
                    <div style={styles.info}>
                      <div style={styles.itemCode}>{item.code}</div>
                      <Link to={`/properties/${item.id}`} style={styles.itemTitle}>{item.title}</Link>
                      <div style={styles.itemPrice}>{item.price ? `${Number(item.price).toLocaleString()} VND` : "Liên hệ"}</div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={styles.removeBtn}>Gỡ bỏ</button>
                </div>
              ))}
              <div style={styles.actions}>
                <button style={styles.contactBtn} onClick={() => alert("SGROUP sẽ liên hệ tư vấn các căn hộ này!")}>
                  Gửi yêu cầu tư vấn cho {items.length} căn hộ
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", padding: "60px 0", background: "#f8f9fa" },
  container: { maxWidth: 900, margin: "0 auto", padding: "0 20px" },
  section: { background: "#fff", padding: 30, borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  sectionTitle: { fontSize: 24, fontWeight: 700, marginBottom: 20 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  clearBtn: { background: "none", border: "none", color: "#999", cursor: "pointer", textDecoration: "underline" },
  emptyText: { color: "#888", fontSize: 15 },
  list: { display: "grid", gap: 20 },
  item: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #eee" },
  itemMain: { display: "flex", gap: 20, alignItems: "center" },
  imgBox: { width: 110, height: 80, borderRadius: 10, overflow: "hidden", background: "#f0f0f0" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { height: "100%", display: "grid", placeItems: "center", fontSize: 10, color: "#ccc" },
  info: { display: "grid", gap: 4 },
  itemCode: { fontSize: 11, fontWeight: 800, color: "#cf2027" },
  itemTitle: { fontSize: 17, fontWeight: 600, color: "#111", textDecoration: "none" },
  locationText: { fontSize: 13, color: "#666" },
  itemPrice: { fontSize: 15, fontWeight: 700, color: "#333" },
  removeBtn: { background: "none", border: "none", color: "#cf2027", fontWeight: 700, cursor: "pointer", fontSize: 14 },
  actions: { marginTop: 20, textAlign: "right" },
  contactBtn: { padding: "16px 30px", background: "#111", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }
};