import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";

import { type Account as AuthAccount, useAuth } from "@/contexts/auth-context";
import DefaultLayout from "@/layouts/default";

type ApiUser = {
  id: number;
  name: string;
  npm: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

type ApiClassroom = {
  id: number;
  name: string;
  programmingLanguage: string;
  users: ApiUser[];
  createdAt: string;
  updatedAt: string;
};

type ApiAccount = AuthAccount;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const roleLabel: Record<ApiAccount["role"], string> = {
  admin: "Admin",
  user: "User",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { account, login, logout, syncAccount, isLoading: authLoading } = useAuth();

  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [adminCheckError, setAdminCheckError] = useState<string | null>(null);

  const [classrooms, setClassrooms] = useState<ApiClassroom[]>([]);
  const [isClassroomLoading, setIsClassroomLoading] = useState(false);
  const [classroomError, setClassroomError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

      const data: { exists: boolean } = await response.json();
      setAdminExists(data.exists);
    } catch (error) {
      setAdminCheckError(
        error instanceof Error
          ? error.message
          : "Tidak dapat mengecek status admin.",
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

      if (account) {
        const matched = data.find((item) => item.id === account.id);
        if (matched) {
          syncAccount(matched as AuthAccount);
        } else {
          syncAccount(null);
        }
      }
    } catch (error) {
      setAccountsError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memuat akun.",
      );
    } finally {
      setIsAccountsLoading(false);
    }
  }, [account, syncAccount]);

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

  const renderClassrooms = () => {
    if (classroomError) {
      return (
        <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
          {classroomError}
        </div>
      );
    }

    if (isClassroomLoading) {
      return (
        <div className="rounded-2xl border border-default-200 bg-default-100 px-6 py-10 text-center text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-400">
          Memuat data classroom...
        </div>
      );
    }

    if (classrooms.length === 0) {
      return (
        <div className="rounded-2xl border border-default-200 bg-default-50 px-6 py-10 text-center text-sm text-default-600 dark:border-default-100/40 dark:bg-default-50/15 dark:text-default-400">
          Belum ada classroom yang terdaftar.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {classrooms.map((classroom) => (
          <article
            key={classroom.id}
            className="rounded-3xl border border-default-200 bg-default-50 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] dark:border-default-100/40 dark:bg-default-50/10"
          >
            <div className="flex flex-col gap-2 border-b border-default-200 pb-4 dark:border-default-100/40 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-default-900 dark:text-default-50">
                  {classroom.name}
                </h2>
                <p className="text-sm text-default-600 dark:text-default-400">
                  Bahasa pemrograman:{" "}
                  <span className="font-medium text-default-800 dark:text-default-200">
                    {classroom.programmingLanguage}
                  </span>
                </p>
              </div>
              <div className="text-xs text-default-500 dark:text-default-400">
                <p>Dibuat: {formatDateTime(classroom.createdAt)}</p>
                <p>Diubah: {formatDateTime(classroom.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-default-500 dark:text-default-400">
                Daftar User ({classroom.users.length})
              </h3>
              {classroom.users.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-default-200 bg-default-100 px-4 py-3 text-sm text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-400">
                  Belum ada user dalam classroom ini.
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y divide-default-200 text-left text-sm text-default-700 dark:divide-default-100/30 dark:text-default-200">
                    <thead className="bg-default-100 text-xs uppercase text-default-500 dark:bg-default-100/20 dark:text-default-400">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Nama</th>
                        <th className="px-3 py-2 font-semibold">NPM</th>
                        <th className="px-3 py-2 font-semibold">Kode</th>
                        <th className="px-3 py-2 font-semibold">Terdaftar</th>
                        <th className="px-3 py-2 font-semibold">Pembaruan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default-200 dark:divide-default-100/20">
                      {classroom.users.map((user) => (
                        <tr key={user.id} className="bg-default-50 dark:bg-transparent">
                          <td className="px-3 py-2 font-medium text-default-800 dark:text-default-200">
                            {user.name}
                          </td>
                          <td className="px-3 py-2 text-default-600 dark:text-default-300">
                            {user.npm}
                          </td>
                          <td className="px-3 py-2 text-default-600 dark:text-default-300">
                            <code className="rounded bg-default-100 px-2 py-1 font-code text-xs dark:bg-default-100/20">
                              {user.code}
                            </code>
                          </td>
                          <td className="px-3 py-2 text-default-500 dark:text-default-400">
                            {formatDateTime(user.createdAt)}
                          </td>
                          <td className="px-3 py-2 text-default-500 dark:text-default-400">
                            {formatDateTime(user.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  };

  const renderAccounts = () => (
    <section className="space-y-4 rounded-3xl border border-default-200 bg-default-50 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] dark:border-default-100/40 dark:bg-default-50/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-default-900 dark:text-default-50">
            Manajemen Akun
          </h2>
          <p className="text-sm text-default-600 dark:text-default-400">
            Kelola akun yang dapat mengakses sistem, termasuk promosi menjadi admin.
          </p>
        </div>
        <Button color="secondary" variant="solid" onPress={fetchAccounts} isLoading={isAccountsLoading}>
          Muat Ulang Akun
        </Button>
      </div>

      <div className="rounded-2xl border border-default-200 bg-default-100/40 p-5 dark:border-default-100/40 dark:bg-default-100/10">
        <h3 className="text-sm font-semibold text-default-700 dark:text-default-200">
          Tambah Akun
        </h3>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
            placeholder="NPM"
            value={newAccountNpm}
            onChange={(event) => setNewAccountNpm(event.target.value)}
            disabled={isSavingAccount}
          />
          <select
            className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200 md:w-40"
            value={newAccountRole}
            onChange={(event) => setNewAccountRole(event.target.value as ApiAccount["role"])}
            disabled={isSavingAccount}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <Button
            color="primary"
            variant="solid"
            isLoading={isSavingAccount}
            onPress={handleCreateAccount}
          >
            Simpan Akun
          </Button>
        </div>
        {accountFormError ? (
          <p className="mt-2 text-sm text-danger-500 dark:text-danger-300">{accountFormError}</p>
        ) : null}
      </div>

      {accountsError ? (
        <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
          {accountsError}
        </div>
      ) : null}

      {isAccountsLoading ? (
        <div className="rounded-2xl border border-default-200 bg-default-100 px-4 py-6 text-center text-sm text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-400">
          Memuat data akun...
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-default-200 bg-default-100 px-4 py-6 text-center text-sm text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-400">
          Belum ada akun yang terdaftar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-default-200 text-sm text-default-700 dark:divide-default-100/20 dark:text-default-200">
            <thead className="bg-default-100 text-xs uppercase text-default-500 dark:bg-default-100/20 dark:text-default-400">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">NPM</th>
                <th className="px-3 py-2 text-left font-semibold">Role</th>
                <th className="px-3 py-2 text-left font-semibold">Dibuat</th>
                <th className="px-3 py-2 text-left font-semibold">Diubah</th>
                <th className="px-3 py-2 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200 dark:divide-default-100/20">
              {accounts.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 font-medium text-default-800 dark:text-default-100">
                    {item.npm}
                  </td>
                  <td className="px-3 py-2 text-default-600 dark:text-default-300">
                    <select
                      className="rounded-xl border border-default-200 bg-default-50 px-3 py-1 text-sm dark:border-default-100/40 dark:bg-default-50/10"
                      value={item.role}
                      onChange={(event) =>
                        handleUpdateRole(item.id, event.target.value as ApiAccount["role"])
                      }
                    >
                      <option value="user">{roleLabel.user}</option>
                      <option value="admin">{roleLabel.admin}</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-default-500 dark:text-default-400">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-default-500 dark:text-default-400">
                    {formatDateTime(item.updatedAt)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => handleDeleteAccount(item.id)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

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
        <div className="mx-auto max-w-lg rounded-3xl border border-default-200 bg-default-50 px-8 py-12 shadow-xl dark:border-default-100/40 dark:bg-default-50/10">
          <h2 className="text-2xl font-semibold text-default-900 dark:text-default-50">
            Daftarkan Admin Pertama
          </h2>
          <p className="mt-2 text-sm text-default-600 dark:text-default-400">
            Masukkan NPM untuk mendaftarkan admin pertama. Setelah berhasil, Anda akan otomatis masuk sebagai admin.
          </p>

          <div className="mt-6 space-y-3">
            <input
              className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
              placeholder="NPM"
              value={firstAdminNpm}
              onChange={(event) => setFirstAdminNpm(event.target.value)}
              disabled={isRegisteringAdmin}
            />
            {firstAdminError ? (
              <p className="text-sm text-danger-500 dark:text-danger-300">{firstAdminError}</p>
            ) : null}
            <Button
              color="primary"
              variant="solid"
              isLoading={isRegisteringAdmin}
              onPress={handleRegisterFirstAdmin}
            >
              Daftarkan Admin
            </Button>
          </div>
        </div>
      );
    }

    if (!account) {
      return (
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-default-200 bg-default-50 px-8 py-12 text-center shadow-xl dark:border-default-100/40 dark:bg-default-50/10">
          <h2 className="text-2xl font-semibold text-default-900 dark:text-default-50">
            Login Admin Diperlukan
          </h2>
          <p className="text-sm text-default-600 dark:text-default-400">
            Admin sudah terdaftar. Silakan login menggunakan akun admin Anda.
          </p>
          <Button color="primary" variant="solid" onPress={() => navigate("/login?redirect=/admin")}>
            Buka Halaman Login
          </Button>
        </div>
      );
    }

    if (account.role !== "admin") {
      return (
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-warning-300 bg-warning-50 px-8 py-12 text-center shadow-xl dark:border-warning-200/40 dark:bg-warning-500/10 dark:text-warning-200">
          <h2 className="text-2xl font-semibold">Akses Terbatas</h2>
          <p className="text-sm">
            Anda masuk sebagai <strong className="font-semibold">{account.npm}</strong> dengan role{" "}
            <strong className="font-semibold">{roleLabel[account.role]}</strong>. Hubungi admin untuk meminta akses.
          </p>
          <Button color="primary" variant="solid" onPress={() => navigate("/")}>
            Kembali ke Beranda
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-default-900 dark:text-default-50">
              Admin Classroom
            </h1>
            <p className="text-sm text-default-600 dark:text-default-400">
              Kelola data classroom, user, dan akun admin.
            </p>
            <p className="mt-1 text-xs text-default-500 dark:text-default-500">
              Total classroom: {classrooms.length} · Total user: {totalUsers}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button color="default" variant="flat" onPress={handleLogout}>
              Keluar
            </Button>
            <Button
              color="primary"
              isLoading={isRefreshing || isClassroomLoading}
              onPress={handleRefreshClassrooms}
              variant="solid"
            >
              Muat Ulang Classroom
            </Button>
          </div>
        </div>

        {renderAccounts()}
        {renderClassrooms()}
      </div>
    );
  };

  return (
    <DefaultLayout>
      <section className="py-10">{renderContent()}</section>
    </DefaultLayout>
  );
}
