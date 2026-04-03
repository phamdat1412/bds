// path: frontend/src/features/properties/PropertyDetailPage.tsx
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPublicPropertyDetailApi,
  type PropertyDetailItem,
} from "./properties.api";
import { formatMoneyShort } from "../../utils/formatMoneyShort";
import { useCart } from "../../features/cart/cart.store";

export default function PropertyDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState<PropertyDetailItem | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDetail() {
    if (!id) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getPublicPropertyDetailApi(id);
      setItem(result.data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Không tải được chi tiết sản phẩm"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  useEffect(() => {
    if (item?.images?.length) {
      const primary =
        item.images.find((img) => img.isPrimary) || item.images[0];
      setActiveImageUrl(primary.url);
    } else {
      setActiveImageUrl("");
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;

    addItem({
      id: item.id,
      code: item.code,
      title: item.title,
      price: item.price,
      projectSlug: item.project.slug,
      thumbnailUrl: activeImageUrl || null,
    });

    alert(`Đã lưu căn ${item.code} vào danh sách quan tâm!`);
  };

  const summaryRows = useMemo(() => {
    if (!item) return [];

    return [
      { label: "Mã căn", value: item.code },
      { label: "Tên sản phẩm", value: item.title },
      { label: "Loại hình", value: item.propertyType },
      { label: "Dự án", value: item.project.name },
      { label: "Block", value: item.blockName || "-" },
      { label: "Tầng", value: item.floorNo ?? "-" },
      { label: "Phòng ngủ", value: item.bedroomCount ?? "-" },
      { label: "Phòng tắm", value: item.bathroomCount ?? "-" },
      {
        label: "Diện tích gross",
        value: item.areaGross ? `${item.areaGross} m²` : "-",
      },
      {
        label: "Diện tích net",
        value: item.areaNet ? `${item.areaNet} m²` : "-",
      },
      {
        label: "Giá bán",
        value: item.price ? formatMoneyShort(item.price) : "Liên hệ",
      },
      { label: "Hướng", value: item.orientation || "-" },
      { label: "Pháp lý", value: item.legalStatus || "-" },
      { label: "Trạng thái", value: item.inventoryStatus },
    ];
  }, [item]);

  if (isLoading) return <div style={styles.loading}>Đang tải chi tiết...</div>;
  if (errorMessage) return <div style={styles.error}>{errorMessage}</div>;
  if (!item) return <div style={styles.empty}>Không tìm thấy dữ liệu</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Quay lại
        </button>

        <button onClick={handleSave} style={styles.saveBtn}>
          ❤️ Lưu quan tâm
        </button>
      </div>

      <section style={styles.hero}>
        <div style={styles.heroGrid}>
          <div style={styles.galleryCol}>
            {activeImageUrl ? (
              <img src={activeImageUrl} alt={item.title} style={styles.mainImage} />
            ) : (
              <div style={styles.mainPlaceholder}>NO IMAGE</div>
            )}

            {item.images.length > 0 ? (
              <div style={styles.thumbRow}>
                {item.images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    style={{
                      ...styles.thumbBtn,
                      border:
                        activeImageUrl === image.url
                          ? "2px solid #cf2027"
                          : "1px solid #ddd",
                    }}
                    onClick={() => setActiveImageUrl(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.originalName || item.title}
                      style={styles.thumbImage}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div style={styles.summaryCol}>
            <div style={styles.projectName}>{item.project.name}</div>
            <div style={styles.cardTitle}>{item.title}</div>

            <div style={styles.infoGrid}>
              {summaryRows.map((row) => (
                <div key={row.label} style={styles.infoItem}>
                  <div style={styles.infoLabel}>{row.label}</div>
                  <div style={styles.infoValue}>{row.value}</div>
                </div>
              ))}
            </div>

            <div style={styles.noteBox}>
              <strong>Mô tả sản phẩm:</strong>
              <div style={styles.noteValue}>
                {item.description || "Đang cập nhật..."}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "40px 20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  backBtn: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  saveBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    background: "#cf2027",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  hero: {
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    border: "1px solid #eee",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 32,
  },
  galleryCol: {
    display: "grid",
    gap: 12,
  },
  mainImage: {
    width: "100%",
    height: 450,
    objectFit: "cover",
    borderRadius: 16,
  },
  mainPlaceholder: {
    width: "100%",
    height: 450,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    borderRadius: 16,
    color: "#999",
  },
  thumbRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  thumbBtn: {
    width: 80,
    height: 60,
    padding: 0,
    borderRadius: 8,
    overflow: "hidden",
    cursor: "pointer",
    background: "none",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  summaryCol: {
    display: "grid",
    alignContent: "start",
    gap: 20,
  },
  projectName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#cf2027",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111",
    marginTop: -8,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  infoItem: {
    padding: "14px",
    background: "#f9fafb",
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: 600,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111",
  },
  noteBox: {
    marginTop: 10,
    padding: 20,
    background: "#f9fafb",
    borderRadius: 12,
  },
  noteValue: {
    marginTop: 8,
    lineHeight: 1.6,
    color: "#444",
  },
  loading: {
    padding: 100,
    textAlign: "center",
    fontSize: 18,
    color: "#666",
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    padding: 20,
    borderRadius: 12,
    textAlign: "center",
  },
  empty: {
    padding: 100,
    textAlign: "center",
    fontSize: 18,
    color: "#666",
  },
};