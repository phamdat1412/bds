import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createNewsApi,
  deleteNewsApi,
  getNewsApi,
  updateNewsApi,
  type NewsItem,
  type NewsStatus,
} from "./news.api";
import Modal from "../../components/ui/Modal";
import MediaPickerModal from "../../components/media/MediaPickerModal";
import type { MediaItem } from "../media/media.api";

const emptyForm = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  thumbnailMediaId: "",
  thumbnailMediaUrl: "",
  status: "draft" as NewsStatus,
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadNews() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getNewsApi({ page: 1, pageSize: 50 });
      setItems(result.data?.items || []);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Không tải được news");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(item: NewsItem) {
    setEditingItem(item);
    setForm({
      title: item.title,
      slug: item.slug,
      summary: item.summary || "",
      content: item.content || "",
      thumbnailMediaId: item.thumbnailMedia?.id || "",
      thumbnailMediaUrl: item.thumbnailMedia?.url || "",
      status: item.status,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      const payload = {
        title: form.title,
        slug: form.slug || makeSlug(form.title),
        summary: form.summary || undefined,
        content: form.content || undefined,
        thumbnailMediaId: form.thumbnailMediaId || undefined,
        status: form.status,
      };

      if (editingItem) {
        await updateNewsApi(editingItem.id, payload);
      } else {
        await createNewsApi(payload);
      }

      closeModal();
      await loadNews();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Lưu news thất bại");
    }
  }

  async function handleDelete(item: NewsItem) {
    const confirmed = window.confirm(`Xóa bài viết "${item.title}"?`);
    if (!confirmed) return;

    try {
      await deleteNewsApi(item.id);
      await loadNews();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Xóa news thất bại");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>News</h1>
          <div style={styles.sub}>Quản lý tin tức public website</div>
        </div>

        <button style={styles.primaryBtn} onClick={openCreateModal}>
          Thêm bài viết
        </button>
      </div>

      {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

      <div style={styles.grid}>
        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={styles.card}>
              {item.thumbnailMedia?.url ? (
                <img
                  src={item.thumbnailMedia.url}
                  alt={item.title}
                  style={styles.image}
                />
              ) : (
                <div style={styles.imagePlaceholder}>NO IMAGE</div>
              )}

              <div style={styles.cardBody}>
                <div style={styles.cardTitle}>{item.title}</div>
                <div style={styles.cardMeta}>{item.status}</div>
                <div style={styles.cardDesc}>
                  {item.summary || "Đang cập nhật tóm tắt"}
                </div>

                <div style={styles.actions}>
                  <button style={styles.secondaryBtn} onClick={() => openEditModal(item)}>
                    Sửa
                  </button>
                  <button style={styles.dangerBtn} onClick={() => handleDelete(item)}>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={isModalOpen}
        title={editingItem ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Tiêu đề"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                title: e.target.value,
                slug: prev.slug ? prev.slug : makeSlug(e.target.value),
              }))
            }
          />

          <input
            style={styles.input}
            placeholder="Slug"
            value={form.slug}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                slug: makeSlug(e.target.value),
              }))
            }
          />

          <textarea
            style={styles.textarea}
            placeholder="Tóm tắt"
            value={form.summary}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, summary: e.target.value }))
            }
          />

          <textarea
            style={styles.textareaLarge}
            placeholder="Nội dung"
            value={form.content}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, content: e.target.value }))
            }
          />

          <select
            style={styles.input}
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value as NewsStatus,
              }))
            }
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="hidden">hidden</option>
          </select>

          <div style={styles.thumbnailBox}>
            {form.thumbnailMediaUrl ? (
              <img
                src={form.thumbnailMediaUrl}
                alt="thumbnail"
                style={styles.preview}
              />
            ) : (
              <div style={styles.previewPlaceholder}>Chưa chọn ảnh</div>
            )}

            <div style={styles.actions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => setIsMediaPickerOpen(true)}
              >
                Chọn ảnh
              </button>

              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    thumbnailMediaId: "",
                    thumbnailMediaUrl: "",
                  }))
                }
              >
                Bỏ ảnh
              </button>
            </div>
          </div>

          <div style={styles.actionsEnd}>
            <button type="button" style={styles.secondaryBtn} onClick={closeModal}>
              Hủy
            </button>
            <button type="submit" style={styles.primaryBtn}>
              {editingItem ? "Lưu thay đổi" : "Tạo bài viết"}
            </button>
          </div>
        </form>
      </Modal>

      <MediaPickerModal
        open={isMediaPickerOpen}
        title="Chọn ảnh bài viết"
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(item: MediaItem) =>
          setForm((prev) => ({
            ...prev,
            thumbnailMediaId: item.id,
            thumbnailMediaUrl: item.url,
          }))
        }
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "grid", gap: 20 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { margin: 0, fontSize: 34, fontWeight: 800, color: "#111827" },
  sub: { marginTop: 6, color: "#6b7280" },
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
    height: 40,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    background: "#fff",
    padding: "0 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  dangerBtn: {
    height: 40,
    border: "none",
    borderRadius: 10,
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "0 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  image: { width: "100%", height: 220, objectFit: "cover" },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    color: "#6b7280",
    fontWeight: 700,
  },
  cardBody: { padding: 18, display: "grid", gap: 8 },
  cardTitle: { fontSize: 22, fontWeight: 800, color: "#111827" },
  cardMeta: { fontSize: 13, color: "#4b5563" },
  cardDesc: { fontSize: 14, color: "#6b7280" },
  form: { display: "grid", gap: 12 },
  input: {
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
  },
  textarea: {
    minHeight: 100,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: 14,
    fontSize: 14,
    resize: "vertical",
  },
  textareaLarge: {
    minHeight: 180,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: 14,
    fontSize: 14,
    resize: "vertical",
  },
  thumbnailBox: { display: "grid", gap: 12 },
  preview: {
    width: 220,
    height: 140,
    objectFit: "cover",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
  },
  previewPlaceholder: {
    width: 220,
    height: 140,
    display: "grid",
    placeItems: "center",
    borderRadius: 16,
    border: "1px dashed #d1d5db",
    color: "#6b7280",
  },
  actions: { display: "flex", gap: 10 },
  actionsEnd: { display: "flex", justifyContent: "flex-end", gap: 10 },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
  },
};