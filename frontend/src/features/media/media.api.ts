import api from "../../services/api";

export type MediaItem = {
  id: string;
  disk: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  extension: string | null;
  sizeBytes: string;
  pathKey: string;
  url: string;
  uploadedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getMediaApi(params?: {
  keyword?: string;
  mimeType?: string;
  uploadedByUserId?: string;
}) {
  const response = await api.get("/media", { params });
  return response.data;
}

export async function uploadMediaApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/media/upload", formData);
  return response.data;
}

export async function deleteMediaApi(mediaId: string) {
  const response = await api.delete(`/media/${mediaId}`);
  return response.data;
}