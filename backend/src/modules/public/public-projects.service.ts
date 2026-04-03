// path: backend/src/modules/public/public-projects.service.ts
import prisma from "../../configs/prisma.js";
import { buildPaginationMeta } from "../../utils/pagination.js";

/**
 * Lấy danh sách dự án công khai kèm tìm kiếm mở rộng, lọc nâng cao và phân trang
 */
export async function listPublicProjects(query: any = {}) {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 9;
  const skip = (page - 1) * pageSize;

  const where: any = {
    status: "published",
    ...(query.city ? { city: query.city } : {}),
    ...(query.district ? { district: query.district } : {}),
    ...(query.projectType ? { projectType: query.projectType } : {}),
  };

  // 1. Tìm kiếm mở rộng (Keyword) - Quét qua nhiều trường thông tin
  if (query.keyword) {
    const keyword = query.keyword.trim();
    where.OR = [
      { name: { contains: keyword } },
      { slug: { contains: keyword } },
      { developerName: { contains: keyword } },
      { locationText: { contains: keyword } },
      { shortDescription: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  // 2. Lọc theo khoảng Giá (Price) - Truy vấn qua model Property
  if (query.minPrice || query.maxPrice) {
    where.properties = {
      some: {
        price: {
          ...(query.minPrice ? { gte: Number(query.minPrice) } : {}),
          ...(query.maxPrice ? { lte: Number(query.maxPrice) } : {}),
        },
      },
    };
  }

  // 3. Lọc theo khoảng Diện tích (Area) - Truy vấn qua model Property
  if (query.minArea || query.maxArea) {
    where.properties = {
      ...where.properties,
      some: {
        ...(where.properties?.some || {}),
        areaGross: {
          ...(query.minArea ? { gte: Number(query.minArea) } : {}),
          ...(query.maxArea ? { lte: Number(query.maxArea) } : {}),
        },
      },
    };
  }

  const [projects, totalItems] = await Promise.all([
    prisma.project.findMany({
      where,
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
      skip,
      take: pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    items: projects.map((project) => ({
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
    })),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

/**
 * Lấy danh sách Vị trí (City/District) động từ dữ liệu dự án thực tế
 */
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

/**
 * Lấy chi tiết một dự án công khai dựa trên slug
 */
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