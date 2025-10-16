import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AUTH_STORAGE_KEY = "asm-lab-account";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

type AccountRole = "user" | "admin";

export type Account = {
  id: number;
  npm: string;
  role: AccountRole;
  createdAt: string;
  updatedAt: string;
};

type LoginPayload = {
  npm: string;
  asAdmin?: boolean;
};

type LoginResponse = {
  account: Account;
  isNew: boolean;
};

type AuthContextValue = {
  account: Account | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  syncAccount: (account: Account | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const cached = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (cached) {
        const parsed: Account = JSON.parse(cached);
        setAccount(parsed);
      }
    } catch (error) {
      console.error("Failed to restore session", error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncAccount = useCallback((next: Account | null) => {
    setAccount(next);
    if (next) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async ({ npm, asAdmin }: LoginPayload) => {
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

    const payload: LoginResponse = await response.json();

    syncAccount(payload.account);

    return payload;
  }, [syncAccount]);

  const logout = useCallback(() => {
    syncAccount(null);
  }, [syncAccount]);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      isLoading,
      login,
      logout,
      syncAccount,
    }),
    [account, isLoading, login, logout, syncAccount],
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
