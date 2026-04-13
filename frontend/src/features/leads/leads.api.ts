import api from "../../services/api";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted"
  | "lost";

export type LeadItem = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  source: string | null;
  channel: string | null;
  status: LeadStatus;
  note: string | null;
  interestedProject: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdByUser: {
    id: string;
    email: string | null;
    phone: string | null;
  } | null;
  latestAssignment: {
    assignedToUserId: string;
    assignedToUserEmail: string | null;
    assignedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export async function getLeadsApi(params?: {
  status?: LeadStatus;
  keyword?: string;
  source?: string;
  assignedToUserId?: string;
  page?: number;
  pageSize?: number;
}) {
  const response = await api.get("/leads", { params });
  return response.data as {
    success: boolean;
    message: string;
    data: {
      items: LeadItem[];
      pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
      };
    };
  };
}

export async function createLeadApi(payload: {
  fullName: string;
  phone: string;
  email?: string;
  source?: string;
  channel?: string;
  note?: string;
  interestedProjectId?: string;
}) {
  const response = await api.post("/public/leads", payload);
  return response.data as {
    success: boolean;
    message: string;
    data: LeadItem;
  };
}

export async function updateLeadApi(
  leadId: string,
  payload: {
    fullName?: string;
    phone?: string;
    email?: string;
    source?: string;
    channel?: string;
    note?: string;
    interestedProjectId?: string | null;
    status?: LeadStatus;
  }
) {
  const response = await api.patch(`/leads/${leadId}`, payload);
  return response.data;
}

export async function updateLeadStatusApi(
  leadId: string,
  payload: { status: LeadStatus }
) {
  const response = await api.patch(`/leads/${leadId}/status`, payload);
  return response.data;
}

export async function assignLeadApi(
  leadId: string,
  payload: { assignedToUserId: string; note?: string }
) {
  const response = await api.post(`/leads/${leadId}/assign`, payload);
  return response.data;
}

export async function deleteLeadApi(leadId: string) {
  const response = await api.delete(`/leads/${leadId}`);
  return response.data;
}

export type LeadDetailItem = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  source: string | null;
  channel: string | null;
  status: LeadStatus;
  note: string | null;
  interestedProject: {
    id: string;
    name: string;
    slug: string;
  } | null;
  customerProfile: {
    id: string;
    fullName: string;
  } | null;
  createdByUser: {
    id: string;
    email: string | null;
    phone: string | null;
  } | null;
  assignments: Array<{
    id: string;
    assignedAt: string;
    note: string | null;
    assignedToUser: {
      id: string;
      email: string | null;
      phone: string | null;
    };
    assignedByUser: {
      id: string;
      email: string | null;
      phone: string | null;
    } | null;
  }>;
  activities: Array<{
    id: string;
    activityType: "call" | "note" | "meeting" | "visit" | "zalo" | "email" | "sms";
    content: string;
    activityAt: string;
    createdAt: string;
    user: {
      id: string;
      email: string | null;
      phone: string | null;
    };
  }>;
  createdAt: string;
  updatedAt: string;
};

export async function getLeadDetailApi(leadId: string) {
  const response = await api.get(`/leads/${leadId}`);
  return response.data as {
    success: boolean;
    message: string;
    data: LeadDetailItem;
  };
}