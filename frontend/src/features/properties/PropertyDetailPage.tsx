import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPropertyDetailApi, type PropertyDetailItem } from "./properties.api";
import { formatMoneyShort } from "../../utils/formatMoneyShort";

export default function PropertyDetailPage() {
  const { id = "" } = useParams();
  const [item, setItem] = useState<PropertyDetailItem | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDetail() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getPropertyDetailApi(id);
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

  const summaryRows = useMemo(() => {
    if (!item) return [];
    return [
      { label: "Mã căn", value: item.code },
      { label: "Tên sản phẩm", value: item.title },
      { label: "Loại", value: item.propertyType },
      { label: "Dự án", value: item.project.name },
      { label: "Block", value: item.blockName || "-" },
      { label: "Tầng", value: item.floorNo ?? "-" },
      { label: "Phòng ngủ", value: item.bedroomCount ?? "-" },
      { label: "Phòng tắm", value: item.bathroomCount ?? "-" },
      { label: "DT Gross", value: item.areaGross ? `${item.areaGross} m²` : "-" },
      { label: "DT Net", value: item.areaNet ? `${item.areaNet} m²` : "-" },
      {
        label: "Giá bán",
        value: item.price ? formatMoneyShort(item.price) : "Liên hệ",
      },
      { label: "Tồn kho", value: item.inventoryStatus },
      { label: "Hướng", value: item.orientation || "-" },
      { label: "Pháp lý", value: item.legalStatus || "-" },
    ];
  }, [item]);

  if (isLoading) {
    return <div>Đang tải chi tiết sản phẩm...</div>;
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
          <h1 style={styles.title}>
            {item.code} - {item.title}
          </h1>
          <div style={styles.sub}>
            {item.project.name} · {item.inventoryStatus}
          </div>
        </div>

        <Link to="/seller/properties" style={styles.backBtn}>
          Quay lại danh sách
        </Link>
      </div>

      <section style={styles.hero}>
        <div style={styles.heroGrid}>
          <div style={styles.galleryCol}>
            {activeImageUrl ? (
              <img
                src={activeImageUrl}
                alt={item.title}
                style={styles.mainImage}
              />
            ) : (
              <div style={styles.mainPlaceholder}>NO IMAGE</div>
            )}

            <div style={styles.thumbRow}>
              {item.images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  style={{
                    ...styles.thumbBtn,
                    ...(activeImageUrl === image.url ? styles.thumbBtnActive : {}),
                  }}
                  onClick={() => setActiveImageUrl(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.originalName}
                    style={styles.thumbImage}
                  />
                </button>
              ))}

              {item.images.length === 0 ? (
                <div style={styles.empty}>Chưa có ảnh sản phẩm</div>
              ) : null}
            </div>
          </div>

          <div style={styles.summaryCol}>
            <div style={styles.cardTitle}>Thông tin sản phẩm</div>

            <div style={styles.infoGrid}>
              {summaryRows.map((row) => (
                <div key={row.label} style={styles.infoItem}>
                  <div style={styles.infoLabel}>{row.label}</div>
                  <div style={styles.infoValue}>{row.value}</div>
                </div>
              ))}
            </div>

            <div style={styles.noteBox}>
              <div style={styles.infoLabel}>Mô tả</div>
              <div style={styles.noteValue}>
                {item.description || "Chưa có mô tả sản phẩm"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.cardTitle}>Liên kết dự án</div>
        <div style={styles.projectBox}>
          <div style={styles.projectName}>{item.project.name}</div>
          <div style={styles.projectMeta}>Slug: {item.project.slug}</div>
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
  hero: {
    background: "#fff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    gap: 20,
    alignItems: "start",
  },
  galleryCol: {
    display: "grid",
    gap: 12,
  },
  mainImage: {
    width: "100%",
    height: 420,
    objectFit: "cover",
    borderRadius: 20,
    border: "1px solid #e5e7eb",
  },
  mainPlaceholder: {
    width: "100%",
    height: 420,
    display: "grid",
    placeItems: "center",
    borderRadius: 20,
    border: "1px dashed #d1d5db",
    background: "#f9fafb",
    color: "#6b7280",
    fontWeight: 700,
  },
  thumbRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  thumbBtn: {
    width: 86,
    height: 64,
    padding: 0,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
  },
  thumbBtnActive: {
    border: "2px solid #2388ff",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  summaryCol: {
    display: "grid",
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
    marginBottom: 14,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  infoItem: {
    display: "grid",
    gap: 4,
    padding: 12,
    borderRadius: 14,
    background: "#f9fafb",
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
    fontWeight: 700,
  },
  noteBox: {
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
    display: "grid",
    gap: 6,
  },
  noteValue: {
    fontSize: 15,
    lineHeight: 1.6,
    color: "#374151",
    whiteSpace: "pre-wrap",
  },
  projectBox: {
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
  },
  projectName: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  projectMeta: {
    marginTop: 6,
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
    padding: 8,
  },
};