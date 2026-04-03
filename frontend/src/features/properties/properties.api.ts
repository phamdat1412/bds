import api from "../../services/api";

export type PropertyType =
  | "apartment"
  | "shophouse"
  | "townhouse"
  | "villa"
  | "land";

export type InventoryStatus =
  | "available"
  | "reserved"
  | "sold"
  | "hidden";

export type PropertyItem = {
  id: string;
  project: {
    id: string;
    name: string;
    slug: string;
  };
  code: string;
  title: string;
  propertyType: PropertyType;
  blockName: string | null;
  floorNo: number | null;
  bedroomCount: number | null;
  bathroomCount: number | null;
  areaGross: string | null;
  areaNet: string | null;
  price: string | null;
  currency: string;
  inventoryStatus: InventoryStatus;
  orientation: string | null;
  legalStatus: string | null;
  thumbnail: {
    propertyImageId: string;
    mediaFileId: string;
    url: string;
    originalName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type PropertyDetailItem = {
  id: string;
  project: {
    id: string;
    name: string;
    slug: string;
  };
  code: string;
  title: string;
  propertyType: PropertyType;
  blockName: string | null;
  floorNo: number | null;
  bedroomCount: number | null;
  bathroomCount: number | null;
  areaGross: string | null;
  areaNet: string | null;
  price: string | null;
  currency: string;
  inventoryStatus: InventoryStatus;
  orientation: string | null;
  legalStatus: string | null;
  description: string | null;
  images: Array<{
    id: string;
    mediaFileId: string;
    sortOrder: number;
    isPrimary: boolean;
    url: string;
    originalName: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export async function getPropertiesApi(params?: {
  projectId?: string;
  keyword?: string;
  propertyType?: PropertyType;
  inventoryStatus?: InventoryStatus;
  blockName?: string;
  page?: number;
  pageSize?: number;
}) {
  const response = await api.get("/properties", { params });
  return response.data;
}

export async function createPropertyApi(payload: {
  projectId: string;
  code: string;
  title: string;
  propertyType: PropertyType;
  blockName?: string;
  floorNo?: number;
  bedroomCount?: number;
  bathroomCount?: number;
  areaGross?: number;
  areaNet?: number;
  price?: number;
  currency?: string;
  inventoryStatus?: InventoryStatus;
  orientation?: string;
  legalStatus?: string;
  description?: string;
}) {
  const response = await api.post("/properties", payload);
  return response.data;
}

export async function updatePropertyApi(
  propertyId: string,
  payload: {
    projectId?: string;
    code?: string;
    title?: string;
    propertyType?: PropertyType;
    blockName?: string;
    floorNo?: number | null;
    bedroomCount?: number | null;
    bathroomCount?: number | null;
    areaGross?: number | null;
    areaNet?: number | null;
    price?: number | null;
    currency?: string;
    inventoryStatus?: InventoryStatus;
    orientation?: string;
    legalStatus?: string;
    description?: string;
  }
) {
  const response = await api.patch(`/properties/${propertyId}`, payload);
  return response.data;
}

export async function updateInventoryStatusApi(
  propertyId: string,
  payload: { inventoryStatus: InventoryStatus }
) {
  const response = await api.patch(
    `/properties/${propertyId}/inventory-status`,
    payload
  );
  return response.data;
}

export async function deletePropertyApi(propertyId: string) {
  const response = await api.delete(`/properties/${propertyId}`);
  return response.data;
}

export async function getPropertyDetailApi(propertyId: string) {
  const response = await api.get(`/properties/${propertyId}`);
  return response.data as {
    success: boolean;
    message: string;
    data: PropertyDetailItem;
  };
}

export async function getPublicPropertyDetailApi(propertyId: string) {
  const response = await api.get(`/public/properties/${propertyId}`);
  return response.data as {
    success: boolean;
    message: string;
    data: PropertyDetailItem;
  };
}