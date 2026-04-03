// path: frontend/src/features/public/publicProjects.api.ts
import api from "../../services/api";

export type PublicProjectItem = {
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
  propertyCount: number;
  leadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicProjectDetail = PublicProjectItem & {
  description: string | null;
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
};

export type PublicProjectQuery = {
  keyword?: string;
  city?: string;
  district?: string;
  projectType?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  page?: number;
  pageSize?: number;
};

export async function getPublicProjectsApi(params?: PublicProjectQuery) {
  const response = await api.get("/public/projects", { params });
  return response.data;
}

export async function getPublicProjectDetailApi(slug: string) {
  const response = await api.get(`/public/projects/${slug}`);
  return response.data;
}

export async function getPublicLocationsApi() {
  const response = await api.get("/public/projects/locations");
  return response.data;
}
// path: frontend/src/features/public/publicProjects.api.ts

// ... (giữ các hàm cũ)

export async function getSearchSuggestionsApi(keyword: string) {
  // Gọi API lấy gợi ý nhanh cho cả Projects và Properties
  const response = await api.get("/public/search/suggestions", { 
    params: { keyword, limit: 5 } 
  });
  return response.data as {
    success: boolean;
    data: {
      projects: Array<{ id: string; name: string; slug: string; type: 'project' }>;
      properties: Array<{ id: string; title: string; id_property: string; type: 'property' }>;
    };
  };
}