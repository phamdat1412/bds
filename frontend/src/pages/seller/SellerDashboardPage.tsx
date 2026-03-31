import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../features/auth/auth.store";
import { getLeadsApi, type LeadItem } from "../../features/leads/leads.api";
import { getProjectsApi, type ProjectItem } from "../../features/projects/projects.api";
import {
  getPropertiesApi,
  type PropertyItem,
} from "../../features/properties/properties.api";

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
      {subtitle ? <div style={styles.statSubtitle}>{subtitle}</div> : null}
    </div>
  );
}

export default function SellerDashboardPage() {
  const { user } = useAuthStore();

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [leadsRes, projectsRes, propertiesRes] = await Promise.all([
        getLeadsApi({ page: 1, pageSize: 100 }),
        getProjectsApi({ page: 1, pageSize: 100 }),
        getPropertiesApi({ page: 1, pageSize: 100 }),
      ]);

      setLeads(leadsRes.data?.items || []);
      setProjects(projectsRes.data?.items || []);
      setProperties(propertiesRes.data?.items || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được seller dashboard"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const newLeads = useMemo(
    () => leads.filter((item) => item.status === "new").length,
    [leads]
  );

  const qualifiedLeads = useMemo(
    () => leads.filter((item) => item.status === "qualified").length,
    [leads]
  );

  const convertedLeads = useMemo(
    () => leads.filter((item) => item.status === "converted").length,
    [leads]
  );

  const availableProperties = useMemo(
    () => properties.filter((item) => item.inventoryStatus === "available").length,
    [properties]
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Seller Dashboard</h1>
          <div style={styles.sub}>
            Xin chào {user?.email || "Seller"}, đây là khu làm việc của bạn
          </div>
        </div>
      </div>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      {isLoading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <>
          <section style={styles.grid4}>
            <StatCard
              title="Tổng leads"
              value={leads.length}
              subtitle="Lead đang có trong hệ thống"
            />
            <StatCard
              title="Lead mới"
              value={newLeads}
              subtitle="Cần xử lý sớm"
            />
            <StatCard
              title="Lead qualified"
              value={qualifiedLeads}
              subtitle="Lead đủ điều kiện"
            />
            <StatCard
              title="Lead converted"
              value={convertedLeads}
              subtitle="Lead đã chuyển đổi"
            />
          </section>

          <section style={styles.grid3}>
            <StatCard
              title="Dự án"
              value={projects.length}
              subtitle="Số dự án đang xem được"
            />
            <StatCard
              title="Sản phẩm"
              value={properties.length}
              subtitle="Tổng sản phẩm đang xem được"
            />
            <StatCard
              title="Available"
              value={availableProperties}
              subtitle="Sản phẩm còn hàng"
            />
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>5 leads mới nhất</div>
            <div style={styles.list}>
              {leads.slice(0, 5).map((item) => (
                <div key={item.id} style={styles.listItem}>
                  <div style={styles.itemTitle}>{item.fullName}</div>
                  <div style={styles.itemSub}>
                    {item.phone} · {item.status}
                  </div>
                </div>
              ))}
              {leads.length === 0 ? (
                <div style={styles.empty}>Chưa có lead</div>
              ) : null}
            </div>
          </section>
        </>
      )}
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
    alignItems: "center",
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
  statSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
  },
  section: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 14,
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
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
  },
  empty: {
    color: "#6b7280",
  },
};