import { API_BASE_URL } from "@/constants/api";

export const CODE_STORAGE_PREFIX = "lab-editor-code";
export const SUBMISSION_ENDPOINT = `${API_BASE_URL}/api/judge0/submissions`;
export const isBrowser = typeof window !== "undefined";

export const getCodeStorageKey = (languageId: number) =>
  `${CODE_STORAGE_PREFIX}-${languageId}`;
