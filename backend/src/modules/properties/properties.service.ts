import prisma from "../../configs/prisma.js";
import { buildPaginationMeta } from "../../utils/pagination.js";
import type {
  CreatePropertyInput,
  PropertyListQuery,
  UpdateInventoryStatusInput,
  UpdatePropertyInput,
} from "./properties.types.js";

function mapPropertyDetail(property: any) {
  return {
    id: property.id.toString(),
    project: {
      id: property.project.id.toString(),
      name: property.project.name,
      slug: property.project.slug,
    },
    code: property.code,
    title: property.title,
    propertyType: property.propertyType,
    blockName: property.blockName,
    floorNo: property.floorNo,
    bedroomCount: property.bedroomCount,
    bathroomCount: property.bathroomCount,
    areaGross: property.areaGross ? property.areaGross.toString() : null,
    areaNet: property.areaNet ? property.areaNet.toString() : null,
    price: property.price ? property.price.toString() : null,
    currency: property.currency,
    inventoryStatus: property.inventoryStatus,
    orientation: property.orientation,
    legalStatus: property.legalStatus,
    description: property.description,
    images: Array.isArray(property.images)
      ? property.images.map((image: any) => ({
          id: image.id.toString(),
          mediaFileId: image.mediaFile.id.toString(),
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
          url: image.mediaFile.url,
          originalName: image.mediaFile.originalName,
        }))
      : [],
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
}

export async function createProperty(input: CreatePropertyInput) {
  const project = await prisma.project.findUnique({
    where: { id: BigInt(input.projectId) },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const property = await prisma.property.create({
    data: {
      projectId: project.id,
      code: input.code.trim(),
      title: input.title.trim(),
      propertyType: input.propertyType,
      blockName: input.blockName?.trim() || null,
      floorNo: input.floorNo ?? null,
      bedroomCount: input.bedroomCount ?? null,
      bathroomCount: input.bathroomCount ?? null,
      areaGross: input.areaGross ?? null,
      areaNet: input.areaNet ?? null,
      price: input.price ?? null,
      currency: input.currency?.trim() || "VND",
      inventoryStatus: input.inventoryStatus || "available",
      orientation: input.orientation?.trim() || null,
      legalStatus: input.legalStatus?.trim() || null,
      description: input.description?.trim() || null,
    },
    include: {
      project: true,
      images: {
        include: {
          mediaFile: true,
        },
      },
    },
  });

  return mapPropertyDetail(property);
}

export async function listProperties(query: PropertyListQuery) {
  const keyword = query.keyword?.trim() || undefined;
  const projectId = query.projectId ? BigInt(query.projectId) : undefined;

  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where = {
    ...(projectId ? { projectId } : {}),
    ...(query.propertyType ? { propertyType: query.propertyType } : {}),
    ...(query.inventoryStatus
      ? { inventoryStatus: query.inventoryStatus }
      : {}),
    ...(query.blockName ? { blockName: query.blockName } : {}),
    ...(keyword
      ? {
          OR: [
            { code: { contains: keyword } },
            { title: { contains: keyword } },
            { orientation: { contains: keyword } },
            { legalStatus: { contains: keyword } },
          ],
        }
      : {}),
  };

  const [properties, totalItems] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        project: true,
        images: {
          include: {
            mediaFile: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    items: properties.map((property) => ({
      id: property.id.toString(),
      project: {
        id: property.project.id.toString(),
        name: property.project.name,
        slug: property.project.slug,
      },
      code: property.code,
      title: property.title,
      propertyType: property.propertyType,
      blockName: property.blockName,
      floorNo: property.floorNo,
      bedroomCount: property.bedroomCount,
      bathroomCount: property.bathroomCount,
      areaGross: property.areaGross ? property.areaGross.toString() : null,
      areaNet: property.areaNet ? property.areaNet.toString() : null,
      price: property.price ? property.price.toString() : null,
      currency: property.currency,
      inventoryStatus: property.inventoryStatus,
      orientation: property.orientation,
      legalStatus: property.legalStatus,
      thumbnail: property.images[0]
        ? {
            propertyImageId: property.images[0].id.toString(),
            mediaFileId: property.images[0].mediaFile.id.toString(),
            url: property.images[0].mediaFile.url,
            originalName: property.images[0].mediaFile.originalName,
          }
        : null,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    })),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function getPropertyDetail(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: BigInt(propertyId) },
    include: {
      project: true,
      images: {
        include: {
          mediaFile: true,
        },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  return mapPropertyDetail(property);
}

export async function getPublicPropertyDetail(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: BigInt(propertyId) },
    include: {
      project: true,
      images: {
        include: {
          mediaFile: true,
        },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  if (property.project.status !== "published") {
    throw new Error("Property not available");
  }

  if (property.inventoryStatus === "hidden") {
    throw new Error("Property not available");
  }

  return mapPropertyDetail(property);
}

export async function updateProperty(
  propertyId: string,
  input: UpdatePropertyInput
) {
  const existingProperty = await prisma.property.findUnique({
    where: { id: BigInt(propertyId) },
  });

  if (!existingProperty) {
    throw new Error("Property not found");
  }

  let nextProjectId: bigint | undefined;

  if (input.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: BigInt(input.projectId) },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    nextProjectId = project.id;
  }

  const property = await prisma.property.update({
    where: { id: BigInt(propertyId) },
    data: {
      ...(nextProjectId !== undefined ? { projectId: nextProjectId } : {}),
      ...(input.code !== undefined ? { code: input.code.trim() } : {}),
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.propertyType !== undefined
        ? { propertyType: input.propertyType }
        : {}),
      ...(input.blockName !== undefined
        ? { blockName: input.blockName?.trim() || null }
        : {}),
      ...(input.floorNo !== undefined ? { floorNo: input.floorNo } : {}),
      ...(input.bedroomCount !== undefined
        ? { bedroomCount: input.bedroomCount }
        : {}),
      ...(input.bathroomCount !== undefined
        ? { bathroomCount: input.bathroomCount }
        : {}),
      ...(input.areaGross !== undefined ? { areaGross: input.areaGross } : {}),
      ...(input.areaNet !== undefined ? { areaNet: input.areaNet } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.currency !== undefined
        ? { currency: input.currency.trim() || "VND" }
        : {}),
      ...(input.inventoryStatus !== undefined
        ? { inventoryStatus: input.inventoryStatus }
        : {}),
      ...(input.orientation !== undefined
        ? { orientation: input.orientation?.trim() || null }
        : {}),
      ...(input.legalStatus !== undefined
        ? { legalStatus: input.legalStatus?.trim() || null }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
    },
    include: {
      project: true,
      images: {
        include: {
          mediaFile: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return mapPropertyDetail(property);
}

export async function updateInventoryStatus(
  propertyId: string,
  input: UpdateInventoryStatusInput
) {
  const property = await prisma.property.findUnique({
    where: { id: BigInt(propertyId) },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  const updatedProperty = await prisma.property.update({
    where: { id: BigInt(propertyId) },
    data: {
      inventoryStatus: input.inventoryStatus,
    },
    include: {
      project: true,
      images: {
        include: {
          mediaFile: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return mapPropertyDetail(updatedProperty);
}

export async function deleteProperty(propertyId: string) {
  const existingProperty = await prisma.property.findUnique({
    where: { id: BigInt(propertyId) },
    include: {
      images: true,
    },
  });

  if (!existingProperty) {
    throw new Error("Property not found");
  }

  if (existingProperty.images.length > 0) {
    throw new Error("Cannot delete property with existing images");
  }

  await prisma.property.delete({
    where: { id: BigInt(propertyId) },
  });

  return {
    id: propertyId,
    deleted: true,
  };
}