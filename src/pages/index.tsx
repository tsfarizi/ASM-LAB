import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type SVGProps,
} from "react";
import { Button } from "@heroui/button";
import { useLocation, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "@/constants/api";
import { useLanguage } from "@/contexts/language-context";
import DefaultLayout from "@/layouts/default";

const CODE_STORAGE_PREFIX = "lab-editor-code";
const SUBMISSION_ENDPOINT = `${API_BASE_URL}/api/judge0/submissions`;
const isBrowser = typeof window !== "undefined";

const getCodeStorageKey = (languageId: number) =>
  `${CODE_STORAGE_PREFIX}-${languageId}`;

const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M8.5 5.5v13a1 1 0 001.53.85l9.5-6.5a1 1 0 000-1.7l-9.5-6.5A1 1 0 008.5 5.5z"
      fill="currentColor"
    />
  </svg>
);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const withTrailingNbsp = (value: string) =>
  value.length === 0 ? "&nbsp;" : value.replace(/\n$/g, "\n&nbsp;");

const defaultInstructions = (languageName: string, shortName: string) => [
  `Tulis program ${languageName} sesuai kebutuhan latihan.`,
  `Pastikan program menghasilkan output ${shortName} sesuai spesifikasi soal.`,
  `Tekan <strong>Run</strong> untuk mengirim kode ${shortName} ke server agar dijalankan (proxy Judge0) dan lihat hasilnya di panel Output.`,
];

const assemblyInstructions = (languageName: string) => [
  `Tulis program ${languageName} dengan sintaks NASM.`,
  "Pastikan program menghasilkan output melalui syscall yang sesuai.",
  "Tekan <strong>Run</strong> untuk mengirim kode Assembly ke server agar dijalankan (proxy Judge0) dan lihat hasilnya di panel Output.",
];

