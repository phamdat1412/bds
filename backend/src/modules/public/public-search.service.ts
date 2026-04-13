import prisma from "../../configs/prisma.js";

export async function getPublicSearchSuggestions(keywordRaw: string) {
  const keyword = keywordRaw.trim();

  if (!keyword) {
    return {
      projects: [],
      properties: [],
      news: [],
    };
  }

  const [projects, properties, news] = await Promise.all([
    prisma.project.findMany({
      where: {
        status: "published",
        OR: [
          { name: { contains: keyword } },
          { developerName: { contains: keyword } },
          { locationText: { contains: keyword } },
          { city: { contains: keyword } },
          { district: { contains: keyword } },
          { shortDescription: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        district: true,
        projectType: true,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.property.findMany({
      where: {
        inventoryStatus: {
          not: "hidden",
        },
        project: {
          status: "published",
        },
        OR: [
          { code: { contains: keyword } },
          { title: { contains: keyword } },
          { blockName: { contains: keyword } },
          { orientation: { contains: keyword } },
          { legalStatus: { contains: keyword } },
          { description: { contains: keyword } },
          {
            project: {
              name: { contains: keyword },
            },
          },
          {
            project: {
              city: { contains: keyword },
            },
          },
          {
            project: {
              district: { contains: keyword },
            },
          },
        ],
      },
      select: {
        id: true,
        code: true,
        title: true,
        price: true,
        areaGross: true,
        propertyType: true,
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.news.findMany({
      where: {
        status: "published",
        OR: [
          { title: { contains: keyword } },
          { summary: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
      },
      take: 5,
      orderBy: {
        publishedAt: "desc",
      },
    }),
  ]);

  return {
    projects: projects.map((item) => ({
      id: item.id.toString(),
      type: "project" as const,
      name: item.name,
      slug: item.slug,
      location: [item.district, item.city].filter(Boolean).join(", "),
      projectType: item.projectType,
    })),

    properties: properties.map((item) => ({
      id: item.id.toString(),
      type: "property" as const,
      code: item.code,
      title: item.title,
      price: item.price ? item.price.toString() : null,
      areaGross: item.areaGross ? item.areaGross.toString() : null,
      propertyType: item.propertyType,
      project: {
        id: item.project.id.toString(),
        name: item.project.name,
        slug: item.project.slug,
      },
    })),

    news: news.map((item) => ({
      id: item.id.toString(),
      type: "news" as const,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
    })),
  };
}