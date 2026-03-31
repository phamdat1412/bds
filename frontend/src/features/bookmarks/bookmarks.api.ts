import api from "../../services/api";

export type BookmarkItem = {
  id: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    slug: string;
    developerName: string | null;
    locationText: string | null;
    city: string | null;
    district: string | null;
    projectType: string | null;
    status: string;
    shortDescription: string | null;
    thumbnailMedia: {
      id: string;
      url: string;
      originalName: string;
    } | null;
  };
};

export async function getMyProjectBookmarksApi() {
  const response = await api.get("/bookmarks/projects");
  return response.data as {
    success: boolean;
    message: string;
    data: BookmarkItem[];
  };
}

export async function toggleProjectBookmarkApi(projectId: string) {
  const response = await api.post(`/bookmarks/projects/${projectId}/toggle`);
  return response.data as {
    success: boolean;
    message: string;
    data: {
      bookmarked: boolean;
      bookmarkId?: string;
      projectId: string;
    };
  };
}

export async function getProjectBookmarkStatusApi(projectId: string) {
  const response = await api.get(`/bookmarks/projects/${projectId}/status`);
  return response.data as {
    success: boolean;
    message: string;
    data: {
      bookmarked: boolean;
      projectId: string;
    };
  };
}