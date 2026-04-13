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
  minPrice?: string | number;
  maxPrice?: string | number;
  minArea?: string | number;
  maxArea?: string | number;
  page?: number;
  pageSize?: number;
};

export type PublicProjectsPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export async function getPublicProjectsApi(params?: PublicProjectQuery) {
  const response = await api.get("/public/projects", { params });

  return response.data as {
    success: boolean;
    message: string;
    data: {
      items: PublicProjectItem[];
      pagination: PublicProjectsPagination;
    };
  };
}

export async function getPublicProjectDetailApi(slug: string) {
  const response = await api.get(`/public/projects/${slug}`);

  return response.data as {
    success: boolean;
    message: string;
    data: PublicProjectDetail;
  };
}

export async function getPublicLocationsApi() {
  const response = await api.get("/public/projects/locations");

  return response.data as {
    success: boolean;
    message: string;
    data: Record<string, string[]>;
  };
}

export async function getPublicSearchSuggestionsApi(keyword: string) {
  const response = await api.get("/public/search/suggestions", {
    params: { q: keyword },
  });

  return response.data as {
    success: boolean;
    message: string;
    data: {
      projects: Array<{
        id: string;
        type: "project";
        name: string;
        slug: string;
        location: string;
        projectType: string | null;
      }>;
      properties: Array<{
        id: string;
        type: "property";
        code: string;
        title: string;
        price: string | null;
        areaGross: string | null;
        propertyType: string;
        project: {
          id: string;
          name: string;
          slug: string;
        };
      }>;
      news: Array<{
        id: string;
        type: "news";
        title: string;
        slug: string;
        summary: string | null;
      }>;
    };
  };
}