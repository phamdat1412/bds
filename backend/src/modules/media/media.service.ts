import prisma from "../../configs/prisma.js";
import { removeStoredFile, uploadFile } from "../../services/storage/storage.service.js";
import { MediaListQuery } from "./media.types.js";

export async function createMedia(
  file: Express.Multer.File,
  currentUserId: string
) {
  const stored = await uploadFile(file);

  const media = await prisma.mediaFile.create({
    data: {
      disk: stored.disk,
      fileName: stored.fileName,
      originalName: stored.originalName,
      mimeType: stored.mimeType,
      extension: stored.extension,
      sizeBytes: BigInt(stored.sizeBytes),
      pathKey: stored.pathKey,
      url: stored.url,
      uploadedByUserId: BigInt(currentUserId),
    },
  });

  return mapMedia(media);
}

export async function listMedia(query: MediaListQuery) {
  const keyword = query.keyword?.trim() || undefined;
  const uploadedByUserId = query.uploadedByUserId
    ? BigInt(query.uploadedByUserId)
    : undefined;

  const items = await prisma.mediaFile.findMany({
    where: {
      ...(uploadedByUserId ? { uploadedByUserId } : {}),
      ...(query.mimeType ? { mimeType: { contains: query.mimeType } } : {}),
      ...(keyword
        ? {
            OR: [
              { fileName: { contains: keyword } },
              { originalName: { contains: keyword } },
              { pathKey: { contains: keyword } },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map(mapMedia);
}

export async function deleteMedia(mediaId: string) {
  const media = await prisma.mediaFile.findUnique({
    where: { id: BigInt(mediaId) },
  });

  if (!media) {
    throw new Error("Media file not found");
  }

  await removeStoredFile(media.disk, media.pathKey);

  await prisma.mediaFile.delete({
    where: { id: BigInt(mediaId) },
  });

  return {
    id: media.id.toString(),
    pathKey: media.pathKey,
    deleted: true,
  };
}

function mapMedia(media: {
  id: bigint;
  disk: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  extension: string | null;
  sizeBytes: bigint;
  pathKey: string;
  url: string;
  uploadedByUserId: bigint | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: media.id.toString(),
    disk: media.disk,
    fileName: media.fileName,
    originalName: media.originalName,
    mimeType: media.mimeType,
    extension: media.extension,
    sizeBytes: media.sizeBytes.toString(),
    pathKey: media.pathKey,
    url: media.url,
    uploadedByUserId: media.uploadedByUserId?.toString() || null,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
  };
}