import { useEffect, useMemo, useState } from "react";
import type { FormEvent, CSSProperties } from "react";
import { createStaffApi, getUsersApi } from "./users.api";
import type { UserItem, UserStatus, UserType } from "./users.api";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";

const roleOptions = [
  { label: "Sale", value: "seller" },
  { label: "Admin", value: "admin" },
];

const userTypeOptions: UserType[] = ["customer", "staff"];
const statusOptions: UserStatus[] = ["active", "inactive", "blocked"];

const emptyForm = {
  email: "",
  phone: "",
  password: "",
  roleCode: "seller",
};

export default function UsersPage() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [keywordFilter, setKeywordFilter] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  async function loadUsers(targetPage = page) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getUsersApi({
        keyword: keywordFilter || undefined,
        userType: (userTypeFilter || undefined) as UserType | undefined,
        status: (statusFilter || undefined) as UserStatus | undefined,
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
          : apiMessage || "Không tải được danh sách user"
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(1);
  }, []);

  function openCreateModal() {
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function closeModal() {
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  async function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    await loadUsers(1);
  }

  async function handleCreateStaff(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await createStaffApi({
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        roleCode: form.roleCode,
      });

      closeModal();
      await loadUsers(page);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      setErrorMessage(
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.join(", ")
          : apiMessage || "Tạo staff thất bại"
      );
    }
  }

  const totalUsers = useMemo(() => pagination.totalItems, [pagination.totalItems]);
  const totalStaff = useMemo(
    () => items.filter((x) => x.userType === "staff").length,
    [items]
  );
  const totalCustomers = useMemo(
    () => items.filter((x) => x.userType === "customer").length,
    [items]
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerWrap}>
        <div>
          <h1 style={styles.title}>Danh sách người dùng</h1>
          <div style={styles.sub}>
            Tìm thấy: <strong>{totalUsers}</strong> người dùng
          </div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.secondaryBtn} onClick={() => loadUsers(page)}>
            Làm mới
          </button>
          <button style={styles.primaryBtn} onClick={openCreateModal}>
            Tạo staff mới
          </button>
        </div>
      </div>

      <div style={styles.tabRow}>
        <div style={styles.tabBlue}>Tất cả ({totalUsers})</div>
        <div style={styles.tabPink}>Staff ({totalStaff})</div>
        <div style={styles.tabGreen}>Customers ({totalCustomers})</div>
      </div>

      <section style={styles.filterCard}>
        <form onSubmit={handleFilterSubmit} style={styles.filterRow}>
          <input
            style={styles.input}
            placeholder="Email, số điện thoại, tên khách hàng..."
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
          />

          <select
            style={styles.select}
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
          >
            <option value="">Tất cả loại user</option>
            {userTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((item) => (
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

      <section style={styles.tableCard}>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : (
          <>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Người dùng</th>
                    <th style={styles.th}>Liên hệ</th>
                    <th style={styles.th}>Loại</th>
                    <th style={styles.th}>Vai trò</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Đăng nhập gần nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          <div style={styles.nameTitle}>
                            {item.customerProfile?.fullName ||
                              item.email ||
                              item.phone ||
                              item.id}
                          </div>
                          <div style={styles.nameSub}>
                            {item.customerProfile?.province ||
                              item.customerProfile?.source ||
                              "-"}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div>{item.email || "-"}</div>
                        <div style={styles.subLine}>{item.phone || "-"}</div>
                      </td>
                      <td style={styles.td}>{item.userType}</td>
                      <td style={styles.td}>
                        <div style={styles.roleWrap}>
                          {item.roles.length > 0 ? (
                            item.roles.map((role) => (
                              <span key={role.id} style={styles.roleBadge}>
                                {role.code}
                              </span>
                            ))
                          ) : (
                            <span style={styles.subLine}>-</span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <StatusBadge value={item.status} />
                      </td>
                      <td style={styles.td}>
                        {item.lastLoginAt
                          ? new Date(item.lastLoginAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={styles.empty}>
                        Chưa có dữ liệu người dùng
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
              onChangePage={(nextPage) => loadUsers(nextPage)}
            />
          </>
        )}
      </section>

      <Modal open={isModalOpen} title="Tạo staff mới" onClose={closeModal}>
        <form onSubmit={handleCreateStaff} style={styles.modalForm}>
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
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
          />

          <select
            style={styles.select}
            value={form.roleCode}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, roleCode: e.target.value }))
            }
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <div style={styles.modalActions}>
            <button type="button" style={styles.secondaryBtn} onClick={closeModal}>
              Hủy
            </button>
            <button type="submit" style={styles.primaryBtn}>
              Tạo staff
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
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
  roleWrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  roleBadge: {
    background: "#e0f2fe",
    color: "#075985",
    border: "1px solid #bae6fd",
    padding: "5px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  modalForm: {
    display: "grid",
    gap: 14,
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