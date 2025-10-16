import { type Account as AuthAccount } from "@/contexts/auth-context";

export type ApiUser = {
  id: number;
  name: string;
  npm: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiClassroom = {
  id: number;
  name: string;
  programmingLanguage: string | null;
  languageLocked: boolean;
  users: ApiUser[];
  createdAt: string;
  updatedAt: string;
};

export type ApiAccount = AuthAccount;

export type ClassroomUserForm = {
  name: string;
  npm: string;
  code: string;
};
