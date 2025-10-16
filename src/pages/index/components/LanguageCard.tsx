import { ChangeEvent } from "react";

import { type ExtendedLanguage } from "@/contexts/language-context";

type LanguageCardProps = {
  activeLanguage: ExtendedLanguage;
  availableLanguages: ExtendedLanguage[];
  archivedLanguages: ExtendedLanguage[];
  onSelect: (languageId: number) => void;
  isLanguageLocked: boolean;
  lockedLanguageName?: string | null;
  lockedByClassroom?: string | null;
};

export const LanguageCard = ({
  activeLanguage,
  availableLanguages,
  archivedLanguages,
  isLanguageLocked,
  lockedLanguageName,
  lockedByClassroom,
  onSelect,
}: LanguageCardProps) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (isLanguageLocked) {
      return;
    }

    onSelect(Number(event.target.value));
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-default-200 bg-default-50/60 px-6 py-5 shadow-lg backdrop-blur-sm dark:border-default-100/40 dark:bg-default-50/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-default-900 dark:text-default-50">
            {activeLanguage.labLabel}
          </h1>
          <p className="text-sm text-default-600 dark:text-default-400">
            {activeLanguage.name} • ID {activeLanguage.id}
            {activeLanguage.isArchived ? " (Archived)" : ""}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center">
          <label
            className="text-sm font-medium text-default-600 dark:text-default-400 sm:mr-2"
            htmlFor="language-select"
          >
            Pilih bahasa
          </label>
          <select
            id="language-select"
            className="min-w-[220px] rounded-2xl border border-default-200 bg-white px-4 py-2 text-sm text-default-700 shadow-sm transition hover:border-default-300 focus:border-primary focus:outline-none dark:border-default-100/40 dark:bg-default-100/10 dark:text-default-200"
            aria-disabled={isLanguageLocked}
            disabled={isLanguageLocked}
            value={activeLanguage.id}
            onChange={handleChange}
          >
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
        </div>
      </div>
      {activeLanguage.isArchived ? (
        <p className="rounded-2xl border border-warning-200/60 bg-warning-100/60 px-4 py-2 text-xs text-warning-800 dark:border-warning-200/40 dark:bg-warning-300/10 dark:text-warning-200">
          Bahasa ini sudah tidak lagi didukung secara resmi di Judge0. Hasil eksekusi mungkin tidak stabil.
        </p>
      ) : null}
      {isLanguageLocked ? (
        <p className="rounded-2xl border border-info-200/60 bg-info-100/60 px-4 py-2 text-xs text-info-800 dark:border-info-200/40 dark:bg-info-300/10 dark:text-info-200">
          Bahasa pemrograman dikunci ke <strong className="font-semibold">{lockedLanguageName ?? activeLanguage.name}</strong>
          {lockedByClassroom ? ` oleh classroom ${lockedByClassroom}.` : "."}
        </p>
      ) : null}
    </div>
  );
};
