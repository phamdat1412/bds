type PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onChangePage: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  totalItems,
  onChangePage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div style={styles.wrap}>
      <div style={styles.info}>
        Tổng bản ghi: <strong>{totalItems}</strong>
      </div>

      <div style={styles.controls}>
        <button
          style={styles.button}
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          Trước
        </button>

        <div style={styles.pageText}>
          Trang <strong>{page}</strong> / {totalPages}
        </div>

        <button
          style={styles.button}
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  info: {
    color: "#4b5563",
    fontSize: 14,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  pageText: {
    fontSize: 14,
    color: "#111827",
  },
  button: {
    height: 36,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
};