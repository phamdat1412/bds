import prisma from "../../configs/prisma.js";
import {
  CreateProjectInput,
  ProjectListQuery,
  UpdateProjectInput,
} from "./projects.types.js";

export async function createProject(input: CreateProjectInput) {
  const slug = input.slug.trim().toLowerCase();

  const existingSlug = await prisma.project.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    throw new Error("Project slug already exists");
  }

  let thumbnailMediaId: bigint | null = null;

  if (input.thumbnailMediaId) {
    const media = await prisma.mediaFile.findUnique({
      where: { id: BigInt(input.thumbnailMediaId) },
    });

    if (!media) {
      throw new Error("Media file not found");
    }

    thumbnailMediaId = media.id;
  }

  const project = await prisma.project.create({
    data: {
      name: input.name.trim(),
      slug,
      developerName: input.developerName?.trim() || null,
      locationText: input.locationText?.trim() || null,
      city: input.city?.trim() || null,
      district: input.district?.trim() || null,
      projectType: input.projectType?.trim() || null,
      status: input.status || "draft",
      shortDescription: input.shortDescription?.trim() || null,
      description: input.description?.trim() || null,
      thumbnailMediaId,
    },
    include: {
      thumbnailMedia: true,
    },
  });

  return mapProject(project);
}

// export async function listProjects(query: ProjectListQuery) {
//   const keyword = query.keyword?.trim() || undefined;

//   const projects = await prisma.project.findMany({
//     where: {
//       ...(query.status ? { status: query.status } : {}),
//       ...(query.city ? { city: query.city } : {}),
//       ...(query.district ? { district: query.district } : {}),
//       ...(keyword
//         ? {
//             OR: [
//               { name: { contains: keyword } },
//               { slug: { contains: keyword } },
//               { developerName: { contains: keyword } },
//               { locationText: { contains: keyword } },
//             ],
//           }
//         : {}),
//     },
//     include: {
//       thumbnailMedia: true,
//       _count: {
//         select: {
//           properties: true,
//           leads: true,
//         },
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return projects.map((project) => ({
//     id: project.id.toString(),
//     name: project.name,
//     slug: project.slug,
//     developerName: project.developerName,
//     locationText: project.locationText,
//     city: project.city,
//     district: project.district,
//     projectType: project.projectType,
//     status: project.status,
//     shortDescription: project.shortDescription,
//     thumbnailMedia: project.thumbnailMedia
//       ? {
//           id: project.thumbnailMedia.id.toString(),
//           url: project.thumbnailMedia.url,
//           originalName: project.thumbnailMedia.originalName,
//         }
//       : null,
//     propertyCount: project._count.properties,
//     leadCount: project._count.leads,
//     createdAt: project.createdAt,
//     updatedAt: project.updatedAt,
//   }));
// }

import { buildPaginationMeta } from "../../utils/pagination.js";

export async function listProjects(query: ProjectListQuery) {
  const keyword = query.keyword?.trim() || undefined;
  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.city ? { city: query.city } : {}),
    ...(query.district ? { district: query.district } : {}),
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { slug: { contains: keyword } },
            { developerName: { contains: keyword } },
            { locationText: { contains: keyword } },
          ],
        }
      : {}),
  };

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
      take,
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
//
export async function getProjectDetail(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: BigInt(projectId) },
    include: {
      thumbnailMedia: true,
      properties: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
      leads: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
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
          mimeType: project.thumbnailMedia.mimeType,
        }
      : null,
    propertyCount: project._count.properties,
    leadCount: project._count.leads,
    properties: project.properties.map((item) => ({
      id: item.id.toString(),
      code: item.code,
      title: item.title,
      propertyType: item.propertyType,
      inventoryStatus: item.inventoryStatus,
      price: item.price ? item.price.toString() : null,
      createdAt: item.createdAt,
    })),
    leads: project.leads.map((item) => ({
      id: item.id.toString(),
      fullName: item.fullName,
      phone: item.phone,
      email: item.email,
      status: item.status,
      createdAt: item.createdAt,
    })),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
) {
  const existingProject = await prisma.project.findUnique({
    where: { id: BigInt(projectId) },
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  let slug: string | undefined = undefined;

  if (input.slug) {
    slug = input.slug.trim().toLowerCase();

    const duplicatedSlug = await prisma.project.findFirst({
      where: {
        slug,
        NOT: {
          id: BigInt(projectId),
        },
      },
    });

    if (duplicatedSlug) {
      throw new Error("Project slug already exists");
    }
  }

  let thumbnailMediaId: bigint | null | undefined = undefined;

  if (input.thumbnailMediaId === null) {
    thumbnailMediaId = null;
  } else if (input.thumbnailMediaId) {
    const media = await prisma.mediaFile.findUnique({
      where: { id: BigInt(input.thumbnailMediaId) },
    });

    if (!media) {
      throw new Error("Media file not found");
    }

    thumbnailMediaId = media.id;
  }


  const updatedProject = await prisma.project.update({
    where: { id: BigInt(projectId) },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(input.developerName !== undefined
        ? { developerName: input.developerName?.trim() || null }
        : {}),
      ...(input.locationText !== undefined
        ? { locationText: input.locationText?.trim() || null }
        : {}),
      ...(input.city !== undefined ? { city: input.city?.trim() || null } : {}),
      ...(input.district !== undefined
        ? { district: input.district?.trim() || null }
        : {}),
      ...(input.projectType !== undefined
        ? { projectType: input.projectType?.trim() || null }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.shortDescription !== undefined
        ? { shortDescription: input.shortDescription?.trim() || null }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(thumbnailMediaId !== undefined ? { thumbnailMediaId } : {}),
    },
    include: {
      thumbnailMedia: true,
    },
  });

  return mapProject(updatedProject);
}
export async function deleteProject(projectId: string) {
  const existingProject = await prisma.project.findUnique({
    where: { id: BigInt(projectId) },
    include: {
      _count: {
        select: {
          properties: true,
          leads: true,
        },
      },
    },
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  if (existingProject._count.properties > 0) {
    throw new Error("Cannot delete project with existing properties");
  }

  await prisma.project.delete({
    where: { id: BigInt(projectId) },
  });

  return {
    id: projectId,
    deleted: true,
  };
}
function mapProject(project: {
  id: bigint;
  name: string;
  slug: string;
  developerName: string | null;
  locationText: string | null;
  city: string | null;
  district: string | null;
  projectType: string | null;
  status: "draft" | "published" | "hidden";
  shortDescription: string | null;
  description: string | null;
  thumbnailMedia?: {
    id: bigint;
    url: string;
    originalName: string;
    mimeType: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}) {
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
          mimeType: project.thumbnailMedia.mimeType,
        }
      : null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}