import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  deleteMediaApi,
  getMediaApi,
  uploadMediaApi,
} from "./media.api";
import type { MediaItem } from "./media.api";

function formatBytes(value: string | number) {
  const bytes = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [keywordFilter, setKeywordFilter] = useState("");
  const [mimeTypeFilter, setMimeTypeFilter] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function loadMedia() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getMediaApi({
        keyword: keywordFilter || undefined,
        mimeType: mimeTypeFilter || undefined,
      });

      setItems(result.data || []);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được thư viện media"
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  async function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    await loadMedia();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  async function handleUpload(event: FormEvent) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Vui lòng chọn file trước khi upload");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await uploadMediaApi(selectedFile);
      setSelectedFile(null);
      setSuccessMessage("Upload file thành công");
      await loadMedia();

      const fileInput = document.getElementById("media-file-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Upload file thất bại");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteMedia(item: MediaItem) {
    const confirmed = window.confirm(
      `Xóa file "${item.originalName}"?`
    );
    if (!confirmed) return;

    try {
      await deleteMediaApi(item.id);
      await loadMedia();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Xóa media thất bại");
    }
  }

  const totalItems = useMemo(() => items.length, [items]);
  const imageCount = useMemo(
    () => items.filter((item) => isImage(item.mimeType)).length,
    [items]
  );
  const otherCount = useMemo(
    () => items.filter((item) => !isImage(item.mimeType)).length,
    [items]
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerWrap}>
        <div>
          <h1 style={styles.title}>Thư viện media</h1>
          <div style={styles.sub}>
            Tổng file: <strong>{totalItems}</strong>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.secondaryBtn} onClick={() => loadMedia()}>
            Làm mới
          </button>
        </div>
      </div>

      <div style={styles.tabRow}>
        <div style={styles.tabBlue}>Tất cả ({totalItems})</div>
        <div style={styles.tabPink}>Ảnh ({imageCount})</div>
        <div style={styles.tabGreen}>Khác ({otherCount})</div>
      </div>

      <section style={styles.uploadCard}>
        <div style={styles.sectionTitle}>Upload file</div>
        <form onSubmit={handleUpload} style={styles.uploadRow}>
          <input
            id="media-file-input"
            type="file"
            onChange={handleFileChange}
            style={styles.fileInput}
          />

          <button style={styles.primaryBtn} type="submit" disabled={isUploading}>
            {isUploading ? "Đang upload..." : "Upload"}
          </button>
        </form>

        {selectedFile ? (
          <div style={styles.selectedInfo}>
            Đã chọn: <strong>{selectedFile.name}</strong> ({formatBytes(selectedFile.size)})
          </div>
        ) : null}
      </section>

      <section style={styles.filterCard}>
        <form onSubmit={handleFilterSubmit} style={styles.filterRow}>
          <input
            style={styles.input}
            placeholder="Tên file, path..."
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="mime type, ví dụ image/"
            value={mimeTypeFilter}
            onChange={(e) => setMimeTypeFilter(e.target.value)}
          />

          <button style={styles.primaryBtn} type="submit">
            Lọc
          </button>
        </form>
      </section>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}
      {successMessage ? <div style={styles.success}>{successMessage}</div> : null}

      <section style={styles.grid}>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : items.length === 0 ? (
          <div style={styles.empty}>Chưa có file nào</div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.previewWrap}>
                {isImage(item.mimeType) ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    style={styles.previewImage}
                  />
                ) : (
                  <div style={styles.fileBox}>FILE</div>
                )}
              </div>

              <div style={styles.cardBody}>
                <div style={styles.fileName} title={item.originalName}>
                  {item.originalName}
                </div>

                <div style={styles.meta}>{item.mimeType}</div>
                <div style={styles.meta}>{formatBytes(item.sizeBytes)}</div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  Mở file
                </a>

                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDeleteMedia(item)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
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
  uploadCard: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 14,
  },
  uploadRow: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  fileInput: {
    flex: 1,
    minWidth: 260,
  },
  selectedInfo: {
    marginTop: 12,
    color: "#4b5563",
    fontSize: 14,
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
    gridTemplateColumns: "2fr 1.5fr auto",
    gap: 12,
    alignItems: "center",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  previewWrap: {
    height: 180,
    background: "#f9fafb",
    display: "grid",
    placeItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fileBox: {
    fontSize: 28,
    fontWeight: 800,
    color: "#6b7280",
  },
  cardBody: {
    padding: 16,
    display: "grid",
    gap: 8,
  },
  fileName: {
    fontWeight: 800,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    color: "#6b7280",
    fontSize: 13,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },
  deleteBtn: {
    height: 40,
    border: "none",
    borderRadius: 10,
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: 700,
    cursor: "pointer",
  },
  empty: {
    color: "#6b7280",
    padding: 20,
  },
};