export type CreateLeadActivityInput = {
  activityType: "call" | "note" | "meeting" | "visit" | "zalo" | "email";
  note?: string;
};