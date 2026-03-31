export type CreateLeadInput = {
  fullName: string;
  phone: string;
  email?: string;
  source?: string;
  channel?: string;
  note?: string;
  interestedProjectId?: string;
};

export type UpdateLeadStatusInput = {
  status: "new" | "contacted" | "qualified" | "unqualified" | "converted" | "lost";
};

export type AssignLeadInput = {
  assignedToUserId: string;
  note?: string;
};

export type CreateLeadActivityInput = {
  activityType: "call" | "meeting" | "note" | "sms" | "email" | "zalo" | "visit";
  content: string;
  activityAt?: string;
};

export type LeadListQuery = {
  status?: "new" | "contacted" | "qualified" | "unqualified" | "converted" | "lost";
  source?: string;
  keyword?: string;
  assignedToUserId?: string;
  page?: number;
  pageSize?: number;
};
export type UpdateLeadInput = {
  fullName?: string;
  phone?: string;
  email?: string;
  source?: string;
  channel?: string;
  note?: string;
  interestedProjectId?: string | null;
  status?: "new" | "contacted" | "qualified" | "unqualified" | "converted" | "lost";
};