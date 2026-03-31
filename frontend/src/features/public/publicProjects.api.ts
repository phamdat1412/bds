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

export async function getPublicProjectsApi() {
  const response = await api.get("/public/projects");
  return response.data as {
    success: boolean;
    message: string;
    data: PublicProjectItem[];
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