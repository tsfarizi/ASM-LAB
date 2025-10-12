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

import DefaultLayout from "@/layouts/default";

const STORAGE_KEY = "asm-lab-editor-code";
const JUDGE0_ENDPOINT =
  import.meta.env.VITE_JUDGE0_ENDPOINT ?? "http://127.0.0.1:2358";
const ASM_LANGUAGE_ID =
  Number.parseInt(import.meta.env.VITE_JUDGE0_LANGUAGE_ID ?? "45", 10) || 45;

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

const asmKeywords = [
  "MOV",
  "ADD",
  "SUB",
  "MUL",
  "DIV",
  "JMP",
  "CMP",
  "JE",
  "JNE",
  "JG",
  "JL",
  "JGE",
  "JLE",
  "PUSH",
  "POP",
  "CALL",
  "RET",
  "INT",
  "INC",
  "DEC",
  "NOP",
  "HLT",
  "AND",
  "OR",
  "XOR",
  "SHL",
  "SHR",
];

const asmRegisters = [
  "AX",
  "BX",
  "CX",
  "DX",
  "SI",
  "DI",
  "SP",
  "BP",
  "AL",
  "AH",
  "BL",
  "BH",
  "CL",
  "CH",
  "DL",
  "DH",
];

const highlightAsm = (value: string) => {
  if (!value) {
    return "&nbsp;";
  }

  let highlighted = escapeHtml(value);

  const keywordRegex = new RegExp(`\\b(${asmKeywords.join("|")})\\b`, "gi");
  const registerRegex = new RegExp(`\\b(${asmRegisters.join("|")})\\b`, "gi");

  highlighted = highlighted.replace(
    keywordRegex,
    (match) => `<span class="token-keyword">${match}</span>`,
  );
  highlighted = highlighted.replace(
    registerRegex,
    (match) => `<span class="token-register">${match}</span>`,
  );
  highlighted = highlighted.replace(
    /\b(-?\d+)\b/g,
    (match) => `<span class="token-number">${match}</span>`,
  );

  return highlighted.replace(/\n$/g, "\n&nbsp;");
};

export default function IndexPage() {
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>(
    "Hasil eksekusi kode akan tampil di sini.",
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightContainerRef = useRef<HTMLDivElement>(null);
  const lineNumbersContainerRef = useRef<HTMLDivElement>(null);
  const lineNumbersInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = window.localStorage.getItem(STORAGE_KEY);

    if (cached !== null) {
      setCode(cached);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, code);
  }, [code]);

  const lineNumbers = useMemo(() => {
    const lines = code.split("\n").length;

    return Array.from({ length: Math.max(lines, 1) }, (_, index) => index + 1);
  }, [code]);

  const highlightedCode = useMemo(() => highlightAsm(code), [code]);

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
  }, [code, handleScroll]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  const handleRun = useCallback(async () => {
    const trimmed = code.trim();

    if (!trimmed) {
      setOutput("Tidak ada kode yang dapat dijalankan.");

      return;
    }

    setIsRunning(true);
    setOutput("Mengirim kode ke Judge0...");

    try {
      const response = await fetch(
        `${JUDGE0_ENDPOINT}/submissions?base64_encoded=false&wait=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_code: trimmed,
            language_id: ASM_LANGUAGE_ID,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const sections: string[] = [];

      const statusDescription =
        result?.status?.description ?? "Status tidak diketahui";

      sections.push(`Status: ${statusDescription}`);

      if (result?.stdout) {
        sections.push(`Stdout:\n${result.stdout}`);
      }

      if (result?.stderr) {
        sections.push(`Stderr:\n${result.stderr}`);
      }

      if (result?.compile_output) {
        sections.push(`Compiler:\n${result.compile_output}`);
      }

      if (result?.message) {
        sections.push(`Pesan: ${result.message}`);
      }

      if (
        !result?.stdout &&
        !result?.stderr &&
        !result?.compile_output &&
        !result?.message
      ) {
        sections.push("Tidak ada output dari eksekusi.");
      }

      setOutput(sections.join("\n\n"));
    } catch (error) {
      setOutput(
        `Terjadi kesalahan saat memanggil Judge0: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  return (
    <DefaultLayout>
      <section className="flex min-h-[calc(100vh-5.5rem)] flex-col gap-6 py-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-5">
          <div className="flex min-h-[680px] flex-1 flex-col overflow-hidden rounded-3xl border border-default-200 bg-default-50 shadow-lg dark:border-default-100/60 dark:bg-default-50/15">
            <div className="flex items-center gap-2 border-b border-default-200 bg-default-100 px-5 py-3 dark:border-default-100/40 dark:bg-default-100/10">
              <span className="h-2.5 w-2.5 rounded-full bg-danger-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
              <span className="ml-3 rounded-full bg-default-200 px-3 py-1 text-xs font-code text-default-500 dark:bg-default-100/40 dark:text-default-400">
                ASM
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
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  ref={highlightContainerRef}
                  aria-hidden
                  className="code-editor-highlight pointer-events-none absolute inset-0 overflow-auto px-5 py-3 font-code text-sm leading-6 whitespace-pre-wrap break-words"
                />
                <textarea
                  ref={textareaRef}
                  aria-label="Editor kode ASM-Lab"
                  className="code-editor-textarea font-code caret-default-900 dark:caret-default-50 absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent px-5 py-3 text-sm leading-6 text-transparent outline-none"
                  spellCheck={false}
                  value={code}
                  onChange={handleChange}
                  onScroll={handleScroll}
                />
              </div>
            </div>
          </div>
        </div>
        <aside className="flex h-full flex-col gap-5">
          <div className="flex flex-1 flex-col rounded-3xl border border-default-200 bg-default-100 p-7 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.45)] dark:border-default-100/50 dark:bg-default-100/15">
            <h2 className="text-xl font-semibold text-default-900 dark:text-default-50">
              List Tugas
            </h2>
            <p className="mt-2 text-sm text-default-600 dark:text-default-400">
              Ikuti langkah berikut untuk menyelesaikan latihan.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-default-700 dark:text-default-300">
              <li className="flex items-start gap-3 rounded-2xl border border-default-200/80 bg-default-50/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-default-100/30 dark:bg-default-100/20">
                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.35)]" />
                <span>
                  Tulis program ASM x86 32-bit dengan <code>nasm</code> syntax.
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-default-200/80 bg-default-50/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-default-100/30 dark:bg-default-100/20">
                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.35)]" />
                <span>
                  Pastikan program menghasilkan output melalui syscalls yang
                  sesuai.
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-default-200/80 bg-default-50/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-default-100/30 dark:bg-default-100/20">
                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.35)]" />
                <span>
                  Tekan <strong>Run</strong> untuk mengirim kode ke Judge0 dan
                  lihat hasilnya di panel Output.
                </span>
              </li>
            </ul>
          </div>
          <div className="flex min-h-[180px] flex-col rounded-3xl border border-default-200 bg-default-50 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.38)] dark:border-default-100/40 dark:bg-default-50/15">
            <h3 className="text-base font-semibold text-default-800 dark:text-default-200">
              Output:
            </h3>
            <div className="mt-3 flex-1 rounded-2xl border border-dashed border-default-200 bg-default-50/40 p-4 text-sm text-default-600 dark:border-default-100/30 dark:text-default-400">
              <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-code text-sm leading-6">
                {output}
              </pre>
            </div>
          </div>
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
          <Button
            className="h-14 w-full justify-center text-base"
            color="primary"
            size="lg"
          >
            Submit
          </Button>
        </aside>
      </section>
    </DefaultLayout>
  );
}
