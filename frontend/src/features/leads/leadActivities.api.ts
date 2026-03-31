import api from "../../services/api";

export type LeadActivityItem = {
  id: string;
  leadId: string;
  activityType: "call" | "note" | "meeting" | "visit" | "zalo" | "email";
  note: string | null;
  createdAt: string;
  createdByUser: {
    id: string;
    email: string | null;
    phone: string | null;
  };
};

export async function getLeadActivitiesApi(leadId: string) {
  const response = await api.get(`/leads/${leadId}/activities`);
  return response.data as {
    success: boolean;
    message: string;
    data: LeadActivityItem[];
  };
}

export async function createLeadActivityApi(
  leadId: string,
  payload: {
    activityType: "call" | "note" | "meeting" | "visit" | "zalo" | "email";
    note?: string;
  }
) {
  const response = await api.post(`/leads/${leadId}/activities`, payload);
  return response.data as {
    success: boolean;
    message: string;
    data: LeadActivityItem;
  };
}