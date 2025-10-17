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
  tasks: string[];
  users: ApiUser[];
  createdAt: string;
  updatedAt: string;
};

export type CreateClassroomPayload = {
  name: string;
  programmingLanguage?: string | null;
  lockLanguage?: boolean | null;
  tasks: string[];
};

export type UpdateClassroomPayload = {
  name: string;
  programmingLanguage: string | null;
  lockLanguage: boolean | null;
  tasks: string[];
};

export type ApiAccount = AuthAccount;

export type ClassroomUserForm = {
  name: string;
  npm: string;
};

export type ManagedUserForm = {
  name: string;
  npm: string;
};
