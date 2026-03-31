// export type CreateProjectInput = {
//   name: string;
//   slug: string;
//   developerName?: string;
//   locationText?: string;
//   city?: string;
//   district?: string;
//   projectType?: string;
//   status?: "draft" | "published" | "hidden";
//   shortDescription?: string;
//   description?: string;
//   thumbnailMediaId?: string;
// };

// export type UpdateProjectInput = {
//   name?: string;
//   slug?: string;
//   developerName?: string;
//   locationText?: string;
//   city?: string;
//   district?: string;
//   projectType?: string;
//   status?: "draft" | "published" | "hidden";
//   shortDescription?: string;
//   description?: string;
//   thumbnailMediaId?: string | null;
// };

// export type ProjectListQuery = {
//   keyword?: string;
//   status?: "draft" | "published" | "hidden";
//   city?: string;
//   district?: string;
// };

export type CreateProjectInput = {
  name: string;
  slug: string;
  developerName?: string;
  locationText?: string;
  city?: string;
  district?: string;
  projectType?: string;
  status?: "draft" | "published" | "hidden";
  shortDescription?: string;
  description?: string;
  thumbnailMediaId?: string;
};

export type UpdateProjectInput = {
  name?: string;
  slug?: string;
  developerName?: string;
  locationText?: string;
  city?: string;
  district?: string;
  projectType?: string;
  status?: "draft" | "published" | "hidden";
  shortDescription?: string;
  description?: string;
  thumbnailMediaId?: string | null;
};

export type ProjectListQuery = {
  keyword?: string;
  status?: "draft" | "published" | "hidden";
  city?: string;
  district?: string;
  page?: number;
  pageSize?: number;
};