import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import DefaultLayout from "@/layouts/default";

import { AccountSection } from "./components/AccountSection";
import { AccessLimited } from "./components/AccessLimited";
import { AdminHeader } from "./components/AdminHeader";
import { AdminLoginPrompt } from "./components/AdminLoginPrompt";
import { ClassroomSection } from "./components/ClassroomSection";
import { FirstAdminRegistration } from "./components/FirstAdminRegistration";
import { roleLabel } from "./utils";
import {
  ApiAccount,
  ApiClassroom,
  ClassroomUserForm,
  CreateClassroomPayload,
  ManagedUserForm,
  UpdateClassroomPayload,
} from "./types";

type AdminExistsResponse = {
  exists: boolean;
};

type ClassroomUserState = Record<number, ClassroomUserForm>;
type ClassroomUserErrors = Record<number, string | null>;
type ClassroomUserLoading = Record<number, boolean>;
type ManagedUserState = Record<number, ManagedUserForm>;
type ManagedUserErrors = Record<number, string | null>;
type ManagedUserSaving = Record<number, boolean>;
type ManagedUserDeleting = Record<number, boolean>;

// Backend validation requires the `code` field, so submit a single space
// placeholder when creating classroom users. The value is treated as empty on
// the client so admins still see a "Belum ada kode" hint until the user runs
// their first program.
const EMPTY_CODE_PLACEHOLDER = " ";

