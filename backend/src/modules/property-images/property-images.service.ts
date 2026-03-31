import prisma from "../../configs/prisma.js";
import type {
  AddPropertyImageInput,
  UpdatePropertyImageInput,
} from "./property-images.types.js";

function mapPropertyImage(item: any) {
  return {
    id: item.id.toString(),
    propertyId: item.propertyId.toString(),
    mediaFileId: item.mediaFileId.toString(),
    sortOrder: item.sortOrder,
    isPrimary: item.isPrimary,
    createdAt: item.createdAt,
    mediaFile: {
      id: item.mediaFile.id.toString(),
      url: item.mediaFile.url,
      originalName: item.mediaFile.originalName,
      mimeType: item.mediaFile.mimeType,
      extension: item.mediaFile.extension,
      sizeBytes: item.mediaFile.sizeBytes.toString(),
    },
    property: item.property
      ? {
          id: item.property.id.toString(),
          code: item.property.code,
          title: item.property.title,
        }
      : null,
  };
}

export async function listPropertyImages(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: BigInt(propertyId) },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  const items = await prisma.propertyImage.findMany({
    where: { propertyId: BigInt(propertyId) },
    include: {
      mediaFile: true,
      property: true,
    },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return items.map(mapPropertyImage);
}

export async function addPropertyImage(
  propertyId: string,
  input: AddPropertyImageInput
) {
  const property = await prisma.property.findUnique({
    where: { id: BigInt(propertyId) },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  const mediaFile = await prisma.mediaFile.findUnique({
    where: { id: BigInt(input.mediaFileId) },
  });

  if (!mediaFile) {
    throw new Error("Media not found");
  }

  const existing = await prisma.propertyImage.findFirst({
    where: {
      propertyId: BigInt(propertyId),
      mediaFileId: BigInt(input.mediaFileId),
    },
  });

  if (existing) {
    throw new Error("This media is already attached to the property");
  }

  if (input.isPrimary) {
    await prisma.propertyImage.updateMany({
      where: { propertyId: BigInt(propertyId) },
      data: { isPrimary: false },
    });
  }

  const created = await prisma.propertyImage.create({
    data: {
      propertyId: BigInt(propertyId),
      mediaFileId: BigInt(input.mediaFileId),
      sortOrder: input.sortOrder ?? 0,
      isPrimary: input.isPrimary ?? false,
    },
    include: {
      mediaFile: true,
      property: true,
    },
  });

  return mapPropertyImage(created);
}

export async function updatePropertyImage(
  propertyId: string,
  imageId: string,
  input: UpdatePropertyImageInput
) {
  const existing = await prisma.propertyImage.findFirst({
    where: {
      id: BigInt(imageId),
      propertyId: BigInt(propertyId),
    },
  });

  if (!existing) {
    throw new Error("Property image not found");
  }

  if (input.isPrimary) {
    await prisma.propertyImage.updateMany({
      where: { propertyId: BigInt(propertyId) },
      data: { isPrimary: false },
    });
  }

  const updated = await prisma.propertyImage.update({
    where: { id: BigInt(imageId) },
    data: {
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
    },
    include: {
      mediaFile: true,
      property: true,
    },
  });

  return mapPropertyImage(updated);
}

export async function deletePropertyImage(propertyId: string, imageId: string) {
  const existing = await prisma.propertyImage.findFirst({
    where: {
      id: BigInt(imageId),
      propertyId: BigInt(propertyId),
    },
  });

  if (!existing) {
    throw new Error("Property image not found");
  }

  await prisma.propertyImage.delete({
    where: { id: BigInt(imageId) },
  });

  return {
    id: imageId,
    deleted: true,
  };
}