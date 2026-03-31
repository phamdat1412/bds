export type NewsStatus = "draft" | "published" | "hidden";

export type CreateNewsInput = {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  thumbnailMediaId?: string;
  status?: NewsStatus;
};

export type UpdateNewsInput = {
  title?: string;
  slug?: string;
  summary?: string | null;
  content?: string | null;
  thumbnailMediaId?: string | null;
  status?: NewsStatus;
};

export type NewsListQuery = {
  keyword?: string;
  status?: NewsStatus;
  page?: number;
  pageSize?: number;
};