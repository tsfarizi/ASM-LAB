import { ApiAccount } from "./types";

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const roleLabel: Record<ApiAccount["role"], string> = {
  admin: "Admin",
  user: "User",
};
