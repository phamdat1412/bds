import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createLeadActivityApi,
  getLeadActivitiesApi,
  type LeadActivityItem,
} from "./leadActivities.api";

const activityOptions = ["call", "note", "meeting", "visit", "zalo", "email"] as const;

export default function LeadActivitiesPanel({
  leadId,
}: {
  leadId: string;
}) {
  const [items, setItems] = useState<LeadActivityItem[]>([]);
  const [activityType, setActivityType] =
    useState<(typeof activityOptions)[number]>("call");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadActivities() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getLeadActivitiesApi(leadId);
      setItems(result.data || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được lịch sử chăm sóc"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, [leadId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      await createLeadActivityApi(leadId, {
        activityType,
        note: note || undefined,
      });
      setNote("");
      setActivityType("call");
      await loadActivities();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không thể tạo hoạt động"
      );
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>Lịch sử chăm sóc</div>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      <form onSubmit={handleSubmit} style={styles.form}>
        <select
          style={styles.select}
          value={activityType}
          onChange={(e) =>
            setActivityType(e.target.value as (typeof activityOptions)[number])
          }
        >
          {activityOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          style={styles.input}
          placeholder="Ghi chú hoạt động"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button type="submit" style={styles.primaryBtn}>
          Thêm hoạt động
        </button>
      </form>

      {isLoading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div style={styles.list}>
          {items.map((item) => (
            <div key={item.id} style={styles.item}>
              <div style={styles.itemTop}>
                <span style={styles.badge}>{item.activityType}</span>
                <span style={styles.time}>
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>

              <div style={styles.note}>{item.note || "Không có ghi chú"}</div>

              <div style={styles.by}>
                {item.createdByUser.email || item.createdByUser.phone || "User"}
              </div>
            </div>
          ))}

          {items.length === 0 ? (
            <div style={styles.empty}>Chưa có hoạt động nào</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "grid",
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "180px 1fr auto",
    gap: 10,
  },
  select: {
    height: 42,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 12px",
  },
  input: {
    height: 42,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 12px",
  },
  primaryBtn: {
    height: 42,
    border: "none",
    borderRadius: 12,
    background: "#2388ff",
    color: "#fff",
    padding: "0 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: 10,
  },
  item: {
    background: "#f9fafb",
    borderRadius: 16,
    padding: 14,
    border: "1px solid #e5e7eb",
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  badge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
  },
  time: {
    fontSize: 12,
    color: "#6b7280",
  },
  note: {
    marginTop: 10,
    fontSize: 14,
    color: "#111827",
  },
  by: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
  },
  empty: {
    color: "#6b7280",
    padding: 10,
  },
};