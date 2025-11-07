import { ChangeEvent } from "react";
import { Button } from "@heroui/button";

import { formatDateTime, roleLabel } from "../utils";
import { ApiAccount } from "../page";

type AccountSectionProps = {
  accounts: ApiAccount[];
  accountsError: string | null;
  isAccountsLoading: boolean;
  newAccountNpm: string;
  newAccountRole: ApiAccount["role"];
  isSavingAccount: boolean;
  accountFormError: string | null;
  onRefresh: () => void;
  onChangeNewAccountNpm: (value: string) => void;
  onChangeNewAccountRole: (role: ApiAccount["role"]) => void;
  onCreateAccount: () => void;
  onUpdateRole: (accountId: number, role: ApiAccount["role"]) => void;
  onDeleteAccount: (accountId: number) => void;
  isExpanded: boolean;
  onToggle: () => void;
};

export const AccountSection = ({
  accounts,
  accountsError,
  isAccountsLoading,
  newAccountNpm,
  newAccountRole,
  isSavingAccount,
  accountFormError,
  onRefresh,
  onChangeNewAccountNpm,
  onChangeNewAccountRole,
  onCreateAccount,
  onUpdateRole,
  onDeleteAccount,
  isExpanded,
  onToggle,
}: AccountSectionProps) => (
  <section className="space-y-4 rounded-3xl border border-default-200 bg-content1 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] dark:border-default-100/40 dark:bg-content1/10">
    <div
      className="flex cursor-pointer flex-wrap items-center justify-between gap-3"
      onClick={onToggle}
    >
      <div>
        <h2 className="text-xl font-semibold text-foreground dark:text-default-50">
          Manajemen Akun
        </h2>
        <p className="text-sm text-foreground dark:text-default-200">
          Kelola akun yang dapat mengakses sistem, termasuk promosi menjadi
          admin.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          color="secondary"
          isLoading={isAccountsLoading}
          variant="solid"
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
        >
          Muat Ulang Akun
        </Button>
        <span className="text-2xl font-semibold transition-transform duration-300 transform group-hover:translate-x-1">
          {isExpanded ? "v" : ">"}
        </span>
      </div>
    </div>

    {isExpanded && (
      <>
        <div className="rounded-2xl border border-default-200 bg-content1/40 p-5 dark:border-default-100/40 dark:bg-content1/10">
          <h3 className="text-sm font-semibold text-foreground dark:text-default-200">
            Tambah Akun
          </h3>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              className="w-full rounded-2xl border border-default-200 bg-content1 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-content1/20 dark:text-default-200"
              disabled={isSavingAccount}
              placeholder="NPM"
              value={newAccountNpm}
              onChange={(event) => onChangeNewAccountNpm(event.target.value)}
            />
            <select
              className="w-full rounded-2xl border border-default-200 bg-content1 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-content1/20 dark:text-default-200 md:w-40"
              disabled={isSavingAccount}
              value={newAccountRole}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                onChangeNewAccountRole(event.target.value as ApiAccount["role"])
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <Button
              color="primary"
              isLoading={isSavingAccount}
              variant="solid"
              onPress={onCreateAccount}
            >
              Simpan Akun
            </Button>
          </div>
          {accountFormError ? (
            <p className="mt-2 text-sm text-danger-500 dark:text-danger-300">
              {accountFormError}
            </p>
          ) : null}
        </div>

        {accountsError ? (
          <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
            {accountsError}
          </div>
        ) : null}

        {isAccountsLoading ? (
          <div className="rounded-2xl border border-default-200 bg-content1 px-4 py-6 text-center text-sm text-foreground dark:border-default-100/40 dark:bg-content1/15 dark:text-default-300">
            Memuat data akun...
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl border border-default-200 bg-content1 px-4 py-6 text-center text-sm text-foreground dark:border-default-100/40 dark:bg-content1/15 dark:text-default-300">
            Belum ada akun yang terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-default-200 text-sm text-foreground dark:divide-default-100/20 dark:text-default-200">
              <thead className="bg-content1 text-xs uppercase text-default-500 dark:bg-content1/20 dark:text-default-300">
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
                    <td className="px-3 py-2 font-medium text-foreground dark:text-default-100">
                      {item.npm}
                    </td>
                    <td className="px-3 py-2 text-foreground dark:text-default-300">
                      <select
                        className="rounded-xl border border-default-200 bg-content1 px-3 py-1 text-sm dark:border-default-100/40 dark:bg-content1/10"
                        value={item.role}
                        onChange={(event) =>
                          onUpdateRole(
                            item.id,
                            event.target.value as ApiAccount["role"],
                          )
                        }
                      >
                        <option value="user">{roleLabel.user}</option>
                        <option value="admin">{roleLabel.admin}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-default-500 dark:text-default-300">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-default-500 dark:text-default-300">
                      {formatDateTime(item.updatedAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        color="danger"
                        size="sm"
                        variant="flat"
                        onPress={() => onDeleteAccount(item.id)}
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
      </>
    )}
  </section>
);