export default function IndexPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeLanguage, languages, setLanguageById } = useLanguage();

  const codeStorageKey = useMemo(
    () => getCodeStorageKey(activeLanguage.id),
    [activeLanguage.id],
  );

  const [code, setCode] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("&nbsp;");
  const [isRunning, setIsRunning] = useState(false);
  const defaultOutput = useMemo(
    () =>
      `Hasil eksekusi kode ${activeLanguage.labLabel} akan tampil di sini.`,
    [activeLanguage.labLabel],
  );
  const [output, setOutput] = useState(defaultOutput);
  useEffect(() => {
    const state = location.state as { previewCode?: string } | null;

    if (state?.previewCode !== undefined) {
      const nextCode = state.previewCode;
      setIsPreviewMode(true);
      setCode(nextCode);
      setOutput(defaultOutput);
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [defaultOutput, location.pathname, location.search, location.state, navigate]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightContainerRef = useRef<HTMLDivElement>(null);
  const lineNumbersContainerRef = useRef<HTMLDivElement>(null);
  const lineNumbersInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOutput(defaultOutput);
  }, [defaultOutput]);

  useEffect(() => {
    if (isPreviewMode) {
      return;
    }

    if (!isBrowser) {
      setCode("");

      return;
    }

    const cached = window.localStorage.getItem(codeStorageKey);
    setCode(cached ?? "");
  }, [codeStorageKey, isPreviewMode]);

  const availableLanguages = useMemo(
    () => languages.filter((language) => !language.isArchived),
    [languages],
  );

  const archivedLanguages = useMemo(
    () => languages.filter((language) => language.isArchived),
    [languages],
  );

  const lineNumbers = useMemo(() => {
    const totalLines = code.split("\n").length;

    return Array.from({ length: Math.max(totalLines, 1) }, (_, index) => index + 1);
  }, [code]);

  useEffect(() => {
    let cancelled = false;

    if (!code) {
      setHighlightedCode("&nbsp;");

      return () => {
        cancelled = true;
      };
    }

    const fallbackHtml = withTrailingNbsp(escapeHtml(code));
    setHighlightedCode(fallbackHtml);

    if (!isBrowser) {
      return () => {
        cancelled = true;
      };
    }

    const prism: {
      languages?: Record<string, unknown>;
      highlight?: (value: string, grammar: unknown, language: string) => string;
      plugins?: Record<string, unknown>;
    } | null = (window as any).Prism ?? null;

    if (!prism?.languages || typeof prism.highlight !== "function") {
      return () => {
        cancelled = true;
      };
    }

    const language = activeLanguage.prismLanguage || "plain";

    const applyHighlight = () => {
      if (cancelled) {
        return;
      }

      const grammar =
        prism.languages?.[language] ??
        (language === "plain"
          ? prism.languages?.plain || prism.languages?.none
          : undefined);

      if (!grammar) {
        return;
      }

      try {
        const html = prism.highlight?.(code, grammar, language);
        if (!cancelled && typeof html === "string" && html.length > 0) {
          setHighlightedCode(withTrailingNbsp(html));
        }
      } catch {
        // keep fallback highlight
      }
    };

    if (!prism.languages?.[language]) {
      const autoloader = prism.plugins?.autoloader as {
        loadLanguages?: (languages: string[], callback: () => void) => void;
      };

      autoloader?.loadLanguages?.([language], applyHighlight);

      return () => {
        cancelled = true;
      };
    }

    applyHighlight();

    return () => {
      cancelled = true;
    };
  }, [code, activeLanguage.prismLanguage]);

  const handleScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const highlightContainer = highlightContainerRef.current;
    const lineContainer = lineNumbersContainerRef.current;
    const lineInner = lineNumbersInnerRef.current;

    if (textarea && highlightContainer) {
      highlightContainer.scrollTop = textarea.scrollTop;
      highlightContainer.scrollLeft = textarea.scrollLeft;
    }

    if (textarea && lineContainer && lineInner) {
      lineInner.style.transform = `translateY(-${textarea.scrollTop}px)`;
    }
  }, []);

  useEffect(() => {
    handleScroll();
  }, [code, highlightedCode, handleScroll]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      setCode(nextValue);

      if (isBrowser && !isPreviewMode) {
        window.localStorage.setItem(codeStorageKey, nextValue);
      }
    },
    [codeStorageKey, isPreviewMode],
  );

  const instructions = useMemo(() => {
    if (activeLanguage.shortName === "Assembly") {
      return assemblyInstructions(activeLanguage.name);
    }

    return defaultInstructions(activeLanguage.name, activeLanguage.shortName);
  }, [activeLanguage.name, activeLanguage.shortName]);

  const handleRun = useCallback(async () => {
    if (isPreviewMode) {
      return;
    }

    const trimmed = code.trim();

    if (!trimmed) {
      setOutput("Tidak ada kode yang dapat dijalankan.");

      return;
    }

    setIsRunning(true);
    setOutput(
      `Mengirim kode ${activeLanguage.shortName} ke server untuk dieksekusi...`,
    );

    try {
      const response = await fetch(SUBMISSION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: trimmed,
          language_id: activeLanguage.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const sections: string[] = [];

      const statusDescription =
        result?.status?.description ?? "Status tidak diketahui";

      sections.push(`Status: ${statusDescription}`);

      if (typeof result?.stdout === "string" && result.stdout.length > 0) {
        sections.push(`Stdout:\n${result.stdout}`);
      }

      if (typeof result?.stderr === "string" && result.stderr.length > 0) {
        sections.push(`Stderr:\n${result.stderr}`);
      }

      if (
        typeof result?.compile_output === "string" &&
        result.compile_output.length > 0
      ) {
        sections.push(`Compile Output:\n${result.compile_output}`);
      }

      if (typeof result?.message === "string" && result.message.length > 0) {
        sections.push(`Message:\n${result.message}`);
      }

      setOutput(sections.join("\n\n"));
    } catch (error) {
      setOutput(
        `Terjadi kesalahan saat mengeksekusi kode: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      setIsRunning(false);
    }
  }, [activeLanguage.id, activeLanguage.shortName, code, isPreviewMode]);

  const handleExitPreview = useCallback(() => {
    setIsPreviewMode(false);
    setIsRunning(false);

    if (isBrowser) {
      const cached = window.localStorage.getItem(codeStorageKey);
      setCode(cached ?? "");
    } else {
      setCode("");
    }

    setOutput(defaultOutput);
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [codeStorageKey, defaultOutput, location.pathname, location.search, navigate]);

  return (
    <DefaultLayout>
      <section className="flex min-h-[calc(100vh-5.5rem)] flex-col gap-6 py-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-5">
          {isPreviewMode ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-blue-300/60 bg-blue-50/80 px-6 py-5 text-sm text-blue-800 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] dark:border-blue-200/40 dark:bg-blue-500/10 dark:text-blue-100">
              <div>
                <h2 className="text-base font-semibold text-blue-900 dark:text-blue-100">
                  Mode Pratinjau Kode User
                </h2>
                <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-100/80">
                  Editor dalam keadaan hanya-baca. Gunakan tombol di bawah untuk kembali ke mode pengeditan biasa.
                </p>
              </div>
              <Button
                className="w-full sm:w-auto"
                color="primary"
                variant="solid"
                onPress={handleExitPreview}
              >
                Keluar dari Pratinjau
              </Button>
            </div>
          ) : null}
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
                  value={activeLanguage.id}
                  onChange={(event) => setLanguageById(Number(event.target.value))}
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
                Bahasa ini sudah tidak lagi didukung secara resmi di Judge0. Hasil
                eksekusi mungkin tidak stabil.
              </p>
            ) : null}
          </div>
          <div className="flex min-h-[680px] flex-1 flex-col overflow-hidden rounded-3xl border border-default-200 bg-default-50 shadow-lg dark:border-default-100/60 dark:bg-default-50/15">
            <div className="flex items-center gap-2 border-b border-default-200 bg-default-100 px-5 py-3 dark:border-default-100/40 dark:bg-default-100/10">
              <span className="h-2.5 w-2.5 rounded-full bg-danger-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
              <span className="ml-3 rounded-full bg-default-200 px-3 py-1 text-xs font-code text-default-500 dark:bg-default-100/40 dark:text-default-400">
                {activeLanguage.shortName}
              </span>
            </div>
            <div className="relative flex flex-1 overflow-hidden">
              <div
                ref={lineNumbersContainerRef}
                className="relative flex w-14 select-none flex-col items-end overflow-hidden border-r border-default-200 bg-default-100 px-3 py-3 text-xs font-code text-default-500 dark:border-default-100/40 dark:bg-default-100/10 dark:text-default-400"
              >
                <div ref={lineNumbersInnerRef} className="space-y-1">
                  {lineNumbers.map((lineNumber) => (
                    <div key={`line-${lineNumber}`} className="leading-6">
                      {lineNumber}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative flex-1">
                <div
                  aria-hidden
                  className="code-editor-highlight pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words px-5 py-3 font-code text-sm leading-6"
                  data-language={activeLanguage.prismLanguage}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  ref={highlightContainerRef}
                />
                <textarea
                  ref={textareaRef}
                  aria-label={`Editor kode ${activeLanguage.labLabel}`}
                  aria-readonly={isPreviewMode}
                  className="code-editor-textarea font-code caret-default-900 dark:caret-default-50 absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent px-5 py-3 text-sm leading-6 text-transparent outline-none"
                  readOnly={isPreviewMode}
                  spellCheck={false}
                  value={code}
                  onChange={handleChange}
                  onScroll={handleScroll}
                />
              </div>
            </div>
          </div>
        </div>
        <aside className="flex h-full flex-col gap-5 lg:h-[680px]">
          <div className="flex flex-1 flex-col gap-5 overflow-hidden">
            <div className="flex flex-col rounded-3xl border border-default-200 bg-default-100 p-7 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.45)] dark:border-default-100/50 dark:bg-default-100/15 lg:max-h-[360px] lg:overflow-y-auto">
              <h2 className="text-xl font-semibold text-default-900 dark:text-default-50">
                List Tugas
              </h2>
              <p className="mt-2 text-sm text-default-600 dark:text-default-400">
                Ikuti langkah berikut untuk menyelesaikan latihan {activeLanguage.labLabel}.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-default-700 dark:text-default-300">
                {instructions.map((instruction, index) => (
                  <li
                    key={`instruction-${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-default-200/80 bg-default-50/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-default-100/30 dark:bg-default-100/20"
                  >
                    <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.35)]" />
                    <span dangerouslySetInnerHTML={{ __html: instruction }} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-1 flex-col rounded-3xl border border-default-200 bg-default-50 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.38)] dark:border-default-100/40 dark:bg-default-50/15">
              <h3 className="text-base font-semibold text-default-800 dark:text-default-200">
                Output:
              </h3>
              <div className="mt-3 flex-1 rounded-2xl border border-dashed border-default-200 bg-default-50/40 p-4 text-sm text-default-600 dark:border-default-100/30 dark:text-default-400">
                <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-code text-sm leading-6">
                  {output}
                </pre>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            {isPreviewMode ? (
              <Button
                className="h-14 w-full justify-center text-base"
                color="primary"
                size="lg"
                variant="solid"
                onPress={handleExitPreview}
              >
                Kembali ke Editor
              </Button>
            ) : (
              <Button
                className="h-14 w-full justify-center text-base"
                color="success"
                isLoading={isRunning}
                size="lg"
                startContent={<PlayIcon className="h-4 w-4" />}
                variant="solid"
                onPress={handleRun}
              >
                Run
              </Button>
            )}
          </div>
        </aside>
      </section>
    </DefaultLayout>
  );
}
