import prisma from "../../configs/prisma.js";

export async function listPublicProjects() {
  const projects = await prisma.project.findMany({
    where: {
      status: "published",
    },
    include: {
      thumbnailMedia: true,
      _count: {
        select: {
          properties: true,
          leads: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map((project) => ({
    id: project.id.toString(),
    name: project.name,
    slug: project.slug,
    developerName: project.developerName,
    locationText: project.locationText,
    city: project.city,
    district: project.district,
    projectType: project.projectType,
    status: project.status,
    shortDescription: project.shortDescription,
    thumbnailMedia: project.thumbnailMedia
      ? {
          id: project.thumbnailMedia.id.toString(),
          url: project.thumbnailMedia.url,
          originalName: project.thumbnailMedia.originalName,
        }
      : null,
    propertyCount: project._count.properties,
    leadCount: project._count.leads,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));
}

export async function getPublicProjectDetail(slug: string) {
  const project = await prisma.project.findFirst({
    where: {
      slug,
      status: "published",
    },
    include: {
      thumbnailMedia: true,
      properties: {
        include: {
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
        take: 12,
      },
      _count: {
        select: {
          properties: true,
          leads: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return {
    id: project.id.toString(),
    name: project.name,
    slug: project.slug,
    developerName: project.developerName,
    locationText: project.locationText,
    city: project.city,
    district: project.district,
    projectType: project.projectType,
    status: project.status,
    shortDescription: project.shortDescription,
    description: project.description,
    thumbnailMedia: project.thumbnailMedia
      ? {
          id: project.thumbnailMedia.id.toString(),
          url: project.thumbnailMedia.url,
          originalName: project.thumbnailMedia.originalName,
        }
      : null,
    propertyCount: project._count.properties,
    leadCount: project._count.leads,
    properties: project.properties.map((property) => ({
      id: property.id.toString(),
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
    })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}