import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getMyCustomerProfileApi,
  updateMyCustomerProfileApi,
} from "../../features/users/users.api";

export default function UserProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadProfile() {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await getMyCustomerProfileApi();
      const data = result.data;

      setFullName(data.customerProfile?.fullName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được hồ sơ khách hàng"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateMyCustomerProfileApi({
        fullName,
        email,
        phone,
      });

      setSuccessMessage("Cập nhật hồ sơ thành công");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Cập nhật hồ sơ thất bại"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <div>
        <h1 style={styles.title}>Hồ sơ khách hàng</h1>
        <div style={styles.sub}>
          Cập nhật thông tin cá nhân để nhận tư vấn phù hợp hơn
        </div>
      </div>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}
      {successMessage ? <div style={styles.success}>{successMessage}</div> : null}

      <div style={styles.card}>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Họ tên</label>
                <input
                  style={styles.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ tên"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Số điện thoại</label>
                <input
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div style={styles.actions}>
              <button type="submit" style={styles.primaryBtn} disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: 20,
  },
  title: {
    margin: 0,
    fontSize: 34,
    fontWeight: 800,
    color: "#111827",
  },
  sub: {
    marginTop: 6,
    color: "#6b7280",
    fontSize: 15,
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  form: {
    display: "grid",
    gap: 20,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
  },
  input: {
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
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
};