export const AdminPage = () => {
  const navigate = useNavigate();
  const { account, login, logout, syncAccount, isLoading: authLoading } = useAuth();
  const accountRef = useRef<ApiAccount | null>(account ?? null);

  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  const [classrooms, setClassrooms] = useState<ApiClassroom[]>([]);
  const [isClassroomLoading, setIsClassroomLoading] = useState(false);
  const [classroomError, setClassroomError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState("");
  const [newClassroomLanguageId, setNewClassroomLanguageId] = useState<number | null>(null);
  const [newClassroomLockLanguage, setNewClassroomLockLanguage] = useState(false);
  const [newClassroomTasks, setNewClassroomTasks] = useState<string[]>([""]);
  const [classroomFormError, setClassroomFormError] = useState<string | null>(null);
  const [classroomActionError, setClassroomActionError] = useState<string | null>(null);
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);
  const [editingClassroomId, setEditingClassroomId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingLanguageId, setEditingLanguageId] = useState<number | null>(null);
  const [editingLockLanguage, setEditingLockLanguage] = useState(false);
  const [editingTasks, setEditingTasks] = useState<string[]>([]);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [isSavingClassroom, setIsSavingClassroom] = useState(false);
  const [deletingClassroomId, setDeletingClassroomId] = useState<number | null>(null);

  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);

  const [firstAdminNpm, setFirstAdminNpm] = useState("");
  const [firstAdminError, setFirstAdminError] = useState<string | null>(null);
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false);

  const [newAccountNpm, setNewAccountNpm] = useState("");
  const [newAccountRole, setNewAccountRole] = useState<ApiAccount["role"]>("user");
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [classroomUserForms, setClassroomUserForms] = useState<ClassroomUserState>({});
  const [classroomUserErrors, setClassroomUserErrors] = useState<ClassroomUserErrors>({});
  const [classroomUserLoading, setClassroomUserLoading] = useState<ClassroomUserLoading>({});

  const [managedUserForms, setManagedUserForms] = useState<ManagedUserState>({});
  const [managedUserErrors, setManagedUserErrors] = useState<ManagedUserErrors>({});
  const [managedUserSaving, setManagedUserSaving] = useState<ManagedUserSaving>({});
  const [managedUserDeleting, setManagedUserDeleting] = useState<ManagedUserDeleting>({});

  const { languages } = useLanguage();

  const availableLanguages = useMemo(
    () => languages.filter((language) => !language.isArchived),
    [languages],
  );

  const archivedLanguages = useMemo(
    () => languages.filter((language) => language.isArchived),
    [languages],
  );

  const findLanguageByName = useCallback(
    (label: string | null | undefined) => {
      if (!label) {
        return null;
      }

      return (
        languages.find((language) => language.name === label) ??
        languages.find((language) => language.labLabel === label) ??
        languages.find((language) => language.shortName === label)
      ) ?? null;
    },
    [languages],
  );

  useEffect(() => {
    accountRef.current = account ?? null;
  }, [account]);

  const totalUsers = useMemo(
    () => classrooms.reduce((count, classroom) => count + classroom.users.length, 0),
    [classrooms],
  );

  const fetchAdminExists = useCallback(async () => {
    setAdminCheckError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin-exists`);
      if (!response.ok) {
        throw new Error(`Gagal memeriksa status admin (${response.status})`);
      }

      const data: AdminExistsResponse = await response.json();
      setAdminExists(data.exists);
    } catch (error) {
      setAdminCheckError(
        error instanceof Error ? error.message : "Tidak dapat mengecek status admin.",
      );
    }
  }, []);

  const fetchClassrooms = useCallback(async () => {
    setClassroomError(null);
    setIsClassroomLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/classrooms`);
      if (!response.ok) {
        throw new Error(`Gagal memuat data classroom (${response.status})`);
      }

      const data: ApiClassroom[] = await response.json();
      const normalizedClassrooms = data.map((classroom) => {
        const rawTasks = Array.isArray(classroom.tasks) ? classroom.tasks : [];
        return {
          ...classroom,
          tasks: rawTasks
            .map((task) => task.trim())
            .filter((task) => task.length > 0),
        };
      });
      setClassrooms(normalizedClassrooms);
      setManagedUserForms(
        normalizedClassrooms.reduce<ManagedUserState>((accumulator, classroom) => {
          classroom.users.forEach((user) => {
            accumulator[user.id] = { name: user.name, npm: user.npm };
          });
          return accumulator;
        }, {}),
      );
      const collectValidIds = () => {
        const validIds = new Set<number>();
        normalizedClassrooms.forEach((classroom) => {
          classroom.users.forEach((user) => {
            validIds.add(user.id);
          });
        });
        return validIds;
      };
      const validIds = collectValidIds();
      const pruneByValidIds = <T extends Record<number, unknown>>(state: T) => {
        const next = { ...state } as Record<number, unknown>;
        Object.keys(next).forEach((key) => {
          const id = Number.parseInt(key, 10);
          if (!validIds.has(id)) {
            delete next[id];
          }
        });
        return next as T;
      };
      setManagedUserErrors((prev) => pruneByValidIds(prev));
      setManagedUserSaving((prev) => pruneByValidIds(prev));
      setManagedUserDeleting((prev) => pruneByValidIds(prev));
    } catch (error) {
      setClassroomError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memuat classroom.",
      );
    } finally {
      setIsClassroomLoading(false);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    setAccountsError(null);
    setIsAccountsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts`);
      if (!response.ok) {
        throw new Error(`Gagal memuat data akun (${response.status})`);
      }

      const data: ApiAccount[] = await response.json();
      setAccounts(data);

      const currentAccount = accountRef.current;
      if (currentAccount) {
        const matched = data.find((item) => item.id === currentAccount.id);
        if (!matched) {
          syncAccount(null);
        } else if (
          matched.role !== currentAccount.role ||
          matched.npm !== currentAccount.npm ||
          matched.updatedAt !== currentAccount.updatedAt
        ) {
          syncAccount(matched);
        }
      }
    } catch (error) {
      setAccountsError(
        error instanceof Error ? error.message : "Terjadi kesalahan saat memuat akun.",
      );
    } finally {
      setIsAccountsLoading(false);
    }
  }, [syncAccount]);

  useEffect(() => {
    void fetchAdminExists();
  }, [fetchAdminExists]);

  useEffect(() => {
    if (account?.role === "admin") {
      void fetchClassrooms();
      void fetchAccounts();
    }
  }, [account?.role, fetchAccounts, fetchClassrooms]);

  const handleRefreshClassrooms = async () => {
    setIsRefreshing(true);
    try {
      await fetchClassrooms();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateClassroom = async () => {
    const trimmedName = newClassroomName.trim();

    if (!trimmedName) {
      setClassroomFormError("Nama classroom wajib diisi.");
      return;
    }

    const selectedLanguage =
      languages.find((language) => language.id === newClassroomLanguageId) ?? null;

    const trimmedTasks = newClassroomTasks
      .map((task) => task.trim())
      .filter((task) => task.length > 0);

    const payload: CreateClassroomPayload = {
      name: trimmedName,
      lockLanguage: selectedLanguage ? newClassroomLockLanguage : false,
      tasks: trimmedTasks,
    };

    if (selectedLanguage) {
      payload.programmingLanguage = selectedLanguage.name;
    }

    setClassroomFormError(null);
    setClassroomActionError(null);
    setEditingError(null);
    setIsCreatingClassroom(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/classrooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? "Gagal membuat classroom.");
      }

      setNewClassroomName("");
      setNewClassroomLanguageId(null);
      setNewClassroomLockLanguage(false);
      setNewClassroomTasks([""]);
      await fetchClassrooms();
    } catch (error) {
      setClassroomActionError(
        error instanceof Error ? error.message : "Tidak dapat membuat classroom.",
      );
    } finally {
      setIsCreatingClassroom(false);
    }
  };

  const handleBeginEditClassroom = (classroom: ApiClassroom) => {
    setClassroomActionError(null);
    setEditingError(null);
    setEditingClassroomId(classroom.id);
    setEditingName(classroom.name);
    const matchedLanguage = findLanguageByName(classroom.programmingLanguage);
    setEditingLanguageId(matchedLanguage?.id ?? null);
    setEditingLockLanguage(matchedLanguage ? classroom.languageLocked : false);
    setEditingTasks(classroom.tasks.length > 0 ? [...classroom.tasks] : [""]);
  };

  const handleCancelEditClassroom = () => {
    if (isSavingClassroom) {
      return;
    }
    setEditingClassroomId(null);
    setEditingName("");
    setEditingLanguageId(null);
    setEditingLockLanguage(false);
    setEditingTasks([]);
    setClassroomActionError(null);
    setEditingError(null);
  };

  const handleUpdateClassroom = async () => {
    if (editingClassroomId === null) {
      return;
    }

    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setEditingError("Nama classroom wajib diisi.");
      return;
    }

    const selectedLanguage =
      languages.find((language) => language.id === editingLanguageId) ?? null;
    const trimmedTasks = editingTasks
      .map((task) => task.trim())
      .filter((task) => task.length > 0);

    const payload: UpdateClassroomPayload = {
      name: trimmedName,
      programmingLanguage: selectedLanguage ? selectedLanguage.name : null,
      lockLanguage: selectedLanguage ? editingLockLanguage : false,
      tasks: trimmedTasks,
    };

    setClassroomActionError(null);
    setEditingError(null);
    setIsSavingClassroom(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/classrooms/${editingClassroomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? "Gagal memperbarui classroom.");
      }

      await fetchClassrooms();
      handleCancelEditClassroom();
    } catch (error) {
      setEditingError(
        error instanceof Error ? error.message : "Tidak dapat memperbarui classroom.",
      );
    } finally {
      setIsSavingClassroom(false);
    }
  };

  const handleDeleteClassroom = async (classroomId: number) => {
    if (!window.confirm("Hapus classroom ini?")) {
      return;
    }

    setClassroomActionError(null);
    setEditingError(null);
    setDeletingClassroomId(classroomId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/classrooms/${classroomId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? "Gagal menghapus classroom.");
      }

      if (editingClassroomId === classroomId) {
        handleCancelEditClassroom();
      }

      await fetchClassrooms();
    } catch (error) {
      setClassroomActionError(
        error instanceof Error ? error.message : "Tidak dapat menghapus classroom.",
      );
    } finally {
      setDeletingClassroomId(null);
    }
  };

  const handleChangeNewClassroomTask = (index: number, value: string) => {
    setNewClassroomTasks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddNewClassroomTask = () => {
    setNewClassroomTasks((prev) => [...prev, ""]);
  };

  const handleRemoveNewClassroomTask = (index: number) => {
    setNewClassroomTasks((prev) => prev.filter((_, taskIndex) => taskIndex !== index));
  };

  const handleChangeEditingTask = (index: number, value: string) => {
    setEditingTasks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddEditingTask = () => {
    setEditingTasks((prev) => [...prev, ""]);
  };

  const handleRemoveEditingTask = (index: number) => {
    setEditingTasks((prev) => prev.filter((_, taskIndex) => taskIndex !== index));
  };

  const handleRegisterFirstAdmin = async () => {
    const trimmed = firstAdminNpm.trim();
    if (!trimmed) {
      setFirstAdminError("NPM wajib diisi.");
      return;
    }

    try {
      setFirstAdminError(null);
      setIsRegisteringAdmin(true);
      await login({ npm: trimmed, asAdmin: true });
      await fetchAdminExists();
      await fetchAccounts();
    } catch (error) {
      setFirstAdminError(
        error instanceof Error ? error.message : "Gagal mendaftarkan admin.",
      );
    } finally {
      setIsRegisteringAdmin(false);
    }
  };

  const handleCreateAccount = async () => {
    const trimmed = newAccountNpm.trim();
    if (!trimmed) {
      setAccountFormError("NPM wajib diisi.");
      return;
    }

    try {
      setAccountFormError(null);
      setIsSavingAccount(true);
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npm: trimmed,
          role: newAccountRole,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Gagal membuat akun.");
      }

      setNewAccountNpm("");
      setNewAccountRole("user");
      await fetchAccounts();
    } catch (error) {
      setAccountFormError(
        error instanceof Error ? error.message : "Gagal membuat akun.",
      );
    } finally {
      setIsSavingAccount(false);
    }
  };

  const updateClassroomUserForm = (
    classroomId: number,
    updates: Partial<ClassroomUserForm>,
  ) => {
    setClassroomUserForms((prev) => {
      const previous = prev[classroomId] ?? { name: "", npm: "" };
      return {
        ...prev,
        [classroomId]: {
          ...previous,
          ...updates,
        },
      };
    });
    setClassroomUserErrors((prev) => ({ ...prev, [classroomId]: null }));
  };

  const handleAddUserToClassroom = async (classroomId: number) => {
    const form = classroomUserForms[classroomId] ?? { name: "", npm: "" };
    const trimmedName = form.name.trim();
    const trimmedNpm = form.npm.trim();

    if (!trimmedName || !trimmedNpm) {
      setClassroomUserErrors((prev) => ({
        ...prev,
        [classroomId]: "Nama dan NPM wajib diisi.",
      }));
      return;
    }

    setClassroomUserErrors((prev) => ({ ...prev, [classroomId]: null }));
    setClassroomUserLoading((prev) => ({ ...prev, [classroomId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/classrooms/${classroomId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          npm: trimmedNpm,
          code: EMPTY_CODE_PLACEHOLDER,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Gagal menambahkan user ke classroom.");
      }

      setClassroomUserForms((prev) => ({
        ...prev,
        [classroomId]: { name: "", npm: "" },
      }));

      await fetchClassrooms();
    } catch (error) {
      setClassroomUserErrors((prev) => ({
        ...prev,
        [classroomId]: error instanceof Error
          ? error.message
          : "Tidak dapat menambahkan user.",
      }));
    } finally {
      setClassroomUserLoading((prev) => ({ ...prev, [classroomId]: false }));
    }
  };

  const handleChangeManagedUserForm = (
    userId: number,
    updates: Partial<ManagedUserForm>,
  ) => {
    setManagedUserForms((prev) => {
      const previous = prev[userId] ?? { name: "", npm: "" };
      return {
        ...prev,
        [userId]: {
          ...previous,
          ...updates,
        },
      };
    });
    setManagedUserErrors((prev) => ({ ...prev, [userId]: null }));
  };

  const handleSaveManagedUser = async (classroomId: number, userId: number) => {
    const form = managedUserForms[userId] ?? { name: "", npm: "" };
    const trimmedName = form.name.trim();
    const trimmedNpm = form.npm.trim();

    if (!trimmedName || !trimmedNpm) {
      setManagedUserErrors((prev) => ({
        ...prev,
        [userId]: "Nama dan NPM wajib diisi.",
      }));
      return;
    }

    setManagedUserSaving((prev) => ({ ...prev, [userId]: true }));
    setManagedUserErrors((prev) => ({ ...prev, [userId]: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/classrooms/${classroomId}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, npm: trimmedNpm }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Gagal memperbarui data user.");
      }

      await fetchClassrooms();
    } catch (error) {
      setManagedUserErrors((prev) => ({
        ...prev,
        [userId]: error instanceof Error
          ? error.message
          : "Tidak dapat memperbarui user.",
      }));
    } finally {
      setManagedUserSaving((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteManagedUser = async (classroomId: number, userId: number) => {
    if (!window.confirm("Hapus user ini?")) {
      return;
    }

    setManagedUserErrors((prev) => ({ ...prev, [userId]: null }));
    setManagedUserDeleting((prev) => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/classrooms/${classroomId}/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Gagal menghapus user.");
      }

      await fetchClassrooms();
    } catch (error) {
      setManagedUserErrors((prev) => ({
        ...prev,
        [userId]: error instanceof Error ? error.message : "Tidak dapat menghapus user.",
      }));
    } finally {
      setManagedUserDeleting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handlePreviewUserCode = useCallback(
    (userCode: string) => {
      if (!userCode.trim()) {
        return;
      }

      navigate("/", { state: { previewCode: userCode } });
    },
    [navigate],
  );

  const handleUpdateRole = async (accountId: number, role: ApiAccount["role"]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Gagal memperbarui role.");
      }

      await fetchAccounts();
    } catch (error) {
      setAccountsError(
        error instanceof Error ? error.message : "Tidak dapat memperbarui role.",
      );
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (!window.confirm("Hapus akun ini?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Gagal menghapus akun.");
      }

      await fetchAccounts();
    } catch (error) {
      setAccountsError(
        error instanceof Error ? error.message : "Tidak dapat menghapus akun.",
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login?redirect=/admin", { replace: true });
  };

  const handleChangeNewClassroomName = (value: string) => {
    setNewClassroomName(value);
    if (classroomFormError) {
      setClassroomFormError(null);
    }
  };

  const handleChangeNewClassroomLanguage = (value: number | null) => {
    setNewClassroomLanguageId(value);
    if (value === null) {
      setNewClassroomLockLanguage(false);
    }
    if (classroomFormError) {
      setClassroomFormError(null);
    }
  };

  const handleToggleNewClassroomLock = (value: boolean) => {
    if (newClassroomLanguageId === null) {
      setNewClassroomLockLanguage(false);
      return;
    }
    setNewClassroomLockLanguage(value);
  };

  const handleChangeEditingName = (value: string) => {
    setEditingName(value);
    if (editingError) {
      setEditingError(null);
    }
  };

  const handleChangeEditingLanguage = (value: number | null) => {
    setEditingLanguageId(value);
    if (value === null) {
      setEditingLockLanguage(false);
    }
    if (editingError) {
      setEditingError(null);
    }
  };

  const handleToggleEditingLockLanguage = (value: boolean) => {
    if (editingLanguageId === null) {
      setEditingLockLanguage(false);
      return;
    }
    setEditingLockLanguage(value);
    if (editingError) {
      setEditingError(null);
    }
  };

  const handleChangeNewAccountNpm = (value: string) => {
    setNewAccountNpm(value);
    if (accountFormError) {
      setAccountFormError(null);
    }
  };

  const handleChangeNewAccountRole = (role: ApiAccount["role"]) => {
    setNewAccountRole(role);
  };

  const handleChangeFirstAdminNpm = (value: string) => {
    setFirstAdminNpm(value);
    if (firstAdminError) {
      setFirstAdminError(null);
    }
  };

  const renderContent = () => {
    if (authLoading || adminExists === null) {
      return (
        <div className="rounded-2xl border border-default-200 bg-default-100 px-6 py-10 text-center text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-300">
          Memeriksa status...
        </div>
      );
    }

    if (adminCheckError) {
      return (
        <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
          {adminCheckError}
        </div>
      );
    }

    if (!adminExists && !account) {
      return (
        <FirstAdminRegistration
          error={firstAdminError}
          isSubmitting={isRegisteringAdmin}
          npm={firstAdminNpm}
          onChangeNpm={handleChangeFirstAdminNpm}
          onRegister={handleRegisterFirstAdmin}
        />
      );
    }

    if (!account) {
      return (
        <AdminLoginPrompt onNavigateToLogin={() => navigate("/login?redirect=/admin")} />
      );
    }

    if (account.role !== "admin") {
      return (
        <AccessLimited
          accountNpm={account.npm}
          roleLabel={roleLabel[account.role]}
          onBackToHome={() => navigate("/")}
        />
      );
    }

    return (
      <div className="space-y-6">
        <AdminHeader
          classroomCount={classrooms.length}
          totalUsers={totalUsers}
          onLogout={handleLogout}
        />
        <AccountSection
          accountFormError={accountFormError}
          accounts={accounts}
          accountsError={accountsError}
          isAccountsLoading={isAccountsLoading}
          isSavingAccount={isSavingAccount}
          newAccountNpm={newAccountNpm}
          newAccountRole={newAccountRole}
          onChangeNewAccountNpm={handleChangeNewAccountNpm}
          onChangeNewAccountRole={handleChangeNewAccountRole}
          onCreateAccount={handleCreateAccount}
          onDeleteAccount={handleDeleteAccount}
          onRefresh={fetchAccounts}
          onUpdateRole={handleUpdateRole}
        />
        <ClassroomSection
          archivedLanguages={archivedLanguages}
          availableLanguages={availableLanguages}
          classroomActionError={classroomActionError}
          classroomError={classroomError}
          classroomFormError={classroomFormError}
          classroomUserErrors={classroomUserErrors}
          classroomUserForms={classroomUserForms}
          classroomUserLoading={classroomUserLoading}
          classrooms={classrooms}
          deletingClassroomId={deletingClassroomId}
          editingClassroomId={editingClassroomId}
          editingError={editingError}
          editingLanguageId={editingLanguageId}
          editingLockLanguage={editingLockLanguage}
          editingName={editingName}
          editingTasks={editingTasks}
          isCreatingClassroom={isCreatingClassroom}
          isLoading={isClassroomLoading}
          isRefreshing={isRefreshing}
          isSavingClassroom={isSavingClassroom}
          managedUserDeleting={managedUserDeleting}
          managedUserErrors={managedUserErrors}
          managedUserForms={managedUserForms}
          managedUserSaving={managedUserSaving}
          newClassroomLanguageId={newClassroomLanguageId}
          newClassroomLockLanguage={newClassroomLockLanguage}
          newClassroomName={newClassroomName}
          newClassroomTasks={newClassroomTasks}
          onAddUserToClassroom={handleAddUserToClassroom}
          onAddEditingTask={handleAddEditingTask}
          onAddNewClassroomTask={handleAddNewClassroomTask}
          onCancelEditClassroom={handleCancelEditClassroom}
          onChangeClassroomUserForm={updateClassroomUserForm}
          onChangeEditingLanguage={handleChangeEditingLanguage}
          onChangeEditingName={handleChangeEditingName}
          onChangeEditingTask={handleChangeEditingTask}
          onChangeManagedUserForm={handleChangeManagedUserForm}
          onChangeNewClassroomLanguage={handleChangeNewClassroomLanguage}
          onChangeNewClassroomName={handleChangeNewClassroomName}
          onChangeNewClassroomTask={handleChangeNewClassroomTask}
          onCreateClassroom={handleCreateClassroom}
          onDeleteClassroom={handleDeleteClassroom}
          onRemoveEditingTask={handleRemoveEditingTask}
          onDeleteManagedUser={handleDeleteManagedUser}
          onEditClassroom={handleBeginEditClassroom}
          onPreviewUserCode={handlePreviewUserCode}
          onRefresh={handleRefreshClassrooms}
          onSaveManagedUser={handleSaveManagedUser}
          onRemoveNewClassroomTask={handleRemoveNewClassroomTask}
          onToggleEditingLockLanguage={handleToggleEditingLockLanguage}
          onToggleNewClassroomLock={handleToggleNewClassroomLock}
          onUpdateClassroom={handleUpdateClassroom}
        />
      </div>
    );
  };

  return (
    <DefaultLayout>
      <section className="py-10">{renderContent()}</section>
    </DefaultLayout>
  );
};
