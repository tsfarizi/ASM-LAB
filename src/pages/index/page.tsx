import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth, type ClassroomUser } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import DefaultLayout from "@/layouts/default";

import { ActionButtons } from "./components/ActionButtons";
import { CodeEditor } from "./components/CodeEditor";
import { InstructionsPanel } from "./components/InstructionsPanel";
import { LanguageCard } from "./components/LanguageCard";
import { OutputPanel } from "./components/OutputPanel";
import { PreviewBanner } from "./components/PreviewBanner";
import {
  getCodeStorageKey,
  getUserCodeEndpoint,
  isBrowser,
  SUBMISSION_ENDPOINT,
} from "./constants";
import { escapeHtml, withTrailingNbsp } from "./utils/highlight";
import { resolveInstructions } from "./utils/instructions";

const PREVIEW_STATE_KEY = "previewCode";

type PreviewState = {
  [PREVIEW_STATE_KEY]?: string;
} | null;

export const IndexPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { account, classroom, syncClassroom } = useAuth();
  const { activeLanguage, languages, lockedLanguage, isLanguageLocked, setLanguageById } =
    useLanguage();

  const codeStorageKey = useMemo(
    () => getCodeStorageKey(activeLanguage.id),
    [activeLanguage.id],
  );

  const previewState = (location.state as PreviewState) ?? null;
  const hasPreviewState = previewState !== null && Object.prototype.hasOwnProperty.call(previewState, PREVIEW_STATE_KEY);
  const previewCode = hasPreviewState ? previewState?.[PREVIEW_STATE_KEY] ?? "" : "";

  const [code, setCode] = useState(() => (hasPreviewState ? previewCode : ""));
  const [isPreviewMode, setIsPreviewMode] = useState(hasPreviewState);
  const [highlightedCode, setHighlightedCode] = useState("&nbsp;");
  const [isRunning, setIsRunning] = useState(false);
  const defaultOutput = useMemo(
    () => `Hasil eksekusi kode ${activeLanguage.labLabel} akan tampil di sini.`,
    [activeLanguage.labLabel],
  );
  const [output, setOutput] = useState(defaultOutput);

  useEffect(() => {
    if (hasPreviewState) {
      setIsPreviewMode(true);
      setCode(previewCode);
      setOutput(defaultOutput);
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [
    defaultOutput,
    hasPreviewState,
    location.pathname,
    location.search,
    navigate,
    previewCode,
  ]);

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

  const lockedLanguageName = useMemo(() => {
    if (lockedLanguage) {
      return lockedLanguage.name;
    }

    return classroom?.programmingLanguage ?? null;
  }, [classroom?.programmingLanguage, lockedLanguage]);

  const matchesClassroomLanguage = useMemo(() => {
    if (!classroom) {
      return false;
    }

    if (!classroom.programmingLanguage) {
      return true;
    }

    const normalized = classroom.programmingLanguage.trim().toLowerCase();
    const candidates = [
      activeLanguage.name,
      activeLanguage.labLabel,
      activeLanguage.shortName,
    ]
      .map((label) => label.trim().toLowerCase())
      .filter((label) => label.length > 0);

    return candidates.includes(normalized);
  }, [
    classroom,
    activeLanguage.name,
    activeLanguage.labLabel,
    activeLanguage.shortName,
  ]);

  const classroomTasks = useMemo(() => {
    if (!classroom?.tasks || classroom.tasks.length === 0) {
      return [] as string[];
    }

    if (!matchesClassroomLanguage) {
      return [] as string[];
    }

    return classroom.tasks;
  }, [classroom?.tasks, matchesClassroomLanguage]);

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
        (language === "plain" ? prism.languages?.plain || prism.languages?.none : undefined);

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        event.key !== "Tab" ||
        event.shiftKey ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      if (isPreviewMode) {
        return;
      }

      event.preventDefault();

      const selectionStart = event.currentTarget.selectionStart ?? 0;
      const selectionEnd = event.currentTarget.selectionEnd ?? 0;
      const indent = "\t";
      const nextValue = `${code.slice(0, selectionStart)}${indent}${code.slice(selectionEnd)}`;

      setCode(nextValue);

      if (isBrowser && !isPreviewMode) {
        window.localStorage.setItem(codeStorageKey, nextValue);
      }

      requestAnimationFrame(() => {
        const textarea = textareaRef.current;

        if (textarea) {
          const cursorPosition = selectionStart + indent.length;

          textarea.selectionStart = cursorPosition;
          textarea.selectionEnd = cursorPosition;
        }
      });
    },
    [code, codeStorageKey, isPreviewMode],
  );

  const instructions = useMemo(() => {
    if (classroomTasks.length > 0) {
      return classroomTasks;
    }

    return resolveInstructions(activeLanguage.name, activeLanguage.shortName);
  }, [activeLanguage.name, activeLanguage.shortName, classroomTasks]);

  const handleRun = useCallback(async () => {
    const trimmed = code.trim();

    if (!trimmed) {
      setOutput("Tidak ada kode yang dapat dijalankan.");
      return;
    }

    setIsRunning(true);
    setOutput(`Mengirim kode ${activeLanguage.shortName} ke server untuk dieksekusi...`);

    try {
      if (classroom?.id && classroom?.user?.id) {
        const classroomUser = classroom.user;
        if (!classroomUser) {
          throw new Error("Data user classroom tidak ditemukan.");
        }

        const response = await fetch(
          getUserCodeEndpoint(classroom.id, classroom.user.id),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: trimmed,
            }),
          },
        );

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          const message =
            payload && typeof (payload as { message?: unknown }).message === "string"
              ? (payload as { message: string }).message
              : `HTTP ${response.status} ${response.statusText}`;
          throw new Error(`Gagal menyimpan kode: ${message}`);
        }

        const normalizeUser = (value: unknown): ClassroomUser | null => {
          if (typeof value !== "object" || value === null) {
            return null;
          }

          const record = value as Record<string, unknown>;
          const userId = Number.parseInt(String(record.id ?? ""), 10);
          if (!Number.isFinite(userId)) {
            return null;
          }

          return {
            id: userId,
            name: typeof record.name === "string" ? record.name : classroomUser.name,
            npm: typeof record.npm === "string" ? record.npm : classroomUser.npm,
            code: typeof record.code === "string" ? record.code : trimmed,
            createdAt:
              typeof record.createdAt === "string"
                ? record.createdAt
                : classroomUser.createdAt,
            updatedAt:
              typeof record.updatedAt === "string"
                ? record.updatedAt
                : new Date().toISOString(),
          };
        };

        const nextUser = normalizeUser(payload) ?? {
          ...classroomUser,
          code: trimmed,
          updatedAt: new Date().toISOString(),
        };

        syncClassroom((previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            user: nextUser,
          };
        });
      }

      const submissionPayload: Record<string, unknown> = {
        source_code: trimmed,
        language_id: activeLanguage.id,
      };

      if (account?.role !== "admin") {
        submissionPayload.npm = classroom?.user?.npm || account?.npm || "";
      }

      const response = await fetch(SUBMISSION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const sections: string[] = [];

      const statusDescription = result?.status?.description ?? "Status tidak diketahui";
      sections.push(`Status: ${statusDescription}`);

      if (typeof result?.stdout === "string" && result.stdout.length > 0) {
        sections.push(`Stdout:\n${result.stdout}`);
      }

      if (typeof result?.stderr === "string" && result.stderr.length > 0) {
        sections.push(`Stderr:\n${result.stderr}`);
      }

      if (typeof result?.compile_output === "string" && result.compile_output.length > 0) {
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
  }, [
    account,
    activeLanguage.id,
    activeLanguage.shortName,
    classroom,
    code,
    syncClassroom,
  ]);

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

  const handleSelectLanguage = useCallback(
    (languageId: number) => {
      setLanguageById(languageId);
    },
    [setLanguageById],
  );

  return (
    <DefaultLayout>
      <section className="flex min-h-[calc(100vh-5.5rem)] flex-col gap-6 py-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-5">
          {isPreviewMode ? <PreviewBanner onExit={handleExitPreview} /> : null}
          <LanguageCard
            activeLanguage={activeLanguage}
            archivedLanguages={archivedLanguages}
            availableLanguages={availableLanguages}
            isLanguageLocked={isLanguageLocked}
            lockedByClassroom={classroom?.name ?? null}
            lockedLanguageName={lockedLanguageName}
            onSelect={handleSelectLanguage}
          />
          <CodeEditor
            code={code}
            highlightedCode={highlightedCode}
            isPreviewMode={isPreviewMode}
            language={activeLanguage}
            lineNumbers={lineNumbers}
            highlightContainerRef={highlightContainerRef}
            lineNumbersContainerRef={lineNumbersContainerRef}
            lineNumbersInnerRef={lineNumbersInnerRef}
            textareaRef={textareaRef}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
          />
        </div>
        <aside className="flex h-full flex-col gap-5 lg:h-[680px]">
          <div className="flex flex-1 flex-col gap-5 overflow-hidden">
            <InstructionsPanel
              classroomName={classroom?.name}
              instructions={instructions}
              isClassroomTasks={classroomTasks.length > 0}
              labLabel={activeLanguage.labLabel}
            />
            <OutputPanel output={output} />
          </div>
          <ActionButtons
            isPreviewMode={isPreviewMode}
            isRunning={isRunning}
            onExitPreview={handleExitPreview}
            onRun={handleRun}
          />
        </aside>
      </section>
    </DefaultLayout>
  );
};
