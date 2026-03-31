import api from "../../services/api";

export type PropertyImageItem = {
  id: string;
  propertyId: string;
  mediaFileId: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
  mediaFile: {
    id: string;
    url: string;
    originalName: string;
    mimeType: string;
    extension: string | null;
    sizeBytes: string;
  };
  property: {
    id: string;
    code: string;
    title: string;
  } | null;
};

export async function getPropertyImagesApi(propertyId: string) {
  const response = await api.get(`/properties/${propertyId}/images`);
  return response.data;
}

export async function addPropertyImageApi(
  propertyId: string,
  payload: {
    mediaFileId: string;
    sortOrder?: number;
    isPrimary?: boolean;
  }
) {
  const response = await api.post(`/properties/${propertyId}/images`, payload);
  return response.data;
}

export async function updatePropertyImageApi(
  propertyId: string,
  imageId: string,
  payload: {
    sortOrder?: number;
    isPrimary?: boolean;
  }
) {
  const response = await api.patch(
    `/properties/${propertyId}/images/${imageId}`,
    payload
  );
  return response.data;
}

export async function deletePropertyImageApi(
  propertyId: string,
  imageId: string
) {
  const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
  return response.data;
}