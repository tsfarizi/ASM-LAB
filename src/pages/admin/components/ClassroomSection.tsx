import { Button } from "@heroui/button";

import { UserStatusToggle } from "./UserStatusToggle";

import { formatDateTime } from "../utils";
import { ApiClassroom, ClassroomUserForm, ManagedUserForm } from "../types";

import { ExtendedLanguage } from "@/contexts/language-context";

type ClassroomSectionProps = {
  classrooms: ApiClassroom[];
  availableLanguages: ExtendedLanguage[];
  archivedLanguages: ExtendedLanguage[];
  isLoading: boolean;
  isRefreshing: boolean;
  newClassroomName: string;
  newClassroomLanguageId: number | null;
  newClassroomLockLanguage: boolean;
  newClassroomTasks: string[];
  newClassroomIsExam: boolean;
  newClassroomTestCode: string;
  newClassroomPresetupCode: string;
  newClassroomExamDate: string;
  newClassroomExamStartHour: string;
  newClassroomExamStartMinute: string;
  newClassroomExamEndHour: string;
  newClassroomExamEndMinute: string;
  classroomFormError: string | null;
  classroomActionError: string | null;
  classroomError: string | null;
  isCreatingClassroom: boolean;
  editingClassroomId: number | null;
  editingName: string;
  editingLanguageId: number | null;
  editingLockLanguage: boolean;
  editingTasks: string[];
  editingIsExam: boolean;
  editingTestCode: string;
  editingPresetupCode: string;
  editingExamDate: string;
  editingExamStartHour: string;
  editingExamStartMinute: string;
  editingExamEndHour: string;
  editingExamEndMinute: string;
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
  clearingClassroomCodes: Record<number, boolean>;
  clearClassroomCodesErrors: Record<number, string | null>;
  expandedClassrooms: Record<number, boolean>;
  onRefresh: () => void;
  onCreateClassroom: () => void;
  onChangeNewClassroomName: (value: string) => void;
  onChangeNewClassroomLanguage: (value: number | null) => void;
  onToggleNewClassroomLock: (value: boolean) => void;
  onChangeNewClassroomIsExam: (value: boolean) => void;
  onChangeNewClassroomTestCode: (value: string) => void;
  onChangeNewClassroomPresetupCode: (value: string) => void;
  onChangeNewClassroomExamDate: (value: string) => void;
  onChangeNewClassroomExamStartHour: (value: string) => void;
  onChangeNewClassroomExamStartMinute: (value: string) => void;
  onChangeNewClassroomExamEndHour: (value: string) => void;
  onChangeNewClassroomExamEndMinute: (value: string) => void;
  onEditClassroom: (classroom: ApiClassroom) => void;
  onCancelEditClassroom: () => void;
  onUpdateClassroom: () => void;
  onDeleteClassroom: (classroomId: number) => void;
  onChangeEditingName: (value: string) => void;
  onChangeEditingLanguage: (value: number | null) => void;
  onToggleEditingLockLanguage: (value: boolean) => void;
  onChangeEditingIsExam: (value: boolean) => void;
  onChangeEditingTestCode: (value: string) => void;
  onChangeEditingPresetupCode: (value: string) => void;
  onChangeEditingExamDate: (value: string) => void;
  onChangeEditingExamStartHour: (value: string) => void;
  onChangeEditingExamStartMinute: (value: string) => void;
  onChangeEditingExamEndHour: (value: string) => void;
  onChangeEditingExamEndMinute: (value: string) => void;
  onChangeNewClassroomTask: (index: number, value: string) => void;
  onAddNewClassroomTask: () => void;
  onRemoveNewClassroomTask: (index: number) => void;
  onChangeEditingTask: (index: number, value: string) => void;
  onAddEditingTask: () => void;
  onRemoveEditingTask: (index: number) => void;
  onAddUserToClassroom: (classroomId: number) => void;
  onChangeClassroomUserForm: (
    classroomId: number,
    updates: Partial<ClassroomUserForm>,
  ) => void;
  onChangeManagedUserForm: (
    userId: number,
    updates: Partial<ManagedUserForm>,
  ) => void;
  onSaveManagedUser: (classroomId: number, userId: number) => void;
  onDeleteManagedUser: (classroomId: number, userId: number) => void;
  onPreviewUserCode: (code: string) => void;
  onClearClassroomCodes: (classroomId: number) => void;
  onToggleClassroom: (classroomId: number) => void;
  onSetAllUsersActiveStatus: (classroomId: number, isActive: boolean) => void;
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
  newClassroomTasks,
  newClassroomIsExam,
  newClassroomTestCode,
  newClassroomPresetupCode,
  newClassroomExamDate,
  newClassroomExamStartHour,
  newClassroomExamStartMinute,
  newClassroomExamEndHour,
  newClassroomExamEndMinute,
  classroomFormError,
  classroomActionError,
  classroomError,
  isCreatingClassroom,
  editingClassroomId,
  editingName,
  editingLanguageId,
  editingLockLanguage,
  editingTasks,
  editingIsExam,
  editingTestCode,
  editingPresetupCode,
  editingExamDate,
  editingExamStartHour,
  editingExamStartMinute,
  editingExamEndHour,
  editingExamEndMinute,
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
  clearingClassroomCodes,
  clearClassroomCodesErrors,
  expandedClassrooms,
  onRefresh,
  onCreateClassroom,
  onChangeNewClassroomName,
  onChangeNewClassroomLanguage,
  onToggleNewClassroomLock,
  onChangeNewClassroomIsExam,
  onChangeNewClassroomTestCode,
  onChangeNewClassroomTimeLimit,
  onChangeNewClassroomPresetupCode,
  onChangeNewClassroomExamDate,
  onChangeNewClassroomExamStartHour,
  onChangeNewClassroomExamStartMinute,
  onChangeNewClassroomExamEndHour,
  onChangeNewClassroomExamEndMinute,
  onEditClassroom,
  onCancelEditClassroom,
  onUpdateClassroom,
  onDeleteClassroom,
  onChangeEditingName,
  onChangeEditingLanguage,
  onToggleEditingLockLanguage,
  onChangeEditingIsExam,
  onChangeEditingTestCode,
  onChangeEditingTimeLimit,
  onChangeEditingPresetupCode,
  onChangeEditingExamDate,
  onChangeEditingExamStartHour,
  onChangeEditingExamStartMinute,
  onChangeEditingExamEndHour,
  onChangeEditingExamEndMinute,
  onChangeNewClassroomTask,
  onAddNewClassroomTask,
  onRemoveNewClassroomTask,
  onChangeEditingTask,
  onAddEditingTask,
  onRemoveEditingTask,
  onAddUserToClassroom,
  onChangeClassroomUserForm,
  onChangeManagedUserForm,
  onSaveManagedUser,
  onDeleteManagedUser,
  onPreviewUserCode,
  onClearClassroomCodes,
  onToggleClassroom,
  onSetAllUsersActiveStatus,
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
      className="min-w-[220px] rounded-2xl border border-default-200 bg-content1 px-4 py-2 text-sm text-foreground shadow-sm transition hover:border-default-300 focus:border-primary focus:outline-none dark:border-default-100/40 dark:bg-default-100/10 dark:text-default-200"
      disabled={disabled}
      id={selectId}
      value={selectedId ?? ""}
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

  const renderTaskEditor = (
    idPrefix: string,
    tasks: string[],
    {
      disabled,
      onAdd,
      onChange,
      onRemove,
    }: {
      disabled: boolean;
      onAdd: () => void;
      onChange: (index: number, value: string) => void;
      onRemove: (index: number) => void;
    },
  ) => (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-600 dark:border-default-100/40 dark:bg-default-50/15 dark:text-default-300">
          Belum ada tugas yang ditambahkan.
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const inputId = `${idPrefix}-${index}`;
            return (
              <div
                key={inputId}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input
                  className="w-full flex-1 rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                  disabled={disabled}
                  id={inputId}
                  placeholder={`Tugas ke-${index + 1}`}
                  value={task}
                  onChange={(event) => onChange(index, event.target.value)}
                />
                <Button
                  className="sm:w-auto"
                  color="danger"
                  isDisabled={disabled}
                  size="sm"
                  variant="light"
                  onPress={() => onRemove(index)}
                >
                  Hapus
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 text-xs text-default-500 dark:text-default-300">
        <Button
          color="primary"
          isDisabled={disabled}
          size="sm"
          variant="flat"
          onPress={onAdd}
        >
          Tambah Baris Tugas
        </Button>
        <span>Setiap baris mewakili satu tugas.</span>
      </div>
    </div>
  );

  const renderClassroomList = () => {
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-default-200 bg-default-100 px-6 py-10 text-center text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-300">
          Memuat data classroom...
        </div>
      );
    }

    if (classrooms.length === 0) {
      return (
        <div className="rounded-2xl border border-default-200 bg-default-50 px-6 py-10 text-center text-sm text-default-600 dark:border-default-100/40 dark:bg-default-50/15 dark:text-default-300">
          Belum ada classroom yang terdaftar.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {classrooms.map((classroom) => {
          const isEditing = editingClassroomId === classroom.id;
          const isDeleting = deletingClassroomId === classroom.id;
          const isExpanded = expandedClassrooms[classroom.id] ?? false;
          const resolvedLanguage = findLanguageByName(
            classroom.programmingLanguage,
          );
          const languageLabel = resolvedLanguage
            ? `${resolvedLanguage.labLabel} • ${resolvedLanguage.name}`
            : classroom.programmingLanguage?.trim() || "Belum ditentukan";
          const languageStatus = resolvedLanguage
            ? classroom.languageLocked
              ? "Terkunci untuk user"
              : "User dapat mengubah bahasa"
            : "Belum diatur, user bebas memilih bahasa";
          const editingNameInputId = `classroom-name-${classroom.id}`;
          const editingLockCheckboxId = `classroom-lock-${classroom.id}`;
          const isClearingCodes = Boolean(clearingClassroomCodes[classroom.id]);
          const clearCodesError = clearClassroomCodesErrors[classroom.id] ?? null;
          const hasUsers = classroom.users.length > 0;

          return (
            <article
              key={classroom.id}
              className="rounded-3xl border border-default-200 bg-default-50 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] dark:border-default-100/40 dark:bg-default-50/10"
            >
              <div
                className="flex cursor-pointer flex-col gap-4 border-b border-default-200 pb-4 dark:border-default-100/40 md:flex-row md:items-start md:justify-between"
                onClick={() => onToggleClassroom(classroom.id)}
              >
                <div className="flex-1">
                  <h2 className="flex items-center gap-3 text-xl font-semibold text-default-900 dark:text-default-50">
                    <span>{classroom.name}</span>
                    <span className="text-lg font-semibold transition-transform duration-300">
                      {isExpanded ? "v" : ">"}
                    </span>
                  </h2>
                  <p className="text-sm text-default-600 dark:text-default-200">
                    Bahasa pemrograman:{" "}
                    <span className="font-medium text-default-800 dark:text-default-200">
                      {languageLabel}
                    </span>
                  </p>
                  <p className="text-xs text-default-500 dark:text-default-300">
                    Status bahasa: {languageStatus}
                  </p>
                  {classroom.isExam && classroom.examStart && classroom.examEnd ? (
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      Ujian: {formatDateTime(classroom.examStart)} - {formatDateTime(classroom.examEnd)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-3 text-xs text-default-500 dark:text-default-300 md:items-end md:text-right">
                  <div>
                    <p>Dibuat: {formatDateTime(classroom.createdAt)}</p>
                    <p>Diubah: {formatDateTime(classroom.updatedAt)}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClassroom(classroom);
                      }}
                    >
                      Ubah
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      isLoading={isDeleting}
                      variant="flat"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClassroom(classroom.id);
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-5 space-y-5">

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label
                          className="text-sm font-medium text-foreground dark:text-default-200"
                          htmlFor={editingNameInputId}
                        >
                          Nama Classroom
                        </label>
                        <input
                          className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                          disabled={isSavingClassroom}
                          id={editingNameInputId}
                          value={editingName}
                          onChange={(event) =>
                            onChangeEditingName(event.target.value)
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          className="text-sm font-medium text-foreground dark:text-default-200"
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
                        <p className="text-xs text-default-500 dark:text-default-300">
                          Pilih bahasa untuk menetapkan editor. Biarkan kosong
                          agar user bebas memilih.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        className="text-sm font-medium text-foreground dark:text-default-200"
                        htmlFor={`editing-presetup-code-${classroom.id}`}
                      >
                        Kode Awal (Presetup)
                      </label>
                      <textarea
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 font-code text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        disabled={isSavingClassroom}
                        id={`editing-presetup-code-${classroom.id}`}
                        placeholder="Kode yang akan muncul di editor user saat login"
                        rows={5}
                        value={editingPresetupCode}
                        onChange={(event) =>
                          onChangeEditingPresetupCode(event.target.value)
                        }
                      />
                      <p className="text-xs text-default-500 dark:text-default-300">
                        Kode ini akan menjadi konten awal di editor user.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        color="primary"
                        isLoading={isSavingClassroom}
                        variant="solid"
                        onPress={onUpdateClassroom}
                      >
                        Simpan Perubahan
                      </Button>
                      <Button
                        disabled={isSavingClassroom}
                        variant="flat"
                        onPress={onCancelEditClassroom}
                      >
                        Batal
                      </Button>
                    </div>
                    <label
                      className="flex items-center gap-2 text-sm text-default-600 dark:text-default-300"
                      htmlFor={editingLockCheckboxId}
                    >
                      <input
                        checked={
                          Boolean(editingLanguageId) && editingLockLanguage
                        }
                        className="h-4 w-4 rounded border-default-300 text-primary focus:ring-primary"
                        disabled={
                          isSavingClassroom || editingLanguageId === null
                        }
                        id={editingLockCheckboxId}
                        type="checkbox"
                        onChange={(event) =>
                          onToggleEditingLockLanguage(event.target.checked)
                        }
                      />
                      Kunci bahasa pemrograman untuk user
                    </label>
                    {editingLanguageId === null ? (
                      <p className="text-xs text-default-500 dark:text-default-300">
                        Penguncian bahasa hanya tersedia jika bahasa telah
                        dipilih.
                      </p>
                    ) : null}
                    {editingError ? (
                      <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
                        {editingError}
                      </div>
                    ) : null}
                    <div className="space-y-3 rounded-2xl border border-default-200 bg-default-100/50 p-4 dark:border-default-100/40 dark:bg-default-100/10">
                      <h4 className="text-sm font-semibold text-foreground dark:text-default-200">
                        Daftar Tugas Classroom
                      </h4>
                      {renderTaskEditor(`editing-task-${classroom.id}`, editingTasks, {
                        disabled: isSavingClassroom,
                        onAdd: onAddEditingTask,
                        onChange: onChangeEditingTask,
                        onRemove: onRemoveEditingTask,
                      })}
                    </div>
                    <div className="space-y-3 rounded-2xl border border-default-200 bg-default-100/50 p-4 dark:border-default-100/40 dark:bg-default-100/10">
                      <h4 className="text-sm font-semibold text-foreground dark:text-default-200">
                        Pengaturan Ujian
                      </h4>
                      <div className="flex flex-col gap-3">
                        <label
                          className="flex items-center gap-2 text-sm text-default-600 dark:text-default-300"
                          htmlFor={`editing-is-exam-${classroom.id}`}
                        >
                          <input
                            checked={editingIsExam}
                            className="h-4 w-4 rounded border-default-300 text-primary focus:ring-primary"
                            disabled={isSavingClassroom}
                            id={`editing-is-exam-${classroom.id}`}
                            type="checkbox"
                            onChange={(event) =>
                              onChangeEditingIsExam(event.target.checked)
                            }
                          />
                          Aktifkan mode ujian
                        </label>
                        {editingIsExam && (
                          <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="flex flex-col gap-2">
                                <label
                                  className="text-sm font-medium text-foreground dark:text-default-200"
                                  htmlFor={`editing-exam-date-${classroom.id}`}
                                >
                                  Tanggal Ujian
                                </label>
                                <input
                                  className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                                  disabled={isSavingClassroom}
                                  id={`editing-exam-date-${classroom.id}`}
                                  type="date"
                                  value={editingExamDate}
                                  onChange={(event) =>
                                    onChangeEditingExamDate(event.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="flex flex-col gap-2">
                                <label
                                  className="text-sm font-medium text-foreground dark:text-default-200"
                                  htmlFor={`editing-exam-start-hour-${classroom.id}`}
                                >
                                  Waktu Mulai
                                </label>
                                <div className="flex gap-2">
                                  <select
                                    className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                                    disabled={isSavingClassroom}
                                    id={`editing-exam-start-hour-${classroom.id}`}
                                    value={editingExamStartHour}
                                    onChange={(event) =>
                                      onChangeEditingExamStartHour(event.target.value)
                                    }
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={i.toString().padStart(2, '0')}>
                                        {i.toString().padStart(2, '0')}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                                    disabled={isSavingClassroom}
                                    id={`editing-exam-start-minute-${classroom.id}`}
                                    value={editingExamStartMinute}
                                    onChange={(event) =>
                                      onChangeEditingExamStartMinute(event.target.value)
                                    }
                                  >
                                    {Array.from({ length: 12 }, (_, i) => (
                                      <option key={i} value={(i * 5).toString().padStart(2, '0')}>
                                        {(i * 5).toString().padStart(2, '0')}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <label
                                  className="text-sm font-medium text-foreground dark:text-default-200"
                                  htmlFor={`editing-exam-end-hour-${classroom.id}`}
                                >
                                  Waktu Selesai
                                </label>
                                <div className="flex gap-2">
                                  <select
                                    className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                                    disabled={isSavingClassroom}
                                    id={`editing-exam-end-hour-${classroom.id}`}
                                    value={editingExamEndHour}
                                    onChange={(event) =>
                                      onChangeEditingExamEndHour(event.target.value)
                                    }
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={i.toString().padStart(2, '0')}>
                                        {i.toString().padStart(2, '0')}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                                    disabled={isSavingClassroom}
                                    id={`editing-exam-end-minute-${classroom.id}`}
                                    value={editingExamEndMinute}
                                    onChange={(event) =>
                                      onChangeEditingExamEndMinute(event.target.value)
                                    }
                                  >
                                    {Array.from({ length: 12 }, (_, i) => (
                                      <option key={i} value={(i * 5).toString().padStart(2, '0')}>
                                        {(i * 5).toString().padStart(2, '0')}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label
                                className="text-sm font-medium text-foreground dark:text-default-200"
                                htmlFor={`editing-test-code-${classroom.id}`}
                              >
                                Kode Testing
                              </label>
                              <textarea
                                className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 font-code text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                                disabled={isSavingClassroom}
                                id={`editing-test-code-${classroom.id}`}
                                placeholder="Kode untuk testing jawaban user"
                                rows={5}
                                value={editingTestCode}
                                onChange={(event) =>
                                  onChangeEditingTestCode(event.target.value)
                                }
                              />
                              <p className="text-xs text-default-500 dark:text-default-300">
                                Kode ini akan digunakan untuk membungkus dan mengetes kode dari user.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {!isEditing ? (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-default-500 dark:text-default-200">
                      Daftar Tugas ({classroom.tasks.length})
                    </h3>
                    {classroom.tasks.length === 0 ? (
                      <p className="mt-3 rounded-2xl border border-default-200 bg-default-100 px-4 py-3 text-sm text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-300">
                        Belum ada tugas yang ditetapkan untuk classroom ini.
                      </p>
                    ) : (
                      <ol className="mt-3 space-y-2 text-sm text-foreground dark:text-default-200">
                        {classroom.tasks.map((task, index) => (
                          <li
                            key={`${classroom.id}-task-${index}`}
                            className="flex gap-3 rounded-2xl border border-default-200 bg-default-50 px-4 py-3 dark:border-default-100/40 dark:bg-default-50/10"
                          >
                            <span className="mt-0.5 text-xs font-semibold text-default-400 dark:text-default-500">
                              {index + 1}.
                            </span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                ) : null}

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-default-500 dark:text-default-200">
                      Daftar User ({classroom.users.length})
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => onSetAllUsersActiveStatus(classroom.id, true)}
                        isDisabled={!hasUsers}
                      >
                        Aktifkan Semua
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => onSetAllUsersActiveStatus(classroom.id, false)}
                        isDisabled={!hasUsers}
                      >
                        Nonaktifkan Semua
                      </Button>
                      <Button
                        color="warning"
                        size="sm"
                        isDisabled={!hasUsers}
                        isLoading={isClearingCodes}
                        variant="flat"
                        onPress={() => onClearClassroomCodes(classroom.id)}
                      >
                        Hapus Semua Kode
                      </Button>
                    </div>
                  </div>
                  {clearCodesError && (
                    <p className="mt-2 text-xs text-danger-500 dark:text-danger-300">
                      {clearCodesError}
                    </p>
                  )}
                  {classroom.users.length === 0 ? (
                    <p className="mt-3 rounded-2xl border border-default-200 bg-default-100 px-4 py-3 text-sm text-default-600 dark:border-default-100/40 dark:bg-default-100/15 dark:text-default-300">
                      Belum ada user dalam classroom ini.
                    </p>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full divide-y divide-default-200 text-left text-sm text-foreground dark:divide-default-100/20 dark:text-default-200">
                        <thead className="bg-default-100 text-xs uppercase text-default-500 dark:bg-default-100/20 dark:text-default-300">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Nama</th>
                            <th className="px-3 py-2 font-semibold">Status</th>
                            <th className="px-3 py-2 font-semibold">NPM</th>
                            <th className="px-3 py-2 font-semibold">Kode</th>
                            <th className="px-3 py-2 font-semibold">
                              Terdaftar
                            </th>
                            <th className="px-3 py-2 font-semibold">
                              Pembaruan
                            </th>
                            <th className="px-3 py-2 text-right font-semibold">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-default-200 dark:divide-default-100/20">
                          {classroom.users.map((user) => {
                            const managedForm = managedUserForms[user.id] ?? {
                              name: user.name,
                              npm: user.npm,
                              active: user.active,
                            };
                            const isSavingUser =
                              managedUserSaving[user.id] ?? false;
                            const isDeletingUser =
                              managedUserDeleting[user.id] ?? false;
                            const isBusy = isSavingUser || isDeletingUser;
                            const errorMessage =
                              managedUserErrors[user.id] ?? null;
                            const hasCode = Boolean(user.code?.trim());

                            return (
                              <tr
                                key={user.id}
                                className="bg-default-50 dark:bg-transparent"
                              >
                                <td className="px-3 py-2 font-medium text-default-800 dark:text-default-200">
                                  <div className="space-y-2">
                                    <input
                                      className="w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/10 dark:text-default-100"
                                      disabled={isBusy}
                                      value={managedForm.name}
                                      onChange={(event) =>
                                        onChangeManagedUserForm(user.id, {
                                          name: event.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <UserStatusToggle
                                    classroomId={classroom.id}
                                    userId={user.id}
                                    initialIsActive={user.active}
                                    isBusy={isBusy}
                                  />
                                </td>
                                <td className="px-3 py-2 text-default-600 dark:text-default-300">
                                  <input
                                    className="w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/10 dark:text-default-100"
                                    disabled={isBusy}
                                    value={managedForm.npm}
                                    onChange={(event) =>
                                      onChangeManagedUserForm(user.id, {
                                        npm: event.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td className="px-3 py-2 text-default-600 dark:text-default-300">
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      className="font-code"
                                      color="secondary"
                                      isDisabled={!hasCode}
                                      size="sm"
                                      variant="flat"
                                      onPress={() =>
                                        onPreviewUserCode(user.code)
                                      }
                                    >
                                      Lihat
                                    </Button>
                                    {!hasCode ? (
                                      <p className="text-xs text-default-500 dark:text-default-300">
                                        Belum ada kode yang dijalankan.
                                      </p>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-default-500 dark:text-default-300">
                                  {formatDateTime(user.createdAt)}
                                </td>
                                <td className="px-3 py-2 text-default-500 dark:text-default-300">
                                  {formatDateTime(user.updatedAt)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="flex gap-2">
                                      <Button
                                        color="primary"
                                        isDisabled={isDeletingUser}
                                        isLoading={isSavingUser}
                                        size="sm"
                                        variant="flat"
                                        onPress={() =>
                                          onSaveManagedUser(
                                            classroom.id,
                                            user.id,
                                          )
                                        }
                                      >
                                        Simpan Data
                                      </Button>
                                      <Button
                                        color="danger"
                                        isDisabled={isSavingUser}
                                        isLoading={isDeletingUser}
                                        size="sm"
                                        variant="flat"
                                        onPress={() =>
                                          onDeleteManagedUser(
                                            classroom.id,
                                            user.id,
                                          )
                                        }
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
                    <h4 className="text-sm font-semibold text-foreground dark:text-default-200">
                      Tambah User ke Classroom
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        disabled={classroomUserLoading[classroom.id]}
                        placeholder="Nama user"
                        value={classroomUserForms[classroom.id]?.name ?? ""}
                        onChange={(event) =>
                          onChangeClassroomUserForm(classroom.id, {
                            name: event.target.value,
                          })
                        }
                      />
                      <input
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        disabled={classroomUserLoading[classroom.id]}
                        placeholder="NPM"
                        value={classroomUserForms[classroom.id]?.npm ?? ""}
                        onChange={(event) =>
                          onChangeClassroomUserForm(classroom.id, {
                            npm: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {classroomUserErrors[classroom.id] ? (
                        <p className="text-sm text-danger-500 dark:text-danger-300">
                          {classroomUserErrors[classroom.id]}
                        </p>
                      ) : (
                        <span className="text-xs text-default-500 dark:text-default-300">
                          Nama dan NPM akan digunakan untuk membuat akun user
                          pada classroom.
                        </span>
                      )}
                      <Button
                        color="primary"
                        isLoading={classroomUserLoading[classroom.id]}
                        variant="solid"
                        onPress={() => onAddUserToClassroom(classroom.id)}
                      >
                        Tambahkan User
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  const newClassroomNameId = "new-classroom-name";
  const newClassroomLockId = "new-classroom-lock";

  return (
    <section className="space-y-4 rounded-3xl border border-default-200 bg-default-50 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] dark:border-default-100/40 dark:bg-default-50/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-default-900 dark:text-default-50">
            Manajemen Classroom
          </h2>
          <p className="text-sm text-default-600 dark:text-default-200">
            Kelola data classroom beserta bahasa pemrograman yang digunakan.
          </p>
        </div>
        <Button
          color="secondary"
          isLoading={isRefreshing || isLoading}
          variant="solid"
          onPress={onRefresh}
        >
          Muat Ulang Classroom
        </Button>
      </div>

      <div className="rounded-2xl border border-default-200 bg-default-100/40 p-5 dark:border-default-100/40 dark:bg-default-100/10">
        <h3 className="text-sm font-semibold text-foreground dark:text-default-200">
          Tambah Classroom
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-foreground dark:text-default-200"
              htmlFor={newClassroomNameId}
            >
              Nama Classroom
            </label>
            <input
              className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
              disabled={isCreatingClassroom}
              id={newClassroomNameId}
              placeholder="Nama classroom"
              value={newClassroomName}
              onChange={(event) => onChangeNewClassroomName(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-foreground dark:text-default-200"
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
            <p className="text-xs text-default-500 dark:text-default-300">
              Pilih bahasa untuk menetapkan editor. Biarkan kosong agar user
              memilih sendiri.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label
              className="text-sm font-medium text-foreground dark:text-default-200"
              htmlFor="new-classroom-presetup-code"
            >
              Kode Awal (Presetup)
            </label>
            <textarea
              className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 font-code text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
              disabled={isCreatingClassroom}
              id="new-classroom-presetup-code"
              placeholder="Kode yang akan muncul di editor user saat login"
              rows={5}
              value={newClassroomPresetupCode}
              onChange={(event) =>
                onChangeNewClassroomPresetupCode(event.target.value)
              }
            />
            <p className="text-xs text-default-500 dark:text-default-300">
              Kode ini akan menjadi konten awal di editor user.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-3 rounded-2xl border border-default-200 bg-default-100/60 p-4 dark:border-default-100/40 dark:bg-default-100/10">
          <h4 className="text-sm font-semibold text-foreground dark:text-default-200">
            Daftar Tugas Classroom
          </h4>
          {renderTaskEditor("new-classroom-task", newClassroomTasks, {
            disabled: isCreatingClassroom,
            onAdd: onAddNewClassroomTask,
            onChange: onChangeNewClassroomTask,
            onRemove: onRemoveNewClassroomTask,
          })}
        </div>
        <div className="mt-4 space-y-3 rounded-2xl border border-default-200 bg-default-100/60 p-4 dark:border-default-100/40 dark:bg-default-100/10">
          <h4 className="text-sm font-semibold text-foreground dark:text-default-200">
            Pengaturan Ujian
          </h4>
          <div className="flex flex-col gap-3">
            <label
              className="flex items-center gap-2 text-sm text-default-600 dark:text-default-300"
              htmlFor="new-classroom-is-exam"
            >
              <input
                checked={newClassroomIsExam}
                className="h-4 w-4 rounded border-default-300 text-primary focus:ring-primary"
                disabled={isCreatingClassroom}
                id="new-classroom-is-exam"
                type="checkbox"
                onChange={(event) =>
                  onChangeNewClassroomIsExam(event.target.checked)
                }
              />
              Aktifkan mode ujian
            </label>
            {newClassroomIsExam && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-foreground dark:text-default-200"
                      htmlFor="new-classroom-exam-date"
                    >
                      Tanggal Ujian
                    </label>
                    <input
                      className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                      disabled={isCreatingClassroom}
                      id="new-classroom-exam-date"
                      type="date"
                      value={newClassroomExamDate}
                      onChange={(event) =>
                        onChangeNewClassroomExamDate(event.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-foreground dark:text-default-200"
                      htmlFor="new-classroom-exam-start-hour"
                    >
                      Waktu Mulai
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        disabled={isCreatingClassroom}
                        id="new-classroom-exam-start-hour"
                        value={newClassroomExamStartHour}
                        onChange={(event) =>
                          onChangeNewClassroomExamStartHour(event.target.value)
                        }
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        disabled={isCreatingClassroom}
                        id="new-classroom-exam-start-minute"
                        value={newClassroomExamStartMinute}
                        onChange={(event) =>
                          onChangeNewClassroomExamStartMinute(event.target.value)
                        }
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={(i * 5).toString().padStart(2, '0')}>
                            {(i * 5).toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-foreground dark:text-default-200"
                      htmlFor="new-classroom-exam-end-hour"
                    >
                      Waktu Selesai
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        disabled={isCreatingClassroom}
                        id="new-classroom-exam-end-hour"
                        value={newClassroomExamEndHour}
                        onChange={(event) =>
                          onChangeNewClassroomExamEndHour(event.target.value)
                        }
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                        disabled={isCreatingClassroom}
                        id="new-classroom-exam-end-minute"
                        value={newClassroomExamEndMinute}
                        onChange={(event) =>
                          onChangeNewClassroomExamEndMinute(event.target.value)
                        }
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={(i * 5).toString().padStart(2, '0')}>
                            {(i * 5).toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-foreground dark:text-default-200"
                    htmlFor="new-classroom-test-code"
                  >
                    Kode Testing
                  </label>
                  <textarea
                    className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 font-code text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
                    disabled={isCreatingClassroom}
                    id="new-classroom-test-code"
                    placeholder="Kode untuk testing jawaban user"
                    rows={5}
                    value={newClassroomTestCode}
                    onChange={(event) =>
                      onChangeNewClassroomTestCode(event.target.value)
                    }
                  />
                  <p className="text-xs text-default-500 dark:text-default-300">
                    Kode ini akan digunakan untuk membungkus dan mengetes kode dari user.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label
            className="flex items-center gap-2 text-sm text-default-600 dark:text-default-300"
            htmlFor={newClassroomLockId}
          >
            <input
              checked={
                Boolean(newClassroomLanguageId) && newClassroomLockLanguage
              }
              className="h-4 w-4 rounded border-default-300 text-primary focus:ring-primary"
              disabled={isCreatingClassroom || newClassroomLanguageId === null}
              id={newClassroomLockId}
              type="checkbox"
              onChange={(event) =>
                onToggleNewClassroomLock(event.target.checked)
              }
            />
            Kunci bahasa pemrograman untuk user
          </label>
          <Button
            color="primary"
            isLoading={isCreatingClassroom}
            variant="solid"
            onPress={onCreateClassroom}
          >
            Simpan Classroom
          </Button>
        </div>
        {classroomFormError ? (
          <p className="mt-2 text-sm text-danger-500 dark:text-danger-300">
            {classroomFormError}
          </p>
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
