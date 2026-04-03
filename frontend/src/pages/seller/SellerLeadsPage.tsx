import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  createLeadApi,
  getLeadsApi,
  type LeadItem,
} from "../../features/leads/leads.api";
import LeadActivitiesPanel from "../../features/leads/LeadActivitiesPanel";
import Modal from "../../components/ui/Modal";

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  source: "",
  channel: "",
  note: "",
  interestedProjectId: "",
};

export default function SellerLeadsPage() {
  const [items, setItems] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeLeadId, setActiveLeadId] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  function openCreateModal() {
    setForm(emptyForm);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setForm(emptyForm);
    setIsCreateModalOpen(false);
  }

  async function handleCreateLead(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await createLeadApi({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        source: form.source || undefined,
        channel: form.channel || undefined,
        note: form.note || undefined,
        interestedProjectId: form.interestedProjectId || undefined,
      });

      closeCreateModal();
      await loadLeads();
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      setErrorMessage(
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.join(", ")
          : apiMessage || "Tạo lead thất bại"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerWrap}>
        <div>
          <h1 style={styles.title}>Leads của seller</h1>
          <div style={styles.sub}>Danh sách lead đang xem được</div>
        </div>

        <div style={styles.headerActions}>
          <button type="button" style={styles.primaryBtn} onClick={openCreateModal}>
            Thêm lead mới
          </button>
        </div>
      </div>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      <div style={styles.infoBox}>
        Lead tạo từ trang seller sẽ tự động được gán cho chính seller đang đăng nhập.
      </div>

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

      <Modal
        open={isCreateModalOpen}
        title="Thêm lead mới"
        onClose={closeCreateModal}
      >
        <form onSubmit={handleCreateLead} style={styles.modalForm}>
          <input
            style={styles.input}
            placeholder="Họ tên"
            value={form.fullName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fullName: e.target.value }))
            }
          />

          <input
            style={styles.input}
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />

          <input
            style={styles.input}
            placeholder="Source"
            value={form.source}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, source: e.target.value }))
            }
          />

          <input
            style={styles.input}
            placeholder="Channel"
            value={form.channel}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, channel: e.target.value }))
            }
          />

          <textarea
            style={styles.textarea}
            placeholder="Ghi chú"
            value={form.note}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, note: e.target.value }))
            }
          />

          <div style={styles.modalActions}>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={closeCreateModal}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button type="submit" style={styles.primaryBtn} disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Tạo lead"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "grid", gap: 20 },
  headerWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  title: { margin: 0, fontSize: 34, fontWeight: 800, color: "#111827" },
  sub: { marginTop: 6, color: "#6b7280" },
  headerActions: {
    display: "flex",
    gap: 12,
  },
  primaryBtn: {
    height: 44,
    border: "none",
    borderRadius: 12,
    background: "#2388ff",
    color: "#fff",
    padding: "0 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    height: 44,
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background: "#fff",
    color: "#111827",
    padding: "0 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    fontSize: 14,
  },
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
  modalForm: {
    display: "grid",
    gap: 14,
  },
  input: {
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
  },
  textarea: {
    minHeight: 110,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: 14,
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
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