import api from "../../services/api";

export type ProjectStatus = "draft" | "published" | "hidden";

export type ProjectItem = {
  id: string;
  name: string;
  slug: string;
  developerName: string | null;
  locationText: string | null;
  city: string | null;
  district: string | null;
  projectType: string | null;
  status: ProjectStatus;
  shortDescription: string | null;
  thumbnailMedia: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  propertyCount: number;
  leadCount: number;
  createdAt: string;
  updatedAt: string;
};
export type ProjectDetailItem = {
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
  description: string | null;
  thumbnailMedia: {
    id: string;
    url: string;
    originalName: string;
  } | null;
  propertyCount: number;
  leadCount: number;
  bookmarkCount: number;
  properties: Array<{
    id: string;
    code: string;
    title: string;
    propertyType: string;
    blockName: string | null;
    floorNo: number | null;
    bedroomCount: number | null;
    bathroomCount: number | null;
    areaGross: string | null;
    areaNet: string | null;
    price: string | null;
    currency: string;
    inventoryStatus: string;
    orientation: string | null;
    legalStatus: string | null;
    thumbnail: {
      propertyImageId: string;
      mediaFileId: string;
      url: string;
      originalName: string;
    } | null;
  }>;
  createdAt: string;
  updatedAt: string;
};
// export async function getProjectsApi(params?: {
//   keyword?: string;
//   status?: ProjectStatus;
//   city?: string;
//   district?: string;
// }) {
//   const response = await api.get("/projects", { params });
//   return response.data;
// }
export async function getProjectsApi(params?: {
  keyword?: string;
  status?: ProjectStatus;
  city?: string;
  district?: string;
  page?: number;
  pageSize?: number;
}) {
  const response = await api.get("/projects", { params });
  return response.data;
}

export async function createProjectApi(payload: {
  name: string;
  slug: string;
  developerName?: string;
  locationText?: string;
  city?: string;
  district?: string;
  projectType?: string;
  status?: ProjectStatus;
  shortDescription?: string;
  description?: string;
  thumbnailMediaId?: string;
}) {
  const response = await api.post("/projects", payload);
  return response.data;
}

export async function updateProjectApi(
  projectId: string,
  payload: {
    name?: string;
    slug?: string;
    developerName?: string;
    locationText?: string;
    city?: string;
    district?: string;
    projectType?: string;
    status?: ProjectStatus;
    shortDescription?: string;
    description?: string;
    thumbnailMediaId?: string | null;
  }
) {
  const response = await api.patch(`/projects/${projectId}`, payload);
  return response.data;
}
export async function deleteProjectApi(projectId: string) {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
}
export async function getProjectDetailApi(projectId: string) {
  const response = await api.get(`/projects/${projectId}`);
  return response.data as {
    success: boolean;
    message: string;
    data: ProjectDetailItem;
  };
}