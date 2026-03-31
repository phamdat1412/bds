export type CreatePropertyInput = {
  projectId: string;
  code: string;
  title: string;
  propertyType: "apartment" | "shophouse" | "townhouse" | "villa" | "land";
  blockName?: string;
  floorNo?: number;
  bedroomCount?: number;
  bathroomCount?: number;
  areaGross?: number;
  areaNet?: number;
  price?: number;
  currency?: string;
  inventoryStatus?: "available" | "reserved" | "sold" | "hidden";
  orientation?: string;
  legalStatus?: string;
  description?: string;
};

export type UpdatePropertyInput = {
  projectId?: string;
  code?: string;
  title?: string;
  propertyType?: "apartment" | "shophouse" | "townhouse" | "villa" | "land";
  blockName?: string;
  floorNo?: number | null;
  bedroomCount?: number | null;
  bathroomCount?: number | null;
  areaGross?: number | null;
  areaNet?: number | null;
  price?: number | null;
  currency?: string;
  inventoryStatus?: "available" | "reserved" | "sold" | "hidden";
  orientation?: string;
  legalStatus?: string;
  description?: string;
};

export type UpdateInventoryStatusInput = {
  inventoryStatus: "available" | "reserved" | "sold" | "hidden";
};

export type PropertyListQuery = {
  projectId?: string;
  keyword?: string;
  propertyType?: "apartment" | "shophouse" | "townhouse" | "villa" | "land";
  inventoryStatus?: "available" | "reserved" | "sold" | "hidden";
  blockName?: string;
  page?: number;
  pageSize?: number;
};