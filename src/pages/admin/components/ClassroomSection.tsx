import { Button } from "@heroui/button";

import { ExtendedLanguage } from "@/contexts/language-context";

import { formatDateTime } from "../utils";
import { ApiClassroom, ClassroomUserForm, ManagedUserForm } from "../types";

type ClassroomSectionProps = {
  classrooms: ApiClassroom[];
  availableLanguages: ExtendedLanguage[];
  archivedLanguages: ExtendedLanguage[];
  isLoading: boolean;
  isRefreshing: boolean;
  newClassroomName: string;
  newClassroomLanguageId: number | null;
  newClassroomLockLanguage: boolean;
  classroomFormError: string | null;
  classroomActionError: string | null;
  classroomError: string | null;
  isCreatingClassroom: boolean;
  editingClassroomId: number | null;
  editingName: string;
  editingLanguageId: number | null;
  editingLockLanguage: boolean;
  editingError: string | null;
  isSavingClassroom: boolean;
  deletingClassroomId: number | null;
  classroomUserForms: Record<number, ClassroomUserForm>;
  classroomUserErrors: Record<number, string | null>;
  classroomUserLoading: Record<number, boolean>;
  managedUserForms: Record<number, ManagedUserForm>;
  managedUserErrors: Record<number, string | null>;
  managedUserSaving: Record<number, boolean>;
  managedUserDeleting: Record<number, boolean>;
  onRefresh: () => void;
  onCreateClassroom: () => void;
  onChangeNewClassroomName: (value: string) => void;
  onChangeNewClassroomLanguage: (value: number | null) => void;
  onToggleNewClassroomLock: (value: boolean) => void;
  onEditClassroom: (classroom: ApiClassroom) => void;
  onCancelEditClassroom: () => void;
  onUpdateClassroom: () => void;
  onDeleteClassroom: (classroomId: number) => void;
  onChangeEditingName: (value: string) => void;
  onChangeEditingLanguage: (value: number | null) => void;
  onToggleEditingLockLanguage: (value: boolean) => void;
  onAddUserToClassroom: (classroomId: number) => void;
  onChangeClassroomUserForm: (
    classroomId: number,
    updates: Partial<ClassroomUserForm>,
  ) => void;
  onChangeManagedUserForm: (userId: number, updates: Partial<ManagedUserForm>) => void;
  onSaveManagedUser: (classroomId: number, userId: number) => void;
  onDeleteManagedUser: (classroomId: number, userId: number) => void;
  onPreviewUserCode: (code: string) => void;
};

