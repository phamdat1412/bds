import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  createPropertyApi,
  deletePropertyApi,
  getPropertiesApi,
  updateInventoryStatusApi,
  updatePropertyApi,
} from "./properties.api";
import type {
  InventoryStatus,
  PropertyItem,
  PropertyType,
} from "./properties.api";
import api from "../../services/api";
import { formatMoneyShort } from "../../utils/formatMoneyShort";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

type ProjectOption = {
  id: string;
  name: string;
};

const propertyTypeOptions: PropertyType[] = [
  "apartment",
  "shophouse",
  "townhouse",
  "villa",
  "land",
];

const inventoryOptions: InventoryStatus[] = [
  "available",
  "reserved",
  "sold",
  "hidden",
];

const emptyForm = {
  projectId: "",
  code: "",
  title: "",
  propertyType: "apartment" as PropertyType,
  blockName: "",
  floorNo: "",
  bedroomCount: "",
  bathroomCount: "",
  areaGross: "",
  areaNet: "",
  price: "",
  currency: "VND",
  inventoryStatus: "available" as InventoryStatus,
  orientation: "",
  legalStatus: "",
  description: "",
};

export default function PropertiesPage() {
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [projectFilter, setProjectFilter] = useState("");
  const [keywordFilter, setKeywordFilter] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PropertyItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  async function loadProjects() {
    try {
      const res = await api.get("/projects", {
        params: { page: 1, pageSize: 100 },
      });
      const data = res.data?.data?.items || [];
      setProjects(
        data.map((item: any) => ({
          id: item.id,
          name: item.name,
        }))
      );
    } catch {
      // bỏ qua
    }
  }

  async function loadProperties(targetPage = page) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getPropertiesApi({
        projectId: projectFilter || undefined,
        keyword: keywordFilter || undefined,
        propertyType: (propertyTypeFilter || undefined) as PropertyType | undefined,
        inventoryStatus: (inventoryFilter || undefined) as InventoryStatus | undefined,
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
          : apiMessage || "Không tải được danh sách sản phẩm"
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
    loadProperties(1);
  }, []);

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setIsModalOpen(true);
    setSuccessMessage("");
  }

  function openEditModal(item: PropertyItem) {
    setEditingItem(item);
    setForm({
      projectId: item.project.id,
      code: item.code,
      title: item.title,
      propertyType: item.propertyType,
      blockName: item.blockName || "",
      floorNo: item.floorNo?.toString() || "",
      bedroomCount: item.bedroomCount?.toString() || "",
      bathroomCount: item.bathroomCount?.toString() || "",
      areaGross: item.areaGross || "",
      areaNet: item.areaNet || "",
      price: item.price || "",
      currency: item.currency || "VND",
      inventoryStatus: item.inventoryStatus,
      orientation: item.orientation || "",
      legalStatus: item.legalStatus || "",
      description: "",
    });
    setIsModalOpen(true);
    setSuccessMessage("");
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    await loadProperties(1);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        projectId: form.projectId,
        code: form.code,
        title: form.title,
        propertyType: form.propertyType,
        blockName: form.blockName || undefined,
        floorNo: form.floorNo ? Number(form.floorNo) : undefined,
        bedroomCount: form.bedroomCount ? Number(form.bedroomCount) : undefined,
        bathroomCount: form.bathroomCount ? Number(form.bathroomCount) : undefined,
        areaGross: form.areaGross ? Number(form.areaGross) : undefined,
        areaNet: form.areaNet ? Number(form.areaNet) : undefined,
        price: form.price ? Number(form.price) : undefined,
        currency: form.currency || undefined,
        inventoryStatus: form.inventoryStatus,
        orientation: form.orientation || undefined,
        legalStatus: form.legalStatus || undefined,
        description: form.description || undefined,
      };

      if (editingItem) {
        await updatePropertyApi(editingItem.id, payload);
        closeModal();
        setSuccessMessage("Cập nhật sản phẩm thành công");
        await loadProperties(page);
      } else {
        await createPropertyApi(
          payload as {
            projectId: string;
            code: string;
            title: string;
            propertyType: PropertyType;
            blockName?: string;
            floorNo?: number;
            bedroomCount?: number;
            bathroomCount?: number;
            areaGross?: number;
            areaNet?: number;
            price?: number;
            currency?: string;
            inventoryStatus?: InventoryStatus;
            orientation?: string;
            legalStatus?: string;
            description?: string;
          }
        );

        closeModal();
        setPage(1);
        setSuccessMessage("Tạo sản phẩm thành công");
        await loadProperties(1);
      }
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      setErrorMessage(
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.join(", ")
          : apiMessage || "Lưu sản phẩm thất bại"
      );
    }
  }

  async function handleDeleteProperty(item: PropertyItem) {
    const confirmed = window.confirm(
      `Xóa sản phẩm "${item.code} - ${item.title}"?`
    );
    if (!confirmed) return;

    try {
      await deletePropertyApi(item.id);
      setSuccessMessage("Xóa sản phẩm thành công");
      await loadProperties(page);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Xóa sản phẩm thất bại"
      );
    }
  }

  async function handleQuickInventoryChange(
    propertyId: string,
    inventoryStatus: InventoryStatus
  ) {
    try {
      await updateInventoryStatusApi(propertyId, { inventoryStatus });
      setSuccessMessage("Cập nhật tồn kho thành công");
      await loadProperties(page);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Cập nhật tồn kho thất bại"
      );
    }
  }

  const totalItems = useMemo(() => pagination.totalItems, [pagination.totalItems]);
  const availableCount = useMemo(
    () => items.filter((x) => x.inventoryStatus === "available").length,
    [items]
  );
  const soldCount = useMemo(
    () => items.filter((x) => x.inventoryStatus === "sold").length,
    [items]
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerWrap}>
        <div>
          <h1 style={styles.title}>Danh sách sản phẩm</h1>
          <div style={styles.sub}>
            Tìm thấy: <strong>{totalItems}</strong> sản phẩm
          </div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.secondaryBtn} onClick={() => loadProperties(page)}>
            Làm mới
          </button>
          <button style={styles.primaryBtn} onClick={openCreateModal}>
            Thêm sản phẩm mới
          </button>
        </div>
      </div>

      <div style={styles.tabRow}>
        <div style={styles.tabBlue}>Tất cả ({totalItems})</div>
        <div style={styles.tabPink}>Available ({availableCount})</div>
        <div style={styles.tabGreen}>Sold ({soldCount})</div>
      </div>

      <section style={styles.filterCard}>
        <form onSubmit={handleFilterSubmit} style={styles.filterRow}>
          <select
            style={styles.select}
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">Tất cả dự án</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            placeholder="Mã căn / tên căn"
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
          />

          <select
            style={styles.select}
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
          >
            <option value="">Tất cả loại</option>
            {propertyTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={inventoryFilter}
            onChange={(e) => setInventoryFilter(e.target.value)}
          >
            <option value="">Tất cả tồn kho</option>
            {inventoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button style={styles.primaryBtn} type="submit">
            Lọc
          </button>
        </form>
      </section>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}
      {successMessage ? <div style={styles.success}>{successMessage}</div> : null}

      <section style={styles.tableCard}>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : (
          <>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Mã căn</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={styles.th}>Dự án</th>
                    <th style={styles.th}>Loại</th>
                    <th style={styles.th}>Block / Tầng</th>
                    <th style={styles.th}>Giá</th>
                    <th style={styles.th}>Tồn kho</th>
                    <th style={styles.th}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          <div style={styles.nameTitle}>{item.code}</div>
                          <div style={styles.nameSub}>{item.orientation || "-"}</div>
                        </div>
                      </td>
                      <td style={styles.td}>{item.title}</td>
                      <td style={styles.td}>{item.project.name}</td>
                      <td style={styles.td}>{item.propertyType}</td>
                      <td style={styles.td}>
                        {[item.blockName, item.floorNo].filter(Boolean).join(" / ") || "-"}
                      </td>
                      <td style={styles.td}>
                        {item.price ? formatMoneyShort(item.price) : "-"}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge value={item.inventoryStatus} />
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionCol}>
                          <select
                            style={styles.smallSelect}
                            value={item.inventoryStatus}
                            onChange={(e) =>
                              handleQuickInventoryChange(
                                item.id,
                                e.target.value as InventoryStatus
                              )
                            }
                          >
                            {inventoryOptions.map((status) => (
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
                            onClick={() => handleDeleteProperty(item)}
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
                        Chưa có dữ liệu sản phẩm
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
              onChangePage={(nextPage) => loadProperties(nextPage)}
            />
          </>
        )}
      </section>

      <Modal
        open={isModalOpen}
        title={editingItem ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} style={styles.modalForm}>
          <div style={styles.modalGrid}>
            <select
              style={styles.select}
              value={form.projectId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, projectId: e.target.value }))
              }
            >
              <option value="">Chọn dự án</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <input
              style={styles.input}
              placeholder="Mã căn"
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
              }
            />

            <input
              style={styles.input}
              placeholder="Tên sản phẩm"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <select
              style={styles.select}
              value={form.propertyType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  propertyType: e.target.value as PropertyType,
                }))
              }
            >
              {propertyTypeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              style={styles.input}
              placeholder="Block"
              value={form.blockName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, blockName: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="Tầng"
              value={form.floorNo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, floorNo: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="Số phòng ngủ"
              value={form.bedroomCount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bedroomCount: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="Số phòng tắm"
              value={form.bathroomCount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bathroomCount: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="DT Gross"
              value={form.areaGross}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, areaGross: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="DT Net"
              value={form.areaNet}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, areaNet: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="Giá bán"
              value={form.price}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, price: e.target.value }))
              }
            />

            <select
              style={styles.select}
              value={form.inventoryStatus}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  inventoryStatus: e.target.value as InventoryStatus,
                }))
              }
            >
              {inventoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              style={styles.input}
              placeholder="Hướng"
              value={form.orientation}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, orientation: e.target.value }))
              }
            />

            <input
              style={styles.input}
              placeholder="Pháp lý"
              value={form.legalStatus}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, legalStatus: e.target.value }))
              }
            />
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          <div style={styles.modalActions}>
            <button type="button" style={styles.secondaryBtn} onClick={closeModal}>
              Hủy
            </button>
            <button type="submit" style={styles.primaryBtn}>
              {editingItem ? "Lưu thay đổi" : "Tạo sản phẩm"}
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
  filterRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr auto",
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
  success: {
    color: "#166534",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    padding: 12,
    borderRadius: 12,
  },
  empty: {
    textAlign: "center",
    padding: 28,
    color: "#6b7280",
  },
};