import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { API_BASE_URL } from "@/constants/api";

const AUTH_STORAGE_KEY = "asm-lab-account";

type AccountRole = "user" | "admin";

export type Account = {
  id: number;
  npm: string;
  role: AccountRole;
  createdAt: string;
  updatedAt: string;
};

export type ClassroomUser = {
  id: number;
  name: string;
  npm: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ClassroomInfo = {
  id: number;
  name: string;
  programmingLanguage: string | null;
  languageLocked: boolean;
  tasks: string[];
  createdAt?: string;
  updatedAt?: string;
  user: ClassroomUser | null;
};

type LoginPayload = {
  npm: string;
  asAdmin?: boolean;
};

type RawLoginResponse = {
  account: Account;
  isNew: boolean;
  classroom?: unknown;
};

type LoginResponse = {
  account: Account;
  isNew: boolean;
  classroom: ClassroomInfo | null;
};

type AuthState = {
  account: Account | null;
  classroom: ClassroomInfo | null;
};

type AuthContextValue = {
  account: Account | null;
  classroom: ClassroomInfo | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  syncAccount: (account: Account | null) => void;
  syncClassroom: (
    classroom: ClassroomInfo | null | ((prev: ClassroomInfo | null) => ClassroomInfo | null),
  ) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeClassroom = (value: unknown): ClassroomInfo | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = Number.parseInt(String(value.id ?? ""), 10);
  if (!Number.isFinite(id)) {
    return null;
  }

  const languageLocked = Boolean(value.languageLocked);
  const programmingLanguage =
    typeof value.programmingLanguage === "string"
      ? value.programmingLanguage
      : null;
  const rawTasks = Array.isArray(value.tasks)
    ? value.tasks.filter((task): task is string => typeof task === "string")
    : [];
  const tasks = rawTasks.map((task) => task.trim()).filter((task) => task.length > 0);

  const userValue = value.user;
  let user: ClassroomInfo["user"] = null;
  if (isRecord(userValue)) {
    const userId = Number.parseInt(String(userValue.id ?? ""), 10);
    if (Number.isFinite(userId)) {
      user = {
        id: userId,
        name: typeof userValue.name === "string" ? userValue.name : "",
        npm: typeof userValue.npm === "string" ? userValue.npm : "",
        code: typeof userValue.code === "string" ? userValue.code : "",
        createdAt:
          typeof userValue.createdAt === "string" ? userValue.createdAt : undefined,
        updatedAt:
          typeof userValue.updatedAt === "string" ? userValue.updatedAt : undefined,
      };
    }
  }

  return {
    id,
    name: typeof value.name === "string" ? value.name : String(id),
    programmingLanguage,
    languageLocked,
    tasks,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
    user,
  };
};

const normalizeStoredState = (value: unknown): AuthState | null => {
  if (!isRecord(value)) {
    return null;
  }

  if ("account" in value || "classroom" in value) {
    const accountValue = value.account;
    const account = isRecord(accountValue) ? (accountValue as Account) : null;

    return {
      account,
      classroom: normalizeClassroom(value.classroom),
    };
  }

  const id = Number.parseInt(String(value.id ?? ""), 10);
  const role = value.role;
  if (Number.isFinite(id) && typeof role === "string") {
    const account: Account = {
      id,
      npm: typeof value.npm === "string" ? value.npm : "",
      role: role as AccountRole,
      createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    };
    return {
      account,
      classroom: null,
    };
  }

  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ account: null, classroom: null });
  const [isLoading, setIsLoading] = useState(true);

  const persistState = useCallback((next: AuthState) => {
    if (next.account) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    try {
      const cached = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as unknown;
        const normalized = normalizeStoredState(parsed);
        if (normalized) {
          setState(normalized);
          persistState(normalized);
        }
      }
    } catch (error) {
      console.error("Failed to restore session", error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setState({ account: null, classroom: null });
    } finally {
      setIsLoading(false);
    }
  }, [persistState]);

  const applyState = useCallback(
    (
      updater: AuthState | ((previous: AuthState) => AuthState),
    ) => {
      setState((previous) => {
        const next =
          typeof updater === "function"
            ? (updater as (previous: AuthState) => AuthState)(previous)
            : updater;

        persistState(next);
        return next;
      });
    },
    [persistState],
  );

  const syncAccount = useCallback(
    (nextAccount: Account | null) => {
      applyState((previous) => ({
        account: nextAccount,
        classroom: nextAccount ? previous.classroom : null,
      }));
    },
    [applyState],
  );

  const syncClassroom = useCallback(
    (
      nextClassroom:
        | ClassroomInfo
        | null
        | ((prev: ClassroomInfo | null) => ClassroomInfo | null),
    ) => {
      applyState((previous) => {
        if (!previous.account) {
          return { account: null, classroom: null };
        }

        const classroomValue =
          typeof nextClassroom === "function"
            ? (nextClassroom as (prev: ClassroomInfo | null) => ClassroomInfo | null)(
                previous.classroom,
              )
            : nextClassroom;

        return {
          account: previous.account,
          classroom: classroomValue,
        };
      });
    },
    [applyState],
  );

  const login = useCallback(
    async ({ npm, asAdmin }: LoginPayload) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          npm,
          asAdmin: Boolean(asAdmin),
        }),
      });

      if (!response.ok) {
        const message = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(message?.message ?? "Gagal melakukan login.");
      }

      const rawPayload: RawLoginResponse = await response.json();
      const normalizedClassroom = normalizeClassroom(rawPayload.classroom);

      const payload: LoginResponse = {
        account: rawPayload.account,
        isNew: rawPayload.isNew,
        classroom: normalizedClassroom,
      };

      if (payload.isNew && !normalizedClassroom) {
        try {
          await fetch(`${API_BASE_URL}/api/accounts/${payload.account.id}`, {
            method: "DELETE",
          });
        } catch (cleanupError) {
          console.warn("Failed to rollback orphan account", cleanupError);
        }
        throw new Error(
          "NPM tidak ditemukan dalam daftar user maupun peserta classroom. Hubungi admin untuk didaftarkan.",
        );
      }

      applyState({ account: payload.account, classroom: payload.classroom });

      return payload;
    },
    [applyState],
  );

  const logout = useCallback(() => {
    applyState({ account: null, classroom: null });
  }, [applyState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      account: state.account,
      classroom: state.classroom,
      isLoading,
      login,
      logout,
      syncAccount,
      syncClassroom,
    }),
    [state.account, state.classroom, isLoading, login, logout, syncAccount, syncClassroom],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
