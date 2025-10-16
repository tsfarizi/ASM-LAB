import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "@/contexts/language-context";
import DefaultLayout from "@/layouts/default";

import { ActionButtons } from "./components/ActionButtons";
import { CodeEditor } from "./components/CodeEditor";
import { InstructionsPanel } from "./components/InstructionsPanel";
import { LanguageCard } from "./components/LanguageCard";
import { OutputPanel } from "./components/OutputPanel";
import { PreviewBanner } from "./components/PreviewBanner";
import { getCodeStorageKey, isBrowser, SUBMISSION_ENDPOINT } from "./constants";
import { escapeHtml, withTrailingNbsp } from "./utils/highlight";
import { resolveInstructions } from "./utils/instructions";

const PREVIEW_STATE_KEY = "previewCode";

type PreviewState = {
  [PREVIEW_STATE_KEY]?: string;
} | null;

export const IndexPage = () => {
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
    () => `Hasil eksekusi kode ${activeLanguage.labLabel} akan tampil di sini.`,
    [activeLanguage.labLabel],
  );
  const [output, setOutput] = useState(defaultOutput);

  useEffect(() => {
    const state = location.state as PreviewState;

    if (state?.[PREVIEW_STATE_KEY] !== undefined) {
      const nextCode = state[PREVIEW_STATE_KEY] ?? "";
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

  const instructions = useMemo(
    () => resolveInstructions(activeLanguage.name, activeLanguage.shortName),
    [activeLanguage.name, activeLanguage.shortName],
  );

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
    setOutput(`Mengirim kode ${activeLanguage.shortName} ke server untuk dieksekusi...`);

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
            onScroll={handleScroll}
          />
        </div>
        <aside className="flex h-full flex-col gap-5 lg:h-[680px]">
          <div className="flex flex-1 flex-col gap-5 overflow-hidden">
            <InstructionsPanel instructions={instructions} labLabel={activeLanguage.labLabel} />
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
