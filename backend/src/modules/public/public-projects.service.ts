import prisma from "../../configs/prisma.js";
import { buildPaginationMeta } from "../../utils/pagination.js";

type PublicProjectsQuery = {
  keyword?: string;
  city?: string;
  district?: string;
  projectType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  page?: number;
  pageSize?: number;
};

export async function listPublicProjects(query: PublicProjectsQuery = {}) {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 9;
  const skip = (page - 1) * pageSize;

  const keyword = query.keyword?.trim();
  const city = query.city?.trim();
  const district = query.district?.trim();
  const projectType = query.projectType?.trim();

  const propertySomeFilter =
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.minArea !== undefined ||
    query.maxArea !== undefined
      ? {
          some: {
            inventoryStatus: {
              not: "hidden" as const,
            },
            ...(query.minPrice !== undefined || query.maxPrice !== undefined
              ? {
                  price: {
                    ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
                    ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
                  },
                }
              : {}),
            ...(query.minArea !== undefined || query.maxArea !== undefined
              ? {
                  areaGross: {
                    ...(query.minArea !== undefined ? { gte: query.minArea } : {}),
                    ...(query.maxArea !== undefined ? { lte: query.maxArea } : {}),
                  },
                }
              : {}),
          },
        }
      : undefined;

  const where = {
    status: "published" as const,
    ...(city ? { city: { contains: city } } : {}),
    ...(district ? { district: { contains: district } } : {}),
    ...(projectType ? { projectType: { contains: projectType } } : {}),
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { slug: { contains: keyword } },
            { developerName: { contains: keyword } },
            { locationText: { contains: keyword } },
            { city: { contains: keyword } },
            { district: { contains: keyword } },
            { shortDescription: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }
      : {}),
    ...(propertySomeFilter ? { properties: propertySomeFilter } : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        thumbnailMedia: true,
        properties: {
          where: {
            inventoryStatus: {
              not: "hidden",
            },
          },
          select: {
            id: true,
            price: true,
            areaGross: true,
          },
        },
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
      skip,
      take: pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    items: items.map((item) => {
      const priceValues = item.properties
        .map((p) => (p.price ? Number(p.price) : null))
        .filter((v): v is number => v !== null);

      const areaValues = item.properties
        .map((p) => (p.areaGross ? Number(p.areaGross) : null))
        .filter((v): v is number => v !== null);

      return {
        id: item.id.toString(),
        name: item.name,
        slug: item.slug,
        developerName: item.developerName,
        locationText: item.locationText,
        city: item.city,
        district: item.district,
        projectType: item.projectType,
        status: item.status,
        shortDescription: item.shortDescription,
        description: item.description,
        thumbnailMedia: item.thumbnailMedia
          ? {
              id: item.thumbnailMedia.id.toString(),
              url: item.thumbnailMedia.url,
              originalName: item.thumbnailMedia.originalName,
            }
          : null,
        propertyCount: item._count.properties,
        leadCount: item._count.leads,
        minPrice: priceValues.length > 0 ? String(Math.min(...priceValues)) : null,
        minArea: areaValues.length > 0 ? String(Math.min(...areaValues)) : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    }),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function getPublicProjectLocations() {
  const results = await prisma.project.findMany({
    where: { status: "published" },
    select: { city: true, district: true },
    distinct: ["city", "district"],
  });

  const locations: Record<string, string[]> = {};

  results.forEach((p) => {
    if (p.city) {
      if (!locations[p.city]) locations[p.city] = [];
      if (p.district && !locations[p.city].includes(p.district)) {
        locations[p.city].push(p.district);
      }
    }
  });

  return locations;
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