import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLeadDetailApi, type LeadDetailItem } from "./leads.api";
import LeadActivitiesPanel from "./LeadActivitiesPanel";

export default function LeadDetailPage() {
  const { id = "" } = useParams();
  const [item, setItem] = useState<LeadDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDetail() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getLeadDetailApi(id);
      setItem(result.data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được chi tiết lead"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (isLoading) {
    return <div>Đang tải chi tiết lead...</div>;
  }

  if (errorMessage) {
    return <div style={styles.error}>{errorMessage}</div>;
  }

  if (!item) {
    return <div>Không có dữ liệu</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{item.fullName}</h1>
          <div style={styles.sub}>
            {item.phone} {item.email ? `· ${item.email}` : ""}
          </div>
        </div>

        <Link to="/seller/leads" style={styles.backBtn}>
          Quay lại danh sách
        </Link>
      </div>

      <section style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Thông tin lead</div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Họ tên</div>
              <div style={styles.infoValue}>{item.fullName}</div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Điện thoại</div>
              <div style={styles.infoValue}>{item.phone}</div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Email</div>
              <div style={styles.infoValue}>{item.email || "-"}</div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Trạng thái</div>
              <div style={styles.infoValue}>{item.status}</div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Nguồn</div>
              <div style={styles.infoValue}>{item.source || "-"}</div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Kênh</div>
              <div style={styles.infoValue}>{item.channel || "-"}</div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Dự án quan tâm</div>
              <div style={styles.infoValue}>
                {item.interestedProject ? item.interestedProject.name : "-"}
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Người tạo</div>
              <div style={styles.infoValue}>
                {item.createdByUser?.email || item.createdByUser?.phone || "-"}
              </div>
            </div>
          </div>

          <div style={styles.noteBox}>
            <div style={styles.infoLabel}>Ghi chú</div>
            <div style={styles.noteValue}>{item.note || "Chưa có ghi chú"}</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Lịch sử gán lead</div>

          <div style={styles.timeline}>
            {item.assignments.map((assignment) => (
              <div key={assignment.id} style={styles.timelineItem}>
                <div style={styles.timelineDot} />
                <div>
                  <div style={styles.timelineTitle}>
                    {assignment.assignedToUser.email ||
                      assignment.assignedToUser.phone ||
                      "User"}
                  </div>
                  <div style={styles.timelineMeta}>
                    {new Date(assignment.assignedAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
            ))}

            {item.assignments.length === 0 ? (
              <div style={styles.empty}>Chưa có lịch sử gán lead</div>
            ) : null}
          </div>
        </div>
      </section>

      <section style={styles.card}>
        <LeadActivitiesPanel leadId={item.id} />
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>Lịch sử hoạt động gần đây</div>

        <div style={styles.timeline}>
          {item.activities.map((activity) => (
            <div key={activity.id} style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              <div style={styles.timelineContent}>
                <div style={styles.timelineTitle}>
                  {activity.activityType.toUpperCase()}
                </div>
                <div style={styles.timelineMeta}>
                  {new Date(activity.createdAt).toLocaleString("vi-VN")} ·{" "}
                  {activity.createdByUser.email ||
                    activity.createdByUser.phone ||
                    "User"}
                </div>
                <div style={styles.timelineNote}>
                  {activity.note || "Không có ghi chú"}
                </div>
              </div>
            </div>
          ))}

          {item.activities.length === 0 ? (
            <div style={styles.empty}>Chưa có hoạt động nào</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "grid",
    gap: 20,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    color: "#6b7280",
    fontSize: 15,
  },
  backBtn: {
    textDecoration: "none",
    background: "#fff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 700,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 16,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  infoItem: {
    display: "grid",
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: 600,
  },
  noteBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1px solid #f3f4f6",
    display: "grid",
    gap: 6,
  },
  noteValue: {
    fontSize: 15,
    lineHeight: 1.6,
    color: "#374151",
    whiteSpace: "pre-wrap",
  },
  timeline: {
    display: "grid",
    gap: 14,
  },
  timelineItem: {
    display: "grid",
    gridTemplateColumns: "12px 1fr",
    gap: 12,
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    background: "#2388ff",
    marginTop: 5,
  },
  timelineContent: {
    display: "grid",
    gap: 4,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
  },
  timelineMeta: {
    fontSize: 12,
    color: "#6b7280",
  },
  timelineNote: {
    marginTop: 2,
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
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
    padding: 8,
  },
};