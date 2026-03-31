import api from "../../services/api";

export type PublicNewsItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  status: string;
  thumbnailMedia: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getPublicNewsApi() {
  const response = await api.get("/public/news");
  return response.data as {
    success: boolean;
    message: string;
    data: PublicNewsItem[];
  };
}

export async function getPublicNewsDetailApi(slug: string) {
  const response = await api.get(`/public/news/${slug}`);
  return response.data as {
    success: boolean;
    message: string;
    data: PublicNewsItem;
  };
}