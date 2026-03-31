import api from "../../services/api";
import type { LeadItem } from "../leads/leads.api";
import type { ProjectItem } from "../projects/projects.api";
import type { PropertyItem } from "../properties/properties.api";

export type DashboardSummary = {
  totals: {
    users: number;
    leads: number;
    projects: number;
    properties: number;
    media: number;
  };
  leads: {
    new: number;
    qualified: number;
    converted: number;
    lost: number;
  };
  properties: {
    available: number;
    reserved: number;
    sold: number;
    hidden: number;
  };
  latest: {
    leads: LeadItem[];
    projects: ProjectItem[];
    properties: PropertyItem[];
  };
};

export async function getDashboardSummaryApi(): Promise<DashboardSummary> {
  const response = await api.get("/dashboard/summary");
  return response.data?.data;
}