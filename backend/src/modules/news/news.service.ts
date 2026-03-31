import prisma from "../../configs/prisma.js";
import { buildPaginationMeta } from "../../utils/pagination.js";
import type {
  CreateNewsInput,
  NewsListQuery,
  UpdateNewsInput,
} from "./news.type.js";

function mapNews(item: any) {
  return {
    id: item.id.toString(),
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    status: item.status,
    thumbnailMedia: item.thumbnailMedia
      ? {
          id: item.thumbnailMedia.id.toString(),
          url: item.thumbnailMedia.url,
          originalName: item.thumbnailMedia.originalName,
        }
      : null,
    publishedAt: item.publishedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function createNews(input: CreateNewsInput) {
  const thumbnailMediaId = input.thumbnailMediaId
    ? BigInt(input.thumbnailMediaId)
    : null;

  const item = await prisma.news.create({
    data: {
      title: input.title.trim(),
      slug: input.slug.trim(),
      summary: input.summary?.trim() || null,
      content: input.content?.trim() || null,
      thumbnailMediaId,
      status: input.status || "draft",
      publishedAt: input.status === "published" ? new Date() : null,
    },
    include: {
      thumbnailMedia: true,
    },
  });

  return mapNews(item);
}

export async function listNews(query: NewsListQuery) {
  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  const keyword = query.keyword?.trim() || undefined;

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { slug: { contains: keyword } },
            { summary: { contains: keyword } },
          ],
        }
      : {}),
  };

  const [items, totalItems] = await Promise.all([
    prisma.news.findMany({
      where,
      include: {
        thumbnailMedia: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.news.count({ where }),
  ]);

  return {
    items: items.map(mapNews),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function getNewsDetail(newsId: string) {
  const item = await prisma.news.findUnique({
    where: { id: BigInt(newsId) },
    include: {
      thumbnailMedia: true,
    },
  });

  if (!item) {
    throw new Error("News not found");
  }

  return mapNews(item);
}

export async function updateNews(newsId: string, input: UpdateNewsInput) {
  const existing = await prisma.news.findUnique({
    where: { id: BigInt(newsId) },
  });

  if (!existing) {
    throw new Error("News not found");
  }

  const nextStatus = input.status ?? existing.status;

  const item = await prisma.news.update({
    where: { id: BigInt(newsId) },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
      ...(input.summary !== undefined
        ? { summary: input.summary?.trim() || null }
        : {}),
      ...(input.content !== undefined
        ? { content: input.content?.trim() || null }
        : {}),
      ...(input.thumbnailMediaId !== undefined
        ? {
            thumbnailMediaId: input.thumbnailMediaId
              ? BigInt(input.thumbnailMediaId)
              : null,
          }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(existing.status !== "published" && nextStatus === "published"
        ? { publishedAt: new Date() }
        : {}),
    },
    include: {
      thumbnailMedia: true,
    },
  });

  return mapNews(item);
}

export async function deleteNews(newsId: string) {
  const existing = await prisma.news.findUnique({
    where: { id: BigInt(newsId) },
  });

  if (!existing) {
    throw new Error("News not found");
  }

  await prisma.news.delete({
    where: { id: BigInt(newsId) },
  });

  return {
    id: newsId,
    deleted: true,
  };
}

export async function listPublicNews() {
  const items = await prisma.news.findMany({
    where: {
      status: "published",
    },
    include: {
      thumbnailMedia: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 24,
  });

  return items.map(mapNews);
}

export async function getPublicNewsDetail(slug: string) {
  const item = await prisma.news.findFirst({
    where: {
      slug,
      status: "published",
    },
    include: {
      thumbnailMedia: true,
    },
  });

  if (!item) {
    throw new Error("News not found");
  }

  return mapNews(item);
}