import prisma from "../../configs/prisma.js";
import type { CreateLeadActivityInput } from "./lead-activities.types.js";

function mapLeadActivity(item: any) {
  return {
    id: item.id.toString(),
    leadId: item.leadId.toString(),
    activityType: item.activityType,
    note: item.note,
    createdAt: item.createdAt,
    createdByUser: {
      id: item.createdByUser.id.toString(),
      email: item.createdByUser.email,
      phone: item.createdByUser.phone,
    },
  };
}

export async function listLeadActivities(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: BigInt(leadId) },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const items = await prisma.leadActivity.findMany({
    where: {
      leadId: BigInt(leadId),
    },
    include: {
      createdByUser: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map(mapLeadActivity);
}

export async function createLeadActivity(
  leadId: string,
  userId: string,
  input: CreateLeadActivityInput
) {
  const lead = await prisma.lead.findUnique({
    where: { id: BigInt(leadId) },
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const item = await prisma.leadActivity.create({
    data: {
      leadId: BigInt(leadId),
      createdByUserId: BigInt(userId),
      activityType: input.activityType,
      note: input.note?.trim() || null,
    },
    include: {
      createdByUser: true,
    },
  });

  return mapLeadActivity(item);
}