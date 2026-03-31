import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  createProjectApi,
  deleteProjectApi,
  getProjectsApi,
  updateProjectApi,
} from "./projects.api";
import type { ProjectItem, ProjectStatus } from "./projects.api";
import type { MediaItem } from "../media/media.api";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import MediaPickerModal from "../../components/media/MediaPickerModal";

const statusOptions: ProjectStatus[] = ["draft", "published", "hidden"];

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const emptyForm = {
  name: "",
  slug: "",
  developerName: "",
  locationText: "",
  city: "",
  district: "",
  projectType: "",
  status: "draft" as ProjectStatus,
  shortDescription: "",
  description: "",
  thumbnailMediaId: "",
  thumbnailMediaUrl: "",
};

export default function ProjectsPage() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [keywordFilter, setKeywordFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  async function loadProjects(targetPage = page) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getProjectsApi({
        keyword: keywordFilter || undefined,
        status: (statusFilter || undefined) as ProjectStatus | undefined,
        city: cityFilter || undefined,
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
          : apiMessage || "Không tải được danh sách dự án"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects(1);
  }, []);

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setIsCreateOpen(true);
  }

  function openEditModal(item: ProjectItem) {
    setEditingItem(item);
    setForm({
      name: item.name,
      slug: item.slug,
      developerName: item.developerName || "",
      locationText: item.locationText || "",
      city: item.city || "",
      district: item.district || "",
      projectType: item.projectType || "",
      status: item.status,
      shortDescription: item.shortDescription || "",
      description: "",
      thumbnailMediaId: item.thumbnailMedia?.id || "",
      thumbnailMediaUrl: item.thumbnailMedia?.url || "",
    });
    setIsCreateOpen(true);
  }

  function closeModal() {
    setIsCreateOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    await loadProjects(1);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const payload = {
        name: form.name,
        slug: form.slug || makeSlug(form.name),
        developerName: form.developerName || undefined,
        locationText: form.locationText || undefined,
        city: form.city || undefined,
        district: form.district || undefined,
        projectType: form.projectType || undefined,
        status: form.status,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        thumbnailMediaId: form.thumbnailMediaId || undefined,
      };

      if (editingItem) {
        await updateProjectApi(editingItem.id, payload);
      } else {
        await createProjectApi(payload);
      }

      closeModal();
      await loadProjects(page);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      setErrorMessage(
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.join(", ")
          : apiMessage || "Lưu dự án thất bại"
      );
    }
  }

  async function handleDeleteProject(item: ProjectItem) {
    const confirmed = window.confirm(
      `Xóa dự án "${item.name}"? Thao tác này không thể hoàn tác.`
    );
    if (!confirmed) return;

    try {
      await deleteProjectApi(item.id);
      await loadProjects(page);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Xóa dự án thất bại"
      );
    }
  }

  async function handleQuickStatusChange(projectId: string, status: ProjectStatus) {
    try {
      await updateProjectApi(projectId, { status });
      await loadProjects(page);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    }
  }

  const totalProjects = useMemo(() => pagination.totalItems, [pagination.totalItems]);
  const publishedCount = useMemo(
    () => items.filter((x) => x.status === "published").length,
    [items]
  );
  const draftCount = useMemo(
    () => items.filter((x) => x.status === "draft").length,
    [items]
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerWrap}>
        <div>
          <h1 style={styles.title}>Danh sách dự án</h1>
          <div style={styles.sub}>
            Tìm thấy: <strong>{totalProjects}</strong> dự án
          </div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.secondaryBtn} onClick={() => loadProjects(page)}>
            Làm mới
          </button>
          <button style={styles.primaryBtn} onClick={openCreateModal}>
            Thêm dự án mới
          </button>
        </div>
      </div>

      <div style={styles.tabRow}>
        <div style={styles.tabBlue}>Tất cả ({totalProjects})</div>
        <div style={styles.tabPink}>Draft ({draftCount})</div>
        <div style={styles.tabGreen}>Published ({publishedCount})</div>
      </div>

      <section style={styles.filterCard}>
        <form onSubmit={handleFilterSubmit} style={styles.filterRow}>
          <input
            style={styles.input}
            placeholder="Tên dự án, slug, chủ đầu tư..."
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

          <input
            style={styles.input}
            placeholder="Tỉnh / thành"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />

          <button style={styles.primaryBtn} type="submit">
            Lọc
          </button>
        </form>
      </section>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      <section style={styles.tableCard}>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : (
          <>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tên dự án</th>
                    <th style={styles.th}>Slug</th>
                    <th style={styles.th}>Chủ đầu tư</th>
                    <th style={styles.th}>Địa điểm</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Products</th>
                    <th style={styles.th}>Leads</th>
                    <th style={styles.th}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.projectCell}>
                          {item.thumbnailMedia?.url ? (
                            <img
                              src={item.thumbnailMedia.url}
                              alt={item.name}
                              style={styles.projectThumb}
                            />
                          ) : (
                            <div style={styles.projectThumbEmpty}>IMG</div>
                          )}

                          <div style={styles.nameCell}>
                            <div style={styles.nameTitle}>{item.name}</div>
                            <div style={styles.nameSub}>
                              {item.shortDescription || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>{item.slug}</td>
                      <td style={styles.td}>{item.developerName || "-"}</td>
                      <td style={styles.td}>
                        {[item.district, item.city].filter(Boolean).join(", ") || "-"}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge value={item.status} />
                      </td>
                      <td style={styles.td}>{item.propertyCount}</td>
                      <td style={styles.td}>{item.leadCount}</td>
                      <td style={styles.td}>
                        <div style={styles.actionCol}>
                          <select
                            style={styles.smallSelect}
                            value={item.status}
                            onChange={(e) =>
                              handleQuickStatusChange(
                                item.id,
                                e.target.value as ProjectStatus
                              )
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
                            onClick={() => handleDeleteProject(item)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={styles.empty}>
                        Chưa có dữ liệu dự án
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
              onChangePage={(nextPage) => loadProjects(nextPage)}
            />
          </>
        )}
      </section>

      <Modal
        open={isCreateOpen}
        title={editingItem ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.modalGrid}>
            <input
              style={styles.input}
              placeholder="Tên dự án"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                  slug: prev.slug ? prev.slug : makeSlug(e.target.value),
                }))
              }
            />

            <input
              style={styles.input}
              placeholder="Slug"
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  slug: makeSlug(e.target.value),
                }))
              }
            />

            <input
              style={styles.input}
              placeholder="Chủ đầu tư"
              value={form.developerName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, developerName: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="Loại dự án"
              value={form.projectType}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, projectType: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="Tỉnh / thành"
              value={form.city}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, city: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="Quận / khu vực"
              value={form.district}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, district: e.target.value }))
              }
            />
          </div>

          <input
            style={styles.input}
            placeholder="Vị trí"
            value={form.locationText}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, locationText: e.target.value }))
            }
          />

          <select
            style={styles.select}
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value as ProjectStatus,
              }))
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="Mô tả ngắn"
            value={form.shortDescription}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                shortDescription: e.target.value,
              }))
            }
          />

          <textarea
            style={styles.textarea}
            placeholder="Mô tả chi tiết"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />

          <div style={styles.thumbnailBox}>
            <div style={styles.thumbnailLabel}>Thumbnail dự án</div>

            {form.thumbnailMediaUrl ? (
              <img
                src={form.thumbnailMediaUrl}
                alt="thumbnail"
                style={styles.thumbnailPreview}
              />
            ) : (
              <div style={styles.thumbnailEmpty}>Chưa chọn ảnh</div>
            )}

            <div style={styles.thumbnailActions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => setIsMediaPickerOpen(true)}
              >
                Chọn từ media
              </button>

              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    thumbnailMediaId: "",
                    thumbnailMediaUrl: "",
                  }))
                }
              >
                Bỏ ảnh
              </button>
            </div>
          </div>

          <div style={styles.modalActions}>
            <button type="button" style={styles.secondaryBtn} onClick={closeModal}>
              Hủy
            </button>
            <button type="submit" style={styles.primaryBtn}>
              {editingItem ? "Lưu thay đổi" : "Tạo dự án"}
            </button>
          </div>
        </form>
      </Modal>

      <MediaPickerModal
        open={isMediaPickerOpen}
        title="Chọn thumbnail dự án"
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(item: MediaItem) =>
          setForm((prev) => ({
            ...prev,
            thumbnailMediaId: item.id,
            thumbnailMediaUrl: item.url,
          }))
        }
      />
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
  filterRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr auto",
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
  projectCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  projectThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },
  projectThumbEmpty: {
    width: 54,
    height: 54,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 800,
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
  thumbnailBox: {
    display: "grid",
    gap: 12,
  },
  thumbnailLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  thumbnailPreview: {
    width: 180,
    height: 120,
    objectFit: "cover",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
  },
  thumbnailEmpty: {
    width: 180,
    height: 120,
    borderRadius: 16,
    border: "1px dashed #d1d5db",
    display: "grid",
    placeItems: "center",
    color: "#6b7280",
    background: "#f9fafb",
  },
  thumbnailActions: {
    display: "flex",
    gap: 12,
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