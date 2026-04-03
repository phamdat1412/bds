import prisma from "../../configs/prisma.js";
import { buildPaginationMeta } from "../../utils/pagination.js";
import type {
  AssignLeadInput,
  CreateLeadActivityInput,
  CreateLeadInput,
  LeadListQuery,
  UpdateLeadInput,
  UpdateLeadStatusInput,
} from "./leads.types.js";

type LeadActor = {
  userId: string;
  roles?: string[];
};

function isAdmin(actor: LeadActor) {
  return (actor.roles || []).includes("admin");
}

function isSeller(actor: LeadActor) {
  return (actor.roles || []).includes("seller");
}

async function ensureLeadAccessible(leadId: string, actor: LeadActor) {
  const leadIdBigInt = BigInt(leadId);

  const lead = await prisma.lead.findUnique({
    where: { id: leadIdBigInt },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (isAdmin(actor)) {
    return lead;
  }

  const assignment = await prisma.leadAssignment.findFirst({
    where: {
      leadId: leadIdBigInt,
      assignedToUserId: BigInt(actor.userId),
    },
  });

  if (!assignment) {
    throw new Error("Forbidden");
  }

  return lead;
}

function mapLeadDetail(lead: {
  id: bigint;
  fullName: string;
  phone: string;
  email: string | null;
  source: string | null;
  channel: string | null;
  status: string;
  note: string | null;
  interestedProject?: { id: bigint; name: string; slug: string } | null;
  createdByUser?: { id: bigint; email: string | null; phone: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
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
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export async function createLead(
  input: CreateLeadInput,
  actor: LeadActor
) {
  let interestedProjectIdBigInt: bigint | undefined = undefined;

  if (input.interestedProjectId) {
    const project = await prisma.project.findUnique({
      where: { id: BigInt(input.interestedProjectId) },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    interestedProjectIdBigInt = project.id;
  }

  const result = await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.create({
      data: {
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim().toLowerCase() || null,
        source: input.source?.trim() || null,
        channel: input.channel?.trim() || null,
        note: input.note?.trim() || null,
        interestedProjectId: interestedProjectIdBigInt,
        createdByUserId: BigInt(actor.userId),
        status: "new",
      },
      include: {
        interestedProject: true,
        createdByUser: true,
      },
    });

    if (isSeller(actor)) {
      await tx.leadAssignment.create({
        data: {
          leadId: lead.id,
          assignedToUserId: BigInt(actor.userId),
          assignedByUserId: BigInt(actor.userId),
          assignedAt: new Date(),
          note: "Auto assigned to creator",
        },
      });
    }

    return lead;
  });

  return mapLeadDetail(result);
}

export async function listLeads(
  query: LeadListQuery,
  actor: LeadActor
) {
  const keyword = query.keyword?.trim() || undefined;
  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const forcedAssignedToUserId = isSeller(actor)
    ? BigInt(actor.userId)
    : query.assignedToUserId
    ? BigInt(query.assignedToUserId)
    : undefined;

  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.source ? { source: query.source } : {}),
    ...(keyword
      ? {
          OR: [
            { fullName: { contains: keyword } },
            { phone: { contains: keyword } },
            { email: { contains: keyword } },
          ],
        }
      : {}),
    ...(forcedAssignedToUserId
      ? {
          assignments: {
            some: {
              assignedToUserId: forcedAssignedToUserId,
            },
          },
        }
      : {}),
  };

  const [leads, totalItems] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        interestedProject: true,
        createdByUser: true,
        assignments: {
          include: {
            assignedToUser: true,
            assignedByUser: true,
          },
          orderBy: {
            assignedAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    items: leads.map((lead) => ({
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
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function getLeadDetail(leadId: string, actor: LeadActor) {
  await ensureLeadAccessible(leadId, actor);

  const lead = await prisma.lead.findUnique({
    where: { id: BigInt(leadId) },
    include: {
      interestedProject: true,
      createdByUser: true,
      customerProfile: true,
      assignments: {
        include: {
          assignedToUser: true,
          assignedByUser: true,
        },
        orderBy: {
          assignedAt: "desc",
        },
      },
      activities: {
        include: {
          user: true,
        },
        orderBy: {
          activityAt: "desc",
        },
      },
    },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  return {
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
    customerProfile: lead.customerProfile
      ? {
          id: lead.customerProfile.id.toString(),
          fullName: lead.customerProfile.fullName,
        }
      : null,
    createdByUser: lead.createdByUser
      ? {
          id: lead.createdByUser.id.toString(),
          email: lead.createdByUser.email,
          phone: lead.createdByUser.phone,
        }
      : null,
    assignments: lead.assignments.map((item) => ({
      id: item.id.toString(),
      assignedToUser: {
        id: item.assignedToUser.id.toString(),
        email: item.assignedToUser.email,
        phone: item.assignedToUser.phone,
      },
      assignedByUser: item.assignedByUser
        ? {
            id: item.assignedByUser.id.toString(),
            email: item.assignedByUser.email,
            phone: item.assignedByUser.phone,
          }
        : null,
      assignedAt: item.assignedAt,
      note: item.note,
    })),
    activities: lead.activities.map((item) => ({
      id: item.id.toString(),
      activityType: item.activityType,
      content: item.content,
      activityAt: item.activityAt,
      createdAt: item.createdAt,
      user: {
        id: item.user.id.toString(),
        email: item.user.email,
        phone: item.user.phone,
      },
    })),
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

export async function updateLeadStatus(
  leadId: string,
  input: UpdateLeadStatusInput,
  actor: LeadActor
) {
  await ensureLeadAccessible(leadId, actor);

  const updatedLead = await prisma.lead.update({
    where: { id: BigInt(leadId) },
    data: {
      status: input.status,
    },
    include: {
      interestedProject: true,
      createdByUser: true,
    },
  });

  return mapLeadDetail(updatedLead);
}

export async function assignLead(
  leadId: string,
  input: AssignLeadInput,
  currentUserId: string
) {
  const lead = await prisma.lead.findUnique({
    where: { id: BigInt(leadId) },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const assignedUser = await prisma.user.findUnique({
    where: { id: BigInt(input.assignedToUserId) },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!assignedUser) {
    throw new Error("Assigned user not found");
  }

  if (assignedUser.userType !== "staff") {
    throw new Error("Assigned user must be staff");
  }

  const hasAllowedRole = assignedUser.roles.some((item) =>
    ["seller", "admin"].includes(item.role.code)
  );

  if (!hasAllowedRole) {
    throw new Error("Assigned user must be seller or admin");
  }

  const assignment = await prisma.leadAssignment.create({
    data: {
      leadId: BigInt(leadId),
      assignedToUserId: BigInt(input.assignedToUserId),
      assignedByUserId: BigInt(currentUserId),
      assignedAt: new Date(),
      note: input.note?.trim() || null,
    },
    include: {
      assignedToUser: true,
      assignedByUser: true,
      lead: true,
    },
  });

  return {
    id: assignment.id.toString(),
    leadId: assignment.lead.id.toString(),
    assignedToUser: {
      id: assignment.assignedToUser.id.toString(),
      email: assignment.assignedToUser.email,
      phone: assignment.assignedToUser.phone,
    },
    assignedByUser: assignment.assignedByUser
      ? {
          id: assignment.assignedByUser.id.toString(),
          email: assignment.assignedByUser.email,
          phone: assignment.assignedByUser.phone,
        }
      : null,
    assignedAt: assignment.assignedAt,
    note: assignment.note,
  };
}

export async function createLeadActivity(
  leadId: string,
  input: CreateLeadActivityInput,
  actor: LeadActor
) {
  await ensureLeadAccessible(leadId, actor);

  const activity = await prisma.activity.create({
    data: {
      leadId: BigInt(leadId),
      userId: BigInt(actor.userId),
      activityType: input.activityType,
      content: input.content.trim(),
      activityAt: input.activityAt ? new Date(input.activityAt) : new Date(),
    },
    include: {
      user: true,
      lead: true,
    },
  });

  return {
    id: activity.id.toString(),
    leadId: activity.lead?.id.toString() || null,
    activityType: activity.activityType,
    content: activity.content,
    activityAt: activity.activityAt,
    createdAt: activity.createdAt,
    user: {
      id: activity.user.id.toString(),
      email: activity.user.email,
      phone: activity.user.phone,
    },
  };
}

export async function updateLead(
  leadId: string,
  input: UpdateLeadInput,
  actor: LeadActor
) {
  await ensureLeadAccessible(leadId, actor);

  const existingLead = await prisma.lead.findUnique({
    where: { id: BigInt(leadId) },
  });

  if (!existingLead) {
    throw new Error("Lead not found");
  }

  let interestedProjectId: bigint | null | undefined = undefined;

  if (input.interestedProjectId === null) {
    interestedProjectId = null;
  } else if (input.interestedProjectId) {
    const project = await prisma.project.findUnique({
      where: { id: BigInt(input.interestedProjectId) },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    interestedProjectId = project.id;
  }

  const updatedLead = await prisma.lead.update({
    where: { id: BigInt(leadId) },
    data: {
      ...(input.fullName !== undefined ? { fullName: input.fullName.trim() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
      ...(input.email !== undefined
        ? { email: input.email?.trim().toLowerCase() || null }
        : {}),
      ...(input.source !== undefined ? { source: input.source?.trim() || null } : {}),
      ...(input.channel !== undefined ? { channel: input.channel?.trim() || null } : {}),
      ...(input.note !== undefined ? { note: input.note?.trim() || null } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(interestedProjectId !== undefined ? { interestedProjectId } : {}),
    },
    include: {
      interestedProject: true,
      createdByUser: true,
    },
  });

  return mapLeadDetail(updatedLead);
}

export async function deleteLead(leadId: string) {
  const existingLead = await prisma.lead.findUnique({
    where: { id: BigInt(leadId) },
    include: {
      assignments: true,
      activities: true,
    },
  });

  if (!existingLead) {
    throw new Error("Lead not found");
  }

  if (existingLead.assignments.length > 0 || existingLead.activities.length > 0) {
    throw new Error("Cannot delete lead with existing assignments or activities");
  }

  await prisma.lead.delete({
    where: { id: BigInt(leadId) },
  });

  return {
    id: leadId,
    deleted: true,
  };
}