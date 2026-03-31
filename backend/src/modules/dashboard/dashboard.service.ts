import prisma from "../../configs/prisma.js";

export async function getDashboardSummary() {
  const [
    totalUsers,
    totalLeads,
    totalProjects,
    totalProperties,
    totalMedia,
    newLeads,
    qualifiedLeads,
    convertedLeads,
    lostLeads,
    availableProperties,
    reservedProperties,
    soldProperties,
    hiddenProperties,
    latestLeads,
    latestProjects,
    latestProperties,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.project.count(),
    prisma.property.count(),
    prisma.mediaFile.count(),

    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { status: "qualified" } }),
    prisma.lead.count({ where: { status: "converted" } }),
    prisma.lead.count({ where: { status: "lost" } }),

    prisma.property.count({ where: { inventoryStatus: "available" } }),
    prisma.property.count({ where: { inventoryStatus: "reserved" } }),
    prisma.property.count({ where: { inventoryStatus: "sold" } }),
    prisma.property.count({ where: { inventoryStatus: "hidden" } }),

    prisma.lead.findMany({
      include: {
        interestedProject: true,
        createdByUser: true,
        assignments: {
          include: {
            assignedToUser: true,
          },
          orderBy: { assignedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.project.findMany({
      include: {
        thumbnailMedia: true,
        _count: {
          select: {
            properties: true,
            leads: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    prisma.property.findMany({
      include: {
        project: true,
        images: {
          include: {
            mediaFile: true,
          },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    totals: {
      users: totalUsers,
      leads: totalLeads,
      projects: totalProjects,
      properties: totalProperties,
      media: totalMedia,
    },
    leads: {
      new: newLeads,
      qualified: qualifiedLeads,
      converted: convertedLeads,
      lost: lostLeads,
    },
    properties: {
      available: availableProperties,
      reserved: reservedProperties,
      sold: soldProperties,
      hidden: hiddenProperties,
    },
    latest: {
      leads: latestLeads.map((lead) => ({
        id: lead.id.toString(),
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        channel: lead.channel,
        status: lead.status,
        note: lead.note,
        interestedProject: lead.interestedProject
          ? {
              id: lead.interestedProject.id.toString(),
              name: lead.interestedProject.name,
              slug: lead.interestedProject.slug,
            }
          : null,
        createdByUser: lead.createdByUser
          ? {
              id: lead.createdByUser.id.toString(),
              email: lead.createdByUser.email,
              phone: lead.createdByUser.phone,
            }
          : null,
        latestAssignment: lead.assignments[0]
          ? {
              assignedToUserId: lead.assignments[0].assignedToUser.id.toString(),
              assignedToUserEmail: lead.assignments[0].assignedToUser.email,
              assignedAt: lead.assignments[0].assignedAt,
            }
          : null,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      })),

      projects: latestProjects.map((project) => ({
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

      properties: latestProperties.map((property) => ({
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
    },
  };
}