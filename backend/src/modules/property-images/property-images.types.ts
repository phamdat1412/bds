export type AddPropertyImageInput = {
  mediaFileId: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type UpdatePropertyImageInput = {
  sortOrder?: number;
  isPrimary?: boolean;
};