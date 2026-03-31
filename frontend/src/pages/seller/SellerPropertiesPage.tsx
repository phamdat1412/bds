import { useEffect, useState } from "react";
import {
  getPropertiesApi,
  type PropertyItem,
} from "../../features/properties/properties.api";
import { formatMoneyShort } from "../../utils/formatMoneyShort";

export default function SellerPropertiesPage() {
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProperties() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getPropertiesApi({ page: 1, pageSize: 100 });
      setItems(result.data?.items || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được properties"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <div style={styles.page}>
      <div>
        <h1 style={styles.title}>Properties</h1>
        <div style={styles.sub}>Danh sách sản phẩm seller có thể xem</div>
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
                  <th style={styles.th}>Mã căn</th>
                  <th style={styles.th}>Tên</th>
                  <th style={styles.th}>Dự án</th>
                  <th style={styles.th}>Loại</th>
                  <th style={styles.th}>Giá</th>
                  <th style={styles.th}>Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.code}</td>
                    <td style={styles.td}>{item.title}</td>
                    <td style={styles.td}>{item.project.name}</td>
                    <td style={styles.td}>{item.propertyType}</td>
                    <td style={styles.td}>
                      {item.price ? formatMoneyShort(item.price) : "-"}
                    </td>
                    <td style={styles.td}>{item.inventoryStatus}</td>
                  </tr>
                ))}

                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.empty}>
                      Chưa có sản phẩm
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
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