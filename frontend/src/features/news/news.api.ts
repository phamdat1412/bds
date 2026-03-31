import api from "../../services/api";

export type NewsStatus = "draft" | "published" | "hidden";

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  status: NewsStatus;
  thumbnailMedia: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getNewsApi(params?: {
  keyword?: string;
  status?: NewsStatus;
  page?: number;
  pageSize?: number;
}) {
  const response = await api.get("/news", { params });
  return response.data;
}

export async function createNewsApi(payload: {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  thumbnailMediaId?: string;
  status?: NewsStatus;
}) {
  const response = await api.post("/news", payload);
  return response.data;
}

export async function updateNewsApi(
  newsId: string,
  payload: {
    title?: string;
    slug?: string;
    summary?: string | null;
    content?: string | null;
    thumbnailMediaId?: string | null;
    status?: NewsStatus;
  }
) {
  const response = await api.patch(`/news/${newsId}`, payload);
  return response.data;
}

export async function deleteNewsApi(newsId: string) {
  const response = await api.delete(`/news/${newsId}`);
  return response.data;
}