export const ClassroomSection = ({
  classrooms,
  availableLanguages,
  archivedLanguages,
  isLoading,
  isRefreshing,
  newClassroomName,
  newClassroomLanguageId,
  newClassroomLockLanguage,
  classroomFormError,
  classroomActionError,
  classroomError,
  isCreatingClassroom,
  editingClassroomId,
  editingName,
  editingLanguageId,
  editingLockLanguage,
  editingError,
  isSavingClassroom,
  deletingClassroomId,
  classroomUserForms,
  classroomUserErrors,
  classroomUserLoading,
  managedUserForms,
  managedUserErrors,
  managedUserSaving,
  managedUserDeleting,
  onRefresh,
  onCreateClassroom,
  onChangeNewClassroomName,
  onChangeNewClassroomLanguage,
  onToggleNewClassroomLock,
  onEditClassroom,
  onCancelEditClassroom,
  onUpdateClassroom,
  onDeleteClassroom,
  onChangeEditingName,
  onChangeEditingLanguage,
  onToggleEditingLockLanguage,
  onAddUserToClassroom,
  onChangeClassroomUserForm,
  onChangeManagedUserForm,
  onSaveManagedUser,
  onDeleteManagedUser,
  onPreviewUserCode,
}: ClassroomSectionProps) => {
  const allLanguages = [...availableLanguages, ...archivedLanguages];

  const findLanguageByName = (label: string | null | undefined) =>
    allLanguages.find(
      (language) =>
        language.name === label ||
        language.labLabel === label ||
        language.shortName === label,
    ) ?? null;

  const renderLanguageSelect = (
    selectId: string,
    selectedId: number | null,
    onChange: (value: number | null) => void,
    disabled: boolean,
  ) => (
    <select
      id={selectId}
      className="min-w-[220px] rounded-2xl border border-default-200 bg-white px-4 py-2 text-sm text-default-700 shadow-sm transition hover:border-default-300 focus:border-primary focus:outline-none dark:border-default-100/40 dark:bg-default-100/10 dark:text-default-200"
      value={selectedId ?? ""}
      disabled={disabled}
      onChange={(event) => {
        const value = event.target.value;
        onChange(value ? Number.parseInt(value, 10) : null);
      }}
    >
      <option value="">Izinkan user memilih sendiri</option>
      <optgroup label="Aktif">
        {availableLanguages.map((language) => (
          <option key={language.id} value={language.id}>
            {language.name} (ID {language.id})
          </option>
        ))}
      </optgroup>
      {archivedLanguages.length > 0 ? (
        <optgroup label="Arsip">
          {archivedLanguages.map((language) => (
            <option key={language.id} value={language.id}>
              {language.name} (ID {language.id}) — Archived
            </option>
          ))}
        </optgroup>
      ) : null}
    </select>
  );

  const renderClassroomList = () => {
    if (isLoading) {
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
        {classrooms.map((classroom) => {
          const isEditing = editingClassroomId === classroom.id;
          const isDeleting = deletingClassroomId === classroom.id;
          const resolvedLanguage = findLanguageByName(classroom.programmingLanguage);
          const languageLabel = resolvedLanguage
            ? `${resolvedLanguage.labLabel} • ${resolvedLanguage.name}`
            : classroom.programmingLanguage?.trim() || "Belum ditentukan";
          const languageStatus = resolvedLanguage
            ? classroom.languageLocked
              ? "Terkunci untuk user"
              : "User dapat mengubah bahasa"
            : "Belum diatur, user bebas memilih bahasa";

          return (
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
                      {languageLabel}
                    </span>
                  </p>
                  <p className="text-xs text-default-500 dark:text-default-400">
                    Status bahasa: {languageStatus}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 text-xs text-default-500 dark:text-default-400 md:items-end">
                  <div>
                    <p>Dibuat: {formatDateTime(classroom.createdAt)}</p>
                    <p>Diubah: {formatDateTime(classroom.updatedAt)}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 text-sm md:text-base">
                    {isEditing ? (
                      <>
                        <Button
                          color="primary"
                          variant="solid"
                          isLoading={isSavingClassroom}
                          onPress={onUpdateClassroom}
                        >
                          Simpan Perubahan
                        </Button>
                        <Button
                          variant="flat"
                          onPress={onCancelEditClassroom}
                          disabled={isSavingClassroom}
                        >
                          Batal
                        </Button>
                        <Button
                          color="danger"
                          variant="flat"
                          onPress={() => onDeleteClassroom(classroom.id)}
                          isLoading={isDeleting}
                        >
                          Hapus
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="flat" onPress={() => onEditClassroom(classroom)}>
                          Ubah
                        </Button>
                        <Button
                          color="danger"
                          variant="flat"
                          onPress={() => onDeleteClassroom(classroom.id)}
                          isLoading={isDeleting}
                        >
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-default-700 dark:text-default-200">
                          Nama Classroom
                        </label>
                        <input
                          className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                          value={editingName}
                          onChange={(event) => onChangeEditingName(event.target.value)}
                          disabled={isSavingClassroom}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          className="text-sm font-medium text-default-700 dark:text-default-200"
                          htmlFor={`editing-language-${classroom.id}`}
                        >
                          Bahasa Pemrograman
                        </label>
                        {renderLanguageSelect(
                          `editing-language-${classroom.id}`,
                          editingLanguageId ?? null,
                          onChangeEditingLanguage,
                          isSavingClassroom,
                        )}
                        <p className="text-xs text-default-500 dark:text-default-400">
                          Pilih bahasa untuk menetapkan editor. Biarkan kosong agar user bebas memilih.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-default-600 dark:text-default-300">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-default-300 text-primary focus:ring-primary"
                        checked={Boolean(editingLanguageId) && editingLockLanguage}
                        onChange={(event) => onToggleEditingLockLanguage(event.target.checked)}
                        disabled={isSavingClassroom || editingLanguageId === null}
                      />
                      Kunci bahasa pemrograman untuk user
                    </label>
                    {editingLanguageId === null ? (
                      <p className="text-xs text-default-500 dark:text-default-400">
                        Penguncian bahasa hanya tersedia jika bahasa telah dipilih.
                      </p>
                    ) : null}
                    {editingError ? (
                      <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
                        {editingError}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-default-500 dark:text-default-400">
                    Daftar User ({classroom.users.length})
                  </h3>
                  {classroom.users.length === 0 ? (
                    <p className="mt-3 rounded-2xl border border-default-200 bg-default-100 px-4 py-3 text-sm text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-400">
                      Belum ada user dalam classroom ini.
                    </p>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full divide-y divide-default-200 text-left text-sm text-default-700 dark:divide-default-100/20 dark:text-default-200">
                        <thead className="bg-default-100 text-xs uppercase text-default-500 dark:bg-default-100/20 dark:text-default-400">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Nama</th>
                            <th className="px-3 py-2 font-semibold">NPM</th>
                            <th className="px-3 py-2 font-semibold">Kode</th>
                            <th className="px-3 py-2 font-semibold">Terdaftar</th>
                            <th className="px-3 py-2 font-semibold">Pembaruan</th>
                            <th className="px-3 py-2 text-right font-semibold">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-default-200 dark:divide-default-100/20">
                          {classroom.users.map((user) => {
                            const managedForm = managedUserForms[user.id] ?? {
                              name: user.name,
                              npm: user.npm,
                            };
                            const isSavingUser = managedUserSaving[user.id] ?? false;
                            const isDeletingUser = managedUserDeleting[user.id] ?? false;
                            const isBusy = isSavingUser || isDeletingUser;
                            const errorMessage = managedUserErrors[user.id] ?? null;
                            const hasCode = Boolean(user.code?.trim());

                            return (
                              <tr key={user.id} className="bg-default-50 dark:bg-transparent">
                                <td className="px-3 py-2 font-medium text-default-800 dark:text-default-200">
                                  <div className="space-y-2">
                                    <input
                                      className="w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/10 dark:text-default-100"
                                      value={managedForm.name}
                                      onChange={(event) =>
                                        onChangeManagedUserForm(user.id, { name: event.target.value })
                                      }
                                      disabled={isBusy}
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-default-600 dark:text-default-300">
                                  <input
                                    className="w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/10 dark:text-default-100"
                                    value={managedForm.npm}
                                    onChange={(event) =>
                                      onChangeManagedUserForm(user.id, { npm: event.target.value })
                                    }
                                    disabled={isBusy}
                                  />
                                </td>
                                <td className="px-3 py-2 text-default-600 dark:text-default-300">
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      className="font-code"
                                      color="secondary"
                                      size="sm"
                                      variant="flat"
                                      isDisabled={!hasCode}
                                      onPress={() => onPreviewUserCode(user.code)}
                                    >
                                      Lihat
                                    </Button>
                                    {!hasCode ? (
                                      <p className="text-xs text-default-500 dark:text-default-400">
                                        Belum ada kode yang dijalankan.
                                      </p>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-default-500 dark:text-default-400">
                                  {formatDateTime(user.createdAt)}
                                </td>
                                <td className="px-3 py-2 text-default-500 dark:text-default-400">
                                  {formatDateTime(user.updatedAt)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="flex gap-2">
                                      <Button
                                        color="primary"
                                        size="sm"
                                        variant="flat"
                                        isLoading={isSavingUser}
                                        isDisabled={isDeletingUser}
                                        onPress={() => onSaveManagedUser(classroom.id, user.id)}
                                      >
                                        Simpan Data
                                      </Button>
                                      <Button
                                        color="danger"
                                        size="sm"
                                        variant="flat"
                                        isLoading={isDeletingUser}
                                        isDisabled={isSavingUser}
                                        onPress={() => onDeleteManagedUser(classroom.id, user.id)}
                                      >
                                        Hapus
                                      </Button>
                                    </div>
                                    {errorMessage ? (
                                      <p className="text-xs text-danger-500 dark:text-danger-300">
                                        {errorMessage}
                                      </p>
                                    ) : null}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-4 space-y-3 rounded-2xl border border-default-200 bg-default-100/50 p-4 dark:border-default-100/40 dark:bg-default-100/10">
                    <h4 className="text-sm font-semibold text-default-700 dark:text-default-200">
                      Tambah User ke Classroom
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        placeholder="Nama user"
                        value={classroomUserForms[classroom.id]?.name ?? ""}
                        onChange={(event) =>
                          onChangeClassroomUserForm(classroom.id, { name: event.target.value })
                        }
                        disabled={classroomUserLoading[classroom.id]}
                      />
                      <input
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        placeholder="NPM"
                        value={classroomUserForms[classroom.id]?.npm ?? ""}
                        onChange={(event) =>
                          onChangeClassroomUserForm(classroom.id, { npm: event.target.value })
                        }
                        disabled={classroomUserLoading[classroom.id]}
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {classroomUserErrors[classroom.id] ? (
                        <p className="text-sm text-danger-500 dark:text-danger-300">
                          {classroomUserErrors[classroom.id]}
                        </p>
                      ) : (
                        <span className="text-xs text-default-500 dark:text-default-400">
                          Nama dan NPM akan digunakan untuk membuat akun user pada classroom.
                        </span>
                      )}
                      <Button
                        color="primary"
                        variant="solid"
                        isLoading={classroomUserLoading[classroom.id]}
                        onPress={() => onAddUserToClassroom(classroom.id)}
                      >
                        Tambahkan User
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <section className="space-y-4 rounded-3xl border border-default-200 bg-default-50 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] dark:border-default-100/40 dark:bg-default-50/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-default-900 dark:text-default-50">
            Manajemen Classroom
          </h2>
          <p className="text-sm text-default-600 dark:text-default-400">
            Kelola data classroom beserta bahasa pemrograman yang digunakan.
          </p>
        </div>
        <Button
          color="secondary"
          variant="solid"
          onPress={onRefresh}
          isLoading={isRefreshing || isLoading}
        >
          Muat Ulang Classroom
        </Button>
      </div>

      <div className="rounded-2xl border border-default-200 bg-default-100/40 p-5 dark:border-default-100/40 dark:bg-default-100/10">
        <h3 className="text-sm font-semibold text-default-700 dark:text-default-200">
          Tambah Classroom
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
            placeholder="Nama classroom"
            value={newClassroomName}
            onChange={(event) => onChangeNewClassroomName(event.target.value)}
            disabled={isCreatingClassroom}
          />
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-default-700 dark:text-default-200"
              htmlFor="new-classroom-language"
            >
              Bahasa Pemrograman
            </label>
            {renderLanguageSelect(
              "new-classroom-language",
              newClassroomLanguageId,
              onChangeNewClassroomLanguage,
              isCreatingClassroom,
            )}
            <p className="text-xs text-default-500 dark:text-default-400">
              Pilih bahasa untuk menetapkan editor. Biarkan kosong agar user memilih sendiri.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-default-600 dark:text-default-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-default-300 text-primary focus:ring-primary"
              checked={Boolean(newClassroomLanguageId) && newClassroomLockLanguage}
              onChange={(event) => onToggleNewClassroomLock(event.target.checked)}
              disabled={isCreatingClassroom || newClassroomLanguageId === null}
            />
            Kunci bahasa pemrograman untuk user
          </label>
          <Button
            color="primary"
            variant="solid"
            isLoading={isCreatingClassroom}
            onPress={onCreateClassroom}
          >
            Simpan Classroom
          </Button>
        </div>
        {classroomFormError ? (
          <p className="mt-2 text-sm text-danger-500 dark:text-danger-300">{classroomFormError}</p>
        ) : newClassroomLanguageId === null && newClassroomLockLanguage ? (
          <p className="mt-2 text-sm text-warning-600 dark:text-warning-300">
            Penguncian bahasa akan aktif setelah memilih bahasa.
          </p>
        ) : null}
      </div>

      {classroomActionError ? (
        <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
          {classroomActionError}
        </div>
      ) : null}

      {classroomError ? (
        <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
          {classroomError}
        </div>
      ) : null}

      {renderClassroomList()}
    </section>
  );
};
