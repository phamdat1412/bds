import { useEffect, useState } from "react";
import { getDashboardSummaryApi } from "./dashboard.api";
import type { DashboardSummary } from "./dashboard.api";
import { formatMoneyShort } from "../../utils/formatMoneyShort";

type StatCardProps = {
  title: string;
  value: string | number;
};

function StatCard({ title, value }: StatCardProps) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getDashboardSummaryApi();
      setData(result);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được dashboard"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return <div>Đang tải dashboard...</div>;
  }

  if (errorMessage) {
    return <div style={styles.error}>{errorMessage}</div>;
  }

  if (!data) {
    return <div>Không có dữ liệu</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerWrap}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <div style={styles.sub}>Tổng quan vận hành hệ thống</div>
        </div>

        <button style={styles.refreshBtn} onClick={loadDashboard}>
          Làm mới
        </button>
      </div>

      <section style={styles.grid5}>
        <StatCard title="Users" value={data.totals.users} />
        <StatCard title="Leads" value={data.totals.leads} />
        <StatCard title="Projects" value={data.totals.projects} />
        <StatCard title="Properties" value={data.totals.properties} />
        <StatCard title="Media" value={data.totals.media} />
      </section>

      <section style={styles.grid4}>
        <StatCard title="Lead mới" value={data.leads.new} />
        <StatCard title="Lead qualified" value={data.leads.qualified} />
        <StatCard title="Lead converted" value={data.leads.converted} />
        <StatCard title="Lead lost" value={data.leads.lost} />
      </section>

      <section style={styles.grid4}>
        <StatCard title="Property available" value={data.properties.available} />
        <StatCard title="Property reserved" value={data.properties.reserved} />
        <StatCard title="Property sold" value={data.properties.sold} />
        <StatCard title="Property hidden" value={data.properties.hidden} />
      </section>

      <section style={styles.grid3}>
        <div style={styles.panel}>
          <div style={styles.panelTitle}>5 Leads mới nhất</div>
          <div style={styles.list}>
            {data.latest.leads.map((item) => (
              <div key={item.id} style={styles.listItem}>
                <div style={styles.itemTitle}>{item.fullName}</div>
                <div style={styles.itemSub}>
                  {item.phone} · {item.status}
                </div>
              </div>
            ))}
            {data.latest.leads.length === 0 ? (
              <div style={styles.empty}>Chưa có lead</div>
            ) : null}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>5 Projects mới nhất</div>
          <div style={styles.list}>
            {data.latest.projects.map((item) => (
              <div key={item.id} style={styles.listItem}>
                <div style={styles.itemTitle}>{item.name}</div>
                <div style={styles.itemSub}>
                  {item.city || "-"} · {item.status}
                </div>
              </div>
            ))}
            {data.latest.projects.length === 0 ? (
              <div style={styles.empty}>Chưa có project</div>
            ) : null}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>5 Properties mới nhất</div>
          <div style={styles.list}>
            {data.latest.properties.map((item) => (
              <div key={item.id} style={styles.listItem}>
                <div style={styles.itemTitle}>
                  {item.code} - {item.title}
                </div>
                <div style={styles.itemSub}>
                  {item.price ? formatMoneyShort(item.price) : "-"} ·{" "}
                  {item.inventoryStatus}
                </div>
              </div>
            ))}
            {data.latest.properties.length === 0 ? (
              <div style={styles.empty}>Chưa có property</div>
            ) : null}
          </div>
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
    fontSize: 16,
  },
  refreshBtn: {
    height: 44,
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background: "#fff",
    color: "#111827",
    padding: "0 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  grid5: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 16,
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  statTitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 700,
  },
  statValue: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: 800,
    color: "#111827",
  },
  panel: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 14,
    color: "#111827",
  },
  list: {
    display: "grid",
    gap: 10,
  },
  listItem: {
    padding: 12,
    borderRadius: 14,
    background: "#f9fafb",
  },
  itemTitle: {
    fontWeight: 700,
    color: "#111827",
  },
  itemSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  empty: {
    color: "#6b7280",
    fontSize: 14,
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
  },
};