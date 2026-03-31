type StatusBadgeProps = {
  value: string;
};

const colorMap: Record<string, React.CSSProperties> = {
  published: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
  },
  draft: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fde68a",
  },
  hidden: {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
  },
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        minWidth: 84,
        ...colorMap[value],
      }}
    >
      {value}
    </span>
  );
}