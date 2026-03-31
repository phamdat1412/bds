import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeadsApi, type LeadItem } from "../../features/leads/leads.api";
import LeadActivitiesPanel from "../../features/leads/LeadActivitiesPanel";
import Modal from "../../components/ui/Modal";

export default function SellerLeadsPage() {
  const [items, setItems] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeLeadId, setActiveLeadId] = useState("");

  async function loadLeads() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getLeadsApi({ page: 1, pageSize: 100 });
      setItems(result.data?.items || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được leads"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  return (
    <div style={styles.page}>
      <div>
        <h1 style={styles.title}>Leads của seller</h1>
        <div style={styles.sub}>Danh sách lead đang xem được</div>
      </div>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      <div style={styles.card}>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Họ tên</th>
                  <th style={styles.th}>Điện thoại</th>
                  <th style={styles.th}>Nguồn</th>
                  <th style={styles.th}>Trạng thái</th>
                  <th style={styles.th}>Dự án quan tâm</th>
                  <th style={styles.th}>Hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.fullName}</td>
                    <td style={styles.td}>{item.phone}</td>
                    <td style={styles.td}>{item.source || "-"}</td>
                    <td style={styles.td}>{item.status}</td>
                    <td style={styles.td}>
                      {item.interestedProject?.name || "-"}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        <Link
                          to={`/seller/leads/${item.id}`}
                          style={styles.detailBtn}
                        >
                          Chi tiết
                        </Link>

                        <button
                          type="button"
                          style={styles.actionBtn}
                          onClick={() => setActiveLeadId(item.id)}
                        >
                          Chăm sóc
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.empty}>
                      Chưa có lead
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(activeLeadId)}
        title="Hoạt động chăm sóc lead"
        onClose={() => setActiveLeadId("")}
      >
        {activeLeadId ? <LeadActivitiesPanel leadId={activeLeadId} /> : null}
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "grid", gap: 20 },
  title: { margin: 0, fontSize: 34, fontWeight: 800, color: "#111827" },
  sub: { marginTop: 6, color: "#6b7280" },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
  },
  tableWrap: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 13,
    fontWeight: 800,
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
  },
  actionRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  detailBtn: {
    height: 36,
    lineHeight: "36px",
    textDecoration: "none",
    borderRadius: 10,
    background: "#fff",
    border: "1px solid #d1d5db",
    color: "#111827",
    padding: "0 12px",
    fontWeight: 700,
  },
  actionBtn: {
    height: 36,
    border: "none",
    borderRadius: 10,
    background: "#2388ff",
    color: "#fff",
    padding: "0 12px",
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
  empty: {
    textAlign: "center",
    padding: 20,
    color: "#6b7280",
  },
};