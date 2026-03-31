import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  assignLeadApi,
  createLeadApi,
  deleteLeadApi,
  getLeadsApi,
  updateLeadApi,
  updateLeadStatusApi,
} from "./leads.api";
import type { LeadItem, LeadStatus } from "./leads.api";
import api from "../../services/api";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

type UserOption = {
  id: string;
  email: string | null;
  phone: string | null;
  userType: string;
  roles: Array<{ code: string; name: string }>;
};

type ProjectOption = {
  id: string;
  name: string;
};

const statusOptions: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
  "lost",
];

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  source: "",
  channel: "",
  note: "",
  interestedProjectId: "",
  status: "new" as LeadStatus,
};

export default function LeadsPage() {
  const [items, setItems] = useState<LeadItem[]>([]);
  const [salesUsers, setSalesUsers] = useState<UserOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [keywordFilter, setKeywordFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeadItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [assignLeadId, setAssignLeadId] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignNote, setAssignNote] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  async function loadLeads(targetPage = page) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getLeadsApi({
        status: (statusFilter || undefined) as LeadStatus | undefined,
        keyword: keywordFilter || undefined,
        page: targetPage,
        pageSize,
      });

      setItems(result.data?.items || []);
      setPagination(
        result.data?.pagination || {
          page: 1,
          pageSize,
          totalItems: 0,
          totalPages: 1,
        }
      );
      setPage(targetPage);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      setErrorMessage(
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.join(", ")
          : apiMessage || "Không tải được danh sách lead"
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadOptions() {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get("/users", { params: { userType: "staff", page: 1, pageSize: 100 } }),
        api.get("/projects", { params: { page: 1, pageSize: 100 } }),
      ]);

      const users: UserOption[] = usersRes.data?.data?.items || [];
      setSalesUsers(
  users.filter((u) =>
    u.roles?.some((r) => ["seller", "admin"].includes(r.code))
  )
);

      const projectsData = projectsRes.data?.data?.items || [];
      setProjects(
        projectsData.map((p: any) => ({
          id: p.id,
          name: p.name,
        }))
      );
    } catch {
      // bỏ qua để page vẫn dùng được
    }
  }

  useEffect(() => {
    loadLeads(1);
    loadOptions();
  }, []);

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(item: LeadItem) {
    setEditingItem(item);
    setForm({
      fullName: item.fullName,
      phone: item.phone,
      email: item.email || "",
      source: item.source || "",
      channel: item.channel || "",
      note: item.note || "",
      interestedProjectId: item.interestedProject?.id || "",
      status: item.status,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    await loadLeads(1);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        source: form.source || undefined,
        channel: form.channel || undefined,
        note: form.note || undefined,
        interestedProjectId: form.interestedProjectId || undefined,
        status: form.status,
      };

      if (editingItem) {
        await updateLeadApi(editingItem.id, payload);
      } else {
        await createLeadApi({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          source: form.source || undefined,
          channel: form.channel || undefined,
          note: form.note || undefined,
          interestedProjectId: form.interestedProjectId || undefined,
        });
      }

      closeModal();
      await loadLeads(page);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      setErrorMessage(
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.join(", ")
          : apiMessage || "Lưu lead thất bại"
      );
    }
  }

  async function handleUpdateStatus(leadId: string, status: LeadStatus) {
    try {
      await updateLeadStatusApi(leadId, { status });
      await loadLeads(page);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    }
  }

  async function handleAssignLead(event: FormEvent) {
    event.preventDefault();

    try {
      await assignLeadApi(assignLeadId, {
        assignedToUserId: assignUserId,
        note: assignNote || undefined,
      });

      setAssignLeadId("");
      setAssignUserId("");
      setAssignNote("");

      await loadLeads(page);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Gán lead thất bại");
    }
  }

  async function handleDeleteLead(item: LeadItem) {
    const confirmed = window.confirm(
      `Xóa lead "${item.fullName} - ${item.phone}"?`
    );
    if (!confirmed) return;

    try {
      await deleteLeadApi(item.id);
      await loadLeads(page);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Xóa lead thất bại");
    }
  }

  const leadCount = useMemo(() => pagination.totalItems, [pagination.totalItems]);
  const newCount = useMemo(
    () => items.filter((x) => x.status === "new").length,
    [items]
  );
  const qualifiedCount = useMemo(
    () => items.filter((x) => x.status === "qualified").length,
    [items]
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerWrap}>
        <div>
          <h1 style={styles.title}>Danh sách khách hàng / lead</h1>
          <div style={styles.sub}>
            Tìm thấy: <strong>{leadCount}</strong> lead
          </div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.secondaryBtn} onClick={() => loadLeads(page)}>
            Làm mới
          </button>
          <button style={styles.primaryBtn} onClick={openCreateModal}>
            Thêm lead mới
          </button>
        </div>
      </div>

      <div style={styles.tabRow}>
        <div style={styles.tabBlue}>Tất cả ({leadCount})</div>
        <div style={styles.tabPink}>New ({newCount})</div>
        <div style={styles.tabGreen}>Qualified ({qualifiedCount})</div>
      </div>

      <section style={styles.filterCard}>
        <form onSubmit={handleFilterSubmit} style={styles.filterRow}>
          <input
            style={styles.input}
            placeholder="Tên khách hàng, email, số điện thoại..."
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
          />

          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button style={styles.primaryBtn} type="submit">
            Lọc
          </button>
        </form>
      </section>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      <section style={styles.filterCard}>
        <h3 style={styles.sectionTitle}>Gán lead cho sales</h3>
        <form onSubmit={handleAssignLead} style={styles.assignRow}>
          <select
            style={styles.select}
            value={assignLeadId}
            onChange={(e) => setAssignLeadId(e.target.value)}
          >
            <option value="">Chọn lead</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName} - {item.phone}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
          >
            <option value="">Chọn sales</option>
            {salesUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email || user.phone || user.id}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="Ghi chú gán lead"
            value={assignNote}
            onChange={(e) => setAssignNote(e.target.value)}
          />

          <button style={styles.primaryBtn} type="submit">
            Gán lead
          </button>
        </form>
      </section>

      <section style={styles.tableCard}>
        {isLoading ? (
          <div>Đang tải...</div>
        ) : (
          <>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Khách hàng</th>
                    <th style={styles.th}>Liên hệ</th>
                    <th style={styles.th}>Nguồn</th>
                    <th style={styles.th}>Dự án</th>
                    <th style={styles.th}>Sales</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          <div style={styles.nameTitle}>{item.fullName}</div>
                          <div style={styles.nameSub}>{item.note || "-"}</div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div>{item.phone}</div>
                        <div style={styles.subLine}>{item.email || "-"}</div>
                      </td>
                      <td style={styles.td}>{item.source || "-"}</td>
                      <td style={styles.td}>{item.interestedProject?.name || "-"}</td>
                      <td style={styles.td}>
                        {item.latestAssignment?.assignedToUserEmail || "-"}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge value={item.status} />
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionCol}>
                          <select
                            style={styles.smallSelect}
                            value={item.status}
                            onChange={(e) =>
                              handleUpdateStatus(item.id, e.target.value as LeadStatus)
                            }
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>

                          <button
                            style={styles.textBtn}
                            onClick={() => openEditModal(item)}
                          >
                            Sửa
                          </button>

                          <button
                            style={styles.textBtnDanger}
                            onClick={() => handleDeleteLead(item)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={styles.empty}>
                        Chưa có dữ liệu lead
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              onChangePage={(nextPage) => loadLeads(nextPage)}
            />
          </>
        )}
      </section>

      <Modal
        open={isModalOpen}
        title={editingItem ? "Chỉnh sửa lead" : "Thêm lead mới"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.modalGrid}>
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
            <select
              style={styles.select}
              value={form.interestedProjectId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  interestedProjectId: e.target.value,
                }))
              }
            >
              <option value="">Chọn dự án quan tâm</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              style={styles.select}
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as LeadStatus,
                }))
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Ghi chú"
            value={form.note}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, note: e.target.value }))
            }
          />

          <div style={styles.modalActions}>
            <button type="button" style={styles.secondaryBtn} onClick={closeModal}>
              Hủy
            </button>
            <button type="submit" style={styles.primaryBtn}>
              {editingItem ? "Lưu thay đổi" : "Tạo lead"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: 20,
  },
  headerWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 800,
    color: "#111827",
  },
  sub: {
    marginTop: 6,
    color: "#4b5563",
    fontSize: 18,
  },
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
  tabRow: {
    display: "flex",
    gap: 0,
    overflow: "hidden",
    borderRadius: 18,
    width: "fit-content",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  tabBlue: {
    background: "#ffffff",
    color: "#2388ff",
    padding: "16px 24px",
    fontWeight: 700,
    border: "1px solid #e5e7eb",
  },
  tabPink: {
    background: "#f8a3c4",
    color: "#1f2937",
    padding: "16px 24px",
    fontWeight: 700,
  },
  tabGreen: {
    background: "#10f09b",
    color: "#064e3b",
    padding: "16px 24px",
    fontWeight: 700,
  },
  filterCard: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 18,
    fontWeight: 800,
  },
  filterRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr auto",
    gap: 12,
    alignItems: "center",
  },
  assignRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1.2fr 1.5fr auto",
    gap: 12,
    alignItems: "center",
  },
  tableCard: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
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
  select: {
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    textAlign: "left",
    padding: "16px 14px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  tr: {
    background: "#fff",
  },
  td: {
    padding: "16px 14px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
    verticalAlign: "middle",
  },
  nameCell: {
    display: "grid",
    gap: 4,
  },
  nameTitle: {
    fontWeight: 800,
    color: "#111827",
  },
  nameSub: {
    color: "#6b7280",
    fontSize: 12,
  },
  subLine: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
  },
  actionCol: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  smallSelect: {
    height: 36,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    padding: "0 10px",
    background: "#fff",
  },
  textBtn: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 700,
  },
  textBtnDanger: {
    border: "none",
    background: "transparent",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 700,
  },
  modalForm: {
    display: "grid",
    gap: 14,
  },
  modalGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
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
    padding: 28,
    color: "#6b7280",
  },
};