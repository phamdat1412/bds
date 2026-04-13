import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../features/cart/cart.store";
import { getMyProjectBookmarksApi, toggleProjectBookmarkApi } from "../../features/bookmarks/bookmarks.api";
import { useAuth } from "../../app/AuthContext"; // Import từ file bạn gửi
import { createLeadApi } from "../../features/leads/leads.api"; // Import từ file bạn gửi

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập từ Context
  
  const [bookmarkedProjects, setBookmarkedProjects] = useState<any[]>([]);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // State cho thông tin khách vãng lai
  const [guestInfo, setGuestInfo] = useState({ fullName: "", phone: "", email: "", note: "" });

  const loadProjectBookmarks = async () => {
    if (!isAuthenticated) return;
    setIsProjectLoading(true);
    try {
      const res = await getMyProjectBookmarksApi();
      setBookmarkedProjects(res.data || []);
    } catch { console.error("Lỗi tải dự án quan tâm"); }
    finally { setIsProjectLoading(false); }
  };

  useEffect(() => { loadProjectBookmarks(); }, [isAuthenticated]);

  const handleUnbookmark = async (projectId: string) => {
    await toggleProjectBookmarkApi(projectId);
    loadProjectBookmarks();
  };

  // HÀM XỬ LÝ GỬI YÊU CẦU TƯ VẤN
  const handleConsultancyRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      // Chuẩn bị nội dung Ghi chú liệt kê các căn hộ khách chọn
      const propertyListStr = items.map(i => `- ${i.title} (Mã: ${i.code})`).join("\n");
      
      let payload;

      if (isAuthenticated && user) {
  if (!user.phone) {
    alert("Vui lòng cập nhật số điện thoại trước khi gửi yêu cầu tư vấn.");
    return;
  }

  payload = {
    fullName: user.email?.split("@")[0] || user.phone || "Khách hàng",
    phone: user.phone,
    email: user.email || undefined,
    source: "Website - Giỏ hàng (Đã đăng nhập)",
    note: `YÊU CẦU TƯ VẤN CÁC CĂN HỘ:\n${propertyListStr}`,
    channel: "Web"
  };
} else {
        // TRƯỜNG HỢP 2: KHÁCH VÃNG LAI (Lấy từ Form)
        payload = {
          fullName: guestInfo.fullName,
          phone: guestInfo.phone,
          email: guestInfo.email || undefined,
          source: "Website - Giỏ hàng (Khách vãng lai)",
          note: `LỜI NHẮN: ${guestInfo.note}\n\nDANH SÁCH QUAN TÂM:\n${propertyListStr}`,
          channel: "Web"
        };
      }

      const res = await createLeadApi(payload);
      
      if (res.success) {
        alert("SGROUP đã nhận được yêu cầu! Chuyên viên tư vấn sẽ liên hệ với bạn ngay.");
        clearCart(); // Xóa giỏ hàng sau khi gửi thành công
        setShowLeadForm(false);
      }
    } catch (error) {
      alert("Gửi yêu cầu thất bại. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        {/* 1. DỰ ÁN QUAN TÂM (SERVER-SIDE) */}
        {isAuthenticated && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Dự án bạn đang theo dõi</h2>
            {isProjectLoading ? <p>Đang tải...</p> : bookmarkedProjects.length === 0 ? (
               <p style={styles.emptyText}>Bạn chưa nhấn quan tâm dự án nào.</p>
            ) : (
              <div style={styles.list}>
                {bookmarkedProjects.map((item) => (
                  <div key={item.id} style={styles.item}>
                     <div style={styles.info}>
                        <Link to={`/projects/${item.project.slug}`} style={styles.itemTitle}>{item.project.name}</Link>
                        <div style={styles.locationText}>{item.project.locationText || "Vị trí đang cập nhật"}</div>
                     </div>
                     <button onClick={() => handleUnbookmark(item.project.id)} style={styles.removeBtn}>Bỏ lưu</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. GIỎ HÀNG CĂN HỘ (LOCAL-SIDE) */}
        <section style={{ ...styles.section, marginTop: isAuthenticated ? 40 : 0 }}>
          <div style={styles.headerRow}>
            <h2 style={styles.sectionTitle}>Sản phẩm cần tư vấn ({items.length})</h2>
            {items.length > 0 && <button onClick={clearCart} style={styles.clearBtn}>Làm trống giỏ</button>}
          </div>

          {items.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px 0'}}>
              <p style={styles.emptyText}>Bạn chưa chọn căn hộ nào.</p>
              <Link to="/projects" style={styles.linkRed}>Xem danh sách dự án ngay</Link>
            </div>
          ) : (
            <div style={styles.list}>
              {items.map((item) => (
                <div key={item.id} style={styles.item}>
                  <div style={styles.itemMain}>
                    <div style={styles.imgBox}>
                      {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" style={styles.img} /> : <div style={styles.noImg}>SGROUP</div>}
                    </div>
                    <div style={styles.info}>
                      <div style={styles.itemCode}>{item.code}</div>
                      <Link to={`/properties/${item.id}`} style={styles.itemTitle}>{item.title}</Link>
                      <div style={styles.itemPrice}>{item.price ? `${Number(item.price).toLocaleString()} VND` : "Liên hệ tư vấn"}</div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={styles.removeBtn}>Gỡ</button>
                </div>
              ))}
              <div style={styles.actions}>
                <button 
                  style={styles.contactBtn} 
                  disabled={isSubmitting}
                  onClick={() => isAuthenticated ? handleConsultancyRequest() : setShowLeadForm(true)}
                >
                  {isSubmitting ? "Đang gửi yêu cầu..." : `Nhận báo giá chi tiết (${items.length})`}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 3. MODAL NHẬP THÔNG TIN (Dành cho Guest) */}
        {showLeadForm && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={{margin: '0 0 10px'}}>Đăng ký nhận tư vấn</h3>
              <p style={{fontSize: 14, color: '#666', marginBottom: 20}}>Vui lòng để lại thông tin để chúng tôi gửi bảng giá và chính sách chi tiết.</p>
              <form onSubmit={handleConsultancyRequest} style={styles.form}>
                <input required placeholder="Họ và tên *" style={styles.input} onChange={e => setGuestInfo({...guestInfo, fullName: e.target.value})} />
                <input required placeholder="Số điện thoại (Nhận báo giá Zalo) *" style={styles.input} onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} />
                <input placeholder="Email (Nhận hợp đồng mẫu)" style={styles.input} onChange={e => setGuestInfo({...guestInfo, email: e.target.value})} />
                <textarea placeholder="Ghi chú thêm (Vd: Thời gian gọi lại phù hợp...)" style={{...styles.input, height: 80}} onChange={e => setGuestInfo({...guestInfo, note: e.target.value})} />
                <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                  <button type="button" onClick={() => setShowLeadForm(false)} style={styles.cancelBtn}>Đóng</button>
                  <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>Gửi ngay</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", padding: "60px 0", background: "#f8f9fa" },
  container: { maxWidth: 800, margin: "0 auto", padding: "0 20px" },
  section: { background: "#fff", padding: 30, borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
  sectionTitle: { fontSize: 22, fontWeight: 800, marginBottom: 20, color: '#111' },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  clearBtn: { background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 13, textDecoration: 'underline' },
  emptyText: { color: "#666", fontSize: 16, marginBottom: 10 },
  linkRed: { color: "#cf2027", fontWeight: 700, textDecoration: 'none' },
  list: { display: "grid", gap: 20 },
  item: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #f0f0f0" },
  itemMain: { display: "flex", gap: 16, alignItems: "center" },
  imgBox: { width: 100, height: 75, borderRadius: 12, overflow: "hidden", background: "#f0f0f0" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { height: "100%", display: "grid", placeItems: "center", fontSize: 10, color: "#ccc", fontWeight: 700 },
  info: { display: "grid", gap: 2 },
  itemCode: { fontSize: 10, fontWeight: 800, color: "#cf2027", textTransform: 'uppercase' },
  itemTitle: { fontSize: 16, fontWeight: 700, color: "#111", textDecoration: "none" },
  locationText: { fontSize: 13, color: "#777" },
  itemPrice: { fontSize: 15, fontWeight: 700, color: "#333" },
  removeBtn: { background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  actions: { marginTop: 25, textAlign: "right" },
  contactBtn: { padding: "16px 36px", background: "#cf2027", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", boxShadow: '0 4px 15px rgba(207, 32, 39, 0.3)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: '#fff', padding: 32, borderRadius: 28, width: '90%', maxWidth: 450 },
  form: { display: 'grid', gap: 12 },
  input: { padding: '14px', borderRadius: 12, border: '1px solid #eee', fontSize: 15, background: '#f9fafb', outline: 'none' },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, border: '1px solid #eee', background: '#fff', cursor: 'pointer', fontWeight: 600 },
  submitBtn: { flex: 2, padding: 14, borderRadius: 12, border: 'none', background: '#cf2027', color: '#fff', fontWeight: 700, cursor: 'pointer' }
};