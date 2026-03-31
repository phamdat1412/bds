import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { getMediaApi } from "../../features/media/media.api";
import type { MediaItem } from "../../features/media/media.api";

type MediaPickerModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
};

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export default function MediaPickerModal({
  open,
  title = "Chọn media",
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadMedia() {
    setIsLoading(true);
    try {
      const result = await getMediaApi({
        keyword: keyword || undefined,
      });
      setItems(result.data || []);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open]);

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div style={styles.wrap}>
        <div style={styles.toolbar}>
          <input
            style={styles.input}
            placeholder="Tìm media..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button style={styles.button} onClick={loadMedia}>
            Tìm
          </button>
        </div>

        {isLoading ? (
          <div>Đang tải media...</div>
        ) : (
          <div style={styles.grid}>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                style={styles.card}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <div style={styles.previewWrap}>
                  {isImage(item.mimeType) ? (
                    <img
                      src={item.url}
                      alt={item.originalName}
                      style={styles.image}
                    />
                  ) : (
                    <div style={styles.fileBox}>FILE</div>
                  )}
                </div>

                <div style={styles.name}>{item.originalName}</div>
              </button>
            ))}

            {items.length === 0 ? <div>Không có media</div> : null}
          </div>
        )}
      </div>
    </Modal>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "grid",
    gap: 16,
  },
  toolbar: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
  },
  input: {
    height: 44,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
  },
  button: {
    height: 44,
    border: "none",
    borderRadius: 12,
    background: "#2388ff",
    color: "#fff",
    padding: "0 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 12,
    maxHeight: "55vh",
    overflow: "auto",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    background: "#fff",
    padding: 8,
    cursor: "pointer",
    textAlign: "left",
  },
  previewWrap: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    background: "#f9fafb",
    display: "grid",
    placeItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fileBox: {
    fontWeight: 800,
    color: "#6b7280",
  },
  name: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};