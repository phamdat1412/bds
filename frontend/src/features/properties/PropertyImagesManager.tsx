import { useEffect, useState } from "react";
import {
  addPropertyImageApi,
  deletePropertyImageApi,
  getPropertyImagesApi,
  updatePropertyImageApi,
} from "../property-images/propertyImages.api";
import type { PropertyImageItem } from "../property-images/propertyImages.api";
import MediaPickerModal from "../../components/media/MediaPickerModal";
import type { MediaItem } from "../media/media.api";

type PropertyImagesManagerProps = {
  propertyId: string;
};

export default function PropertyImagesManager({
  propertyId,
}: PropertyImagesManagerProps) {
  const [items, setItems] = useState<PropertyImageItem[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  async function loadImages() {
    const result = await getPropertyImagesApi(propertyId);
    setItems(result.data || []);
  }

  useEffect(() => {
    loadImages();
  }, [propertyId]);

  async function handleAddMedia(item: MediaItem) {
    await addPropertyImageApi(propertyId, {
      mediaFileId: item.id,
      isPrimary: items.length === 0,
      sortOrder: items.length,
    });
    await loadImages();
  }

  async function handleSetPrimary(imageId: string) {
    await updatePropertyImageApi(propertyId, imageId, {
      isPrimary: true,
    });
    await loadImages();
  }

  async function handleDelete(imageId: string) {
    await deletePropertyImageApi(propertyId, imageId);
    await loadImages();
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.title}>Ảnh sản phẩm</div>
        <button style={styles.button} onClick={() => setIsPickerOpen(true)}>
          Thêm ảnh từ media
        </button>
      </div>

      <div style={styles.grid}>
        {items.map((item) => (
          <div key={item.id} style={styles.card}>
            <img
              src={item.mediaFile.url}
              alt={item.mediaFile.originalName}
              style={styles.image}
            />

            <div style={styles.meta}>
              <div style={styles.fileName}>{item.mediaFile.originalName}</div>
              <div style={styles.badges}>
                {item.isPrimary ? (
                  <span style={styles.primaryBadge}>Ảnh chính</span>
                ) : null}
              </div>
            </div>

            <div style={styles.actions}>
              {!item.isPrimary ? (
                <button
                  style={styles.secondaryBtn}
                  onClick={() => handleSetPrimary(item.id)}
                >
                  Đặt ảnh chính
                </button>
              ) : null}

              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(item.id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 ? <div>Chưa có ảnh</div> : null}
      </div>

      <MediaPickerModal
        open={isPickerOpen}
        title="Chọn ảnh cho sản phẩm"
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleAddMedia}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "grid",
    gap: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
  },
  button: {
    height: 40,
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
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    background: "#fff",
  },
  image: {
    width: "100%",
    height: 160,
    objectFit: "cover",
  },
  meta: {
    padding: 12,
    display: "grid",
    gap: 8,
  },
  fileName: {
    fontSize: 13,
    fontWeight: 700,
  },
  badges: {
    display: "flex",
    gap: 8,
  },
  primaryBadge: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: 8,
    padding: 12,
  },
  secondaryBtn: {
    flex: 1,
    height: 36,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteBtn: {
    flex: 1,
    height: 36,
    border: "none",
    borderRadius: 10,
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 700,
  },
};