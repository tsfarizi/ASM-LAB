import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/contexts/auth-context";
import DefaultLayout from "@/layouts/default";

import { AccountSection } from "./components/AccountSection";
import { AccessLimited } from "./components/AccessLimited";
import { AdminHeader } from "./components/AdminHeader";
import { AdminLoginPrompt } from "./components/AdminLoginPrompt";
import { ClassroomSection } from "./components/ClassroomSection";
import { FirstAdminRegistration } from "./components/FirstAdminRegistration";
import { roleLabel } from "./utils";
import { ApiAccount, ApiClassroom, ClassroomUserForm } from "./types";

type AdminExistsResponse = {
  exists: boolean;
};

type ClassroomUserState = Record<number, ClassroomUserForm>;
type ClassroomUserErrors = Record<number, string | null>;
type ClassroomUserLoading = Record<number, boolean>;
type UserNameState = Record<number, string>;
type UserNameErrors = Record<number, string | null>;
type UserNameLoading = Record<number, boolean>;

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
  const [newClassroomLanguage, setNewClassroomLanguage] = useState("");
  const [newClassroomLockLanguage, setNewClassroomLockLanguage] = useState(false);
  const [classroomFormError, setClassroomFormError] = useState<string | null>(null);
  const [classroomActionError, setClassroomActionError] = useState<string | null>(null);
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);
  const [editingClassroomId, setEditingClassroomId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingLanguage, setEditingLanguage] = useState("");
  const [editingLockLanguage, setEditingLockLanguage] = useState(false);
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

  const [userNameInputs, setUserNameInputs] = useState<UserNameState>({});
  const [userNameErrors, setUserNameErrors] = useState<UserNameErrors>({});
  const [userNameSaving, setUserNameSaving] = useState<UserNameLoading>({});

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
      setClassrooms(data);
      setUserNameInputs(
        data.reduce<UserNameState>((accumulator, classroom) => {
          classroom.users.forEach((user) => {
            accumulator[user.id] = user.name;
          });
          return accumulator;
        }, {}),
      );
      setUserNameErrors((prev) => {
        const next = { ...prev };
        const validIds = new Set<number>();
        data.forEach((classroom) => {
          classroom.users.forEach((user) => {
            validIds.add(user.id);
          });
        });
        Object.keys(next).forEach((key) => {
          const id = Number.parseInt(key, 10);
          if (!validIds.has(id)) {
            delete next[id];
          }
        });
        return next;
      });
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

    const trimmedLanguage = newClassroomLanguage.trim();
    const payload: Record<string, unknown> = {
      name: trimmedName,
      lockLanguage: newClassroomLockLanguage,
    };

    if (trimmedLanguage) {
      payload.programmingLanguage = trimmedLanguage;
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
      setNewClassroomLanguage("");
      setNewClassroomLockLanguage(false);
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
    setEditingLanguage(classroom.programmingLanguage ?? "");
    setEditingLockLanguage(classroom.languageLocked);
  };

  const handleCancelEditClassroom = () => {
    if (isSavingClassroom) {
      return;
    }
    setEditingClassroomId(null);
    setEditingName("");
    setEditingLanguage("");
    setEditingLockLanguage(false);
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

    const trimmedLanguage = editingLanguage.trim();
    const payload = {
      name: trimmedName,
      programmingLanguage: trimmedLanguage ? trimmedLanguage : null,
      lockLanguage: editingLockLanguage,
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
      const previous = prev[classroomId] ?? { name: "", npm: "", code: "" };
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
    const form = classroomUserForms[classroomId] ?? { name: "", npm: "", code: "" };
    const trimmedName = form.name.trim();
    const trimmedNpm = form.npm.trim();
    const trimmedCode = form.code.trim();

    if (!trimmedName || !trimmedNpm || !trimmedCode) {
      setClassroomUserErrors((prev) => ({
        ...prev,
        [classroomId]: "Nama, NPM, dan kode wajib diisi.",
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
          code: trimmedCode,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Gagal menambahkan user ke classroom.");
      }

      setClassroomUserForms((prev) => ({
        ...prev,
        [classroomId]: { name: "", npm: "", code: "" },
      }));

      await fetchClassrooms();
    } catch (error) {
      setClassroomUserErrors((prev) => ({
        ...prev,
        [classroomId]:
          error instanceof Error ? error.message : "Tidak dapat menambahkan user.",
      }));
    } finally {
      setClassroomUserLoading((prev) => ({ ...prev, [classroomId]: false }));
    }
  };

  const handleChangeUserName = (userId: number, value: string) => {
    setUserNameInputs((prev) => ({ ...prev, [userId]: value }));
    setUserNameErrors((prev) => ({ ...prev, [userId]: null }));
  };

  const handleSaveUserName = async (classroomId: number, userId: number) => {
    const trimmed = (userNameInputs[userId] ?? "").trim();
    if (!trimmed) {
      setUserNameErrors((prev) => ({
        ...prev,
        [userId]: "Nama user wajib diisi.",
      }));
      return;
    }

    setUserNameSaving((prev) => ({ ...prev, [userId]: true }));
    setUserNameErrors((prev) => ({ ...prev, [userId]: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/classrooms/${classroomId}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Gagal memperbarui nama user.");
      }

      await fetchClassrooms();
    } catch (error) {
      setUserNameErrors((prev) => ({
        ...prev,
        [userId]: error instanceof Error ? error.message : "Tidak dapat memperbarui nama.",
      }));
    } finally {
      setUserNameSaving((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handlePreviewUserCode = useCallback(
    (userCode: string) => {
      if (!userCode) {
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

  const handleChangeNewClassroomLanguage = (value: string) => {
    setNewClassroomLanguage(value);
    if (classroomFormError) {
      setClassroomFormError(null);
    }
  };

  const handleToggleNewClassroomLock = (value: boolean) => {
    setNewClassroomLockLanguage(value);
  };

  const handleChangeEditingName = (value: string) => {
    setEditingName(value);
    if (editingError) {
      setEditingError(null);
    }
  };

  const handleChangeEditingLanguage = (value: string) => {
    setEditingLanguage(value);
    if (editingError) {
      setEditingError(null);
    }
  };

  const handleToggleEditingLockLanguage = (value: boolean) => {
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
        <div className="rounded-2xl border border-default-200 bg-default-100 px-6 py-10 text-center text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-400">
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
          editingLanguage={editingLanguage}
          editingLockLanguage={editingLockLanguage}
          editingName={editingName}
          isLoading={isClassroomLoading}
          isCreatingClassroom={isCreatingClassroom}
          isRefreshing={isRefreshing}
          isSavingClassroom={isSavingClassroom}
          newClassroomLanguage={newClassroomLanguage}
          newClassroomLockLanguage={newClassroomLockLanguage}
          newClassroomName={newClassroomName}
          onAddUserToClassroom={handleAddUserToClassroom}
          onCancelEditClassroom={handleCancelEditClassroom}
          onChangeClassroomUserForm={updateClassroomUserForm}
          onChangeEditingLanguage={handleChangeEditingLanguage}
          onChangeEditingName={handleChangeEditingName}
          onChangeNewClassroomLanguage={handleChangeNewClassroomLanguage}
          onChangeNewClassroomName={handleChangeNewClassroomName}
          onChangeUserName={handleChangeUserName}
          onCreateClassroom={handleCreateClassroom}
          onDeleteClassroom={handleDeleteClassroom}
          onEditClassroom={handleBeginEditClassroom}
          onPreviewUserCode={handlePreviewUserCode}
          onRefresh={handleRefreshClassrooms}
          onSaveUserName={handleSaveUserName}
          onToggleEditingLockLanguage={handleToggleEditingLockLanguage}
          onToggleNewClassroomLock={handleToggleNewClassroomLock}
          onUpdateClassroom={handleUpdateClassroom}
          userNameErrors={userNameErrors}
          userNameInputs={userNameInputs}
          userNameSaving={userNameSaving}
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
