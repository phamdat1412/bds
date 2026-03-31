type StatCardProps = {
  title: string;
  value: string | number;
};

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  title: {
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 12,
  },
  value: {
    fontSize: 36,
    fontWeight: 800,
    color: "#111827",
  },
};