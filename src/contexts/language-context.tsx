import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  judge0Languages,
  type Judge0Language,
} from "@/constants/judge0-languages";

type ExtendedLanguage = Judge0Language & {
  shortName: string;
  labLabel: string;
  prismLanguage: string;
};

type LanguageContextValue = {
  languages: ExtendedLanguage[];
  activeLanguage: ExtendedLanguage;
  setLanguageById: (languageId: number) => void;
  description: string;
};

const LANGUAGE_STORAGE_KEY = "lab-selected-language-id";
const DEFAULT_DESCRIPTION_SUFFIX =
  "untuk belajar dan menjalankan kode secara interaktif.";

const PRISM_ALIASES: Record<string, string> = {
  Assembly: "nasm",
  Bash: "bash",
  Basic: "basic",
  C: "c",
  "C++": "cpp",
  Clojure: "clojure",
  "C#": "csharp",
  COBOL: "cobol",
  "Common Lisp": "commonlisp",
  Crystal: "crystal",
  D: "d",
  Elixir: "elixir",
  Erlang: "erlang",
  Executable: "plain",
  "F#": "fsharp",
  Fortran: "fortran",
  Go: "go",
  Groovy: "groovy",
  Haskell: "haskell",
  Insect: "plain",
  Java: "java",
  JavaScript: "javascript",
  Kotlin: "kotlin",
  Lua: "lua",
  "Multi-file program": "plain",
  "Objective-C": "objectivec",
  OCaml: "ocaml",
  Octave: "matlab",
  Pascal: "pascal",
  Perl: "perl",
  PHP: "php",
  "Plain Text": "plain",
  Prolog: "prolog",
  Python: "python",
  R: "r",
  Ruby: "ruby",
  Rust: "rust",
  Scala: "scala",
  SQL: "sql",
  Swift: "swift",
  TypeScript: "typescript",
  "Visual Basic.Net": "vbnet",
};

const isBrowser = typeof window !== "undefined";

const getShortName = (name: string) => name.split(" (")[0] ?? name;

const extendLanguage = (language: Judge0Language): ExtendedLanguage => {
  const shortName = getShortName(language.name);
  const prismLanguage = PRISM_ALIASES[shortName] ?? "plain";

  return {
    ...language,
    shortName,
    labLabel: `${shortName}-LAB`,
    prismLanguage,
  };
};

const resolvedLanguages = judge0Languages.map(extendLanguage);

const getInitialLanguage = (): ExtendedLanguage => {
  const envValue = Number.parseInt(
    import.meta.env.VITE_JUDGE0_LANGUAGE_ID ?? "",
    10,
  );

  const storedValue = isBrowser
    ? Number.parseInt(
        window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? "",
        10,
      )
    : Number.NaN;

  const preferredId = Number.isFinite(storedValue) ? storedValue : envValue;

  const fallbackLanguage =
    resolvedLanguages.find(
      (language) => !language.isArchived && language.id === preferredId,
    ) ??
    resolvedLanguages.find((language) => language.id === preferredId) ??
    resolvedLanguages.find((language) => !language.isArchived) ??
    resolvedLanguages[0];

  return fallbackLanguage;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [activeLanguage, setActiveLanguage] =
    useState<ExtendedLanguage>(getInitialLanguage);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      String(activeLanguage.id),
    );
  }, [activeLanguage.id]);

  const description = useMemo(
    () =>
      `Platform latihan ${activeLanguage.labLabel} ${DEFAULT_DESCRIPTION_SUFFIX}`,
    [activeLanguage.labLabel],
  );

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    document.title = activeLanguage.labLabel;

    const updateMeta = (selector: string) => {
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) {
        meta.setAttribute("content", description);
      }
    };

    const updateTitleMeta = (selector: string) => {
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) {
        meta.setAttribute("content", activeLanguage.labLabel);
      }
    };

    updateTitleMeta('meta[property="og:title"]');
    updateMeta('meta[name="description"]');
    updateMeta('meta[property="og:description"]');
  }, [activeLanguage.labLabel, description]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      languages: resolvedLanguages,
      activeLanguage,
      description,
      setLanguageById: (languageId: number) => {
        const nextLanguage =
          resolvedLanguages.find((language) => language.id === languageId) ??
          resolvedLanguages[0];

        setActiveLanguage(nextLanguage);
      },
    }),
    [activeLanguage, description],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
