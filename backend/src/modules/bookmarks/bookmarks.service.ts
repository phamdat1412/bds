import prisma from "../../configs/prisma.js";

function mapBookmark(item: any) {
  return {
    id: item.id.toString(),
    createdAt: item.createdAt,
    project: {
      id: item.project.id.toString(),
      name: item.project.name,
      slug: item.project.slug,
      developerName: item.project.developerName,
      locationText: item.project.locationText,
      city: item.project.city,
      district: item.project.district,
      projectType: item.project.projectType,
      status: item.project.status,
      shortDescription: item.project.shortDescription,
      thumbnailMedia: item.project.thumbnailMedia
        ? {
            id: item.project.thumbnailMedia.id.toString(),
            url: item.project.thumbnailMedia.url,
            originalName: item.project.thumbnailMedia.originalName,
          }
        : null,
    },
  };
}

export async function listMyProjectBookmarks(userId: string) {
  const items = await prisma.projectBookmark.findMany({
    where: {
      userId: BigInt(userId),
    },
    include: {
      project: {
        include: {
          thumbnailMedia: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map(mapBookmark);
}

export async function toggleProjectBookmark(
  userId: string,
  projectId: string
) {
  const project = await prisma.project.findUnique({
    where: { id: BigInt(projectId) },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const existing = await prisma.projectBookmark.findFirst({
    where: {
      userId: BigInt(userId),
      projectId: BigInt(projectId),
    },
  });

  if (existing) {
    await prisma.projectBookmark.delete({
      where: { id: existing.id },
    });

    return {
      bookmarked: false,
      projectId,
    };
  }

  const created = await prisma.projectBookmark.create({
    data: {
      userId: BigInt(userId),
      projectId: BigInt(projectId),
    },
  });

  return {
    bookmarked: true,
    bookmarkId: created.id.toString(),
    projectId,
  };
}

export async function getProjectBookmarkStatus(
  userId: string,
  projectId: string
) {
  const existing = await prisma.projectBookmark.findFirst({
    where: {
      userId: BigInt(userId),
      projectId: BigInt(projectId),
    },
  });

  return {
    bookmarked: Boolean(existing),
    projectId,
  };
}