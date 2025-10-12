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
const JUDGE0_ENDPOINT = "http://127.0.0.1:2358";
const ASM_LANGUAGE_ID = 5;

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
  const cheerpxEnvRef = useRef<{
    linux: LinuxInstance;
    dataDevice: DataDeviceInstance;
    dispose: () => void;
  } | null>(null);
  const cheerpxInitPromiseRef = useRef<
    Promise<{
      linux: LinuxInstance;
      dataDevice: DataDeviceInstance;
      dispose: () => void;
    }>
  | null>(null);
  const decoderRef = useRef<TextDecoder | null>(null);
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

  useEffect(() => {
    handleScroll();
  }, [code]);

  useEffect(() => {
    loadCheerpX().catch((error) => {
      console.error("Gagal memuat CheerpX di awal:", error);
      setOutput((previous) =>
        `${previous}\nGagal memuat runtime CheerpX di awal: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    });
  }, []);

  useEffect(() => {
    return () => {
      cheerpxEnvRef.current?.dispose();
      cheerpxEnvRef.current = null;
    };
  }, []);

  const lineNumbers = useMemo(() => {
    const lines = code.split("\n").length;
    return Array.from({ length: Math.max(lines, 1) }, (_, index) => index + 1);
  }, [code]);

  const highlightedCode = useMemo(() => highlightAsm(code), [code]);

  const handleScroll = () => {
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
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCode(event.target.value);
  };

  const appendOutput = useCallback((chunk: string) => {
    if (!chunk) return;
    setOutput((previous) => (previous ? `${previous}${chunk}` : chunk));
  }, []);

  const ensureCheerpX = useCallback(async () => {
    if (cheerpxEnvRef.current) {
      return cheerpxEnvRef.current;
    }

    if (!cheerpxInitPromiseRef.current) {
      cheerpxInitPromiseRef.current = (async () => {
        appendOutput("Menyiapkan lingkungan CheerpX (unduhan pertama kali bisa cukup besar)...\n");
        const { HttpBytesDevice, IDBDevice, OverlayDevice, DataDevice, Linux } =
          await loadCheerpX();

        const diskErrors: string[] = [];
        let blockDevice: Awaited<ReturnType<typeof HttpBytesDevice.create>> | null =
          null;

        for (const url of CHEERPX_DISK_CANDIDATES) {
          try {
            appendOutput(`Mengunduh image CheerpX dari ${url}...\n`);
            blockDevice = await HttpBytesDevice.create(url);
            appendOutput("Image berhasil dimuat.\n");
            break;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : JSON.stringify(error);
            diskErrors.push(`${url} -> ${message}`);
            appendOutput(
              `Gagal memuat image dari ${url}. Mencoba sumber lain...\n`,
            );
          }
        }

        if (!blockDevice) {
          throw new Error(
            `Tidak dapat memuat disk image CheerpX:\n${diskErrors.join("\n")}\n\nTips: unduh image dari WebVM lalu letakkan sebagai public/cheerpXImage.ext2 atau gunakan host dengan header Last-Modified/Etag.`,
          );
        }

        const idbDevice = await IDBDevice.create("asm-lab-cheerpx");
        const overlayDevice = await OverlayDevice.create(blockDevice, idbDevice);
        const dataDevice = await DataDevice.create();

        const mountPoints = [
          { type: "ext2", path: "/", dev: overlayDevice },
          { type: "dir", path: "/data", dev: dataDevice },
          { type: "devs", path: "/dev" },
          { type: "proc", path: "/proc" },
        ] as unknown as Array<Record<string, unknown>>;

        const linux = await Linux.create({
          mounts: mountPoints as any,
        });

        const decoder =
          decoderRef.current || (decoderRef.current = new TextDecoder());

        linux.setCustomConsole((buffer) => {
          const text = decoder.decode(buffer);
          appendOutput(text);
        }, 120, 40);

        const dispose = () => {
          linux.delete();
          dataDevice.delete();
          overlayDevice.delete();
          idbDevice.delete();
          blockDevice.delete();
        };

        const environment = { linux, dataDevice, dispose };
        cheerpxEnvRef.current = environment;
        appendOutput("Lingkungan CheerpX siap.\n");
        return environment;
      })().catch((error) => {
        cheerpxInitPromiseRef.current = null;
        throw error;
      });
    }

    return cheerpxInitPromiseRef.current;
  }, [appendOutput]);

  const handleRun = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setOutput("Tidak ada kode yang dapat dijalankan.");
      return;
    }

    setIsRunning(true);
    setOutput("");

    try {
      const environment = await ensureCheerpX();
      const { linux, dataDevice } = environment;

      appendOutput("Menulis berkas ASM...\n");
      await dataDevice.writeFile("/code.asm", trimmed);

      appendOutput("Menjalankan nasm...\n");
      const nasmResult = await linux.run(
        "/usr/bin/nasm",
        ["-felf32", "/data/code.asm", "-o", "/tmp/program.o"],
        { env: ["PATH=/usr/bin:/bin"] },
      );

      if (nasmResult.status !== 0) {
        appendOutput(`nasm selesai dengan kode keluar ${nasmResult.status}\n`);
        appendOutput("Periksa kembali sintaks ASM kamu.\n");
        return;
      }

      appendOutput("Menautkan objek dengan ld...\n");
      const ldResult = await linux.run("/usr/bin/ld", [
        "-m",
        "elf_i386",
        "/tmp/program.o",
        "-o",
        "/tmp/program",
      ]);

      if (ldResult.status !== 0) {
        appendOutput(`ld selesai dengan kode keluar ${ldResult.status}\n`);
        return;
      }

      appendOutput("Menjalankan program...\n");
      const runResult = await linux.run("/tmp/program", []);
      appendOutput(`\nProgram selesai dengan kode keluar ${runResult.status}\n`);
    } catch (error) {
      appendOutput(
        `Terjadi kesalahan saat menjalankan CheerpX: ${
          error instanceof Error ? error.message : String(error)
        }\n`,
      );
    } finally {
      setIsRunning(false);
    }
  }, [appendOutput, code, ensureCheerpX]);

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
                  ref={highlightContainerRef}
                  aria-hidden
                  className="code-editor-highlight pointer-events-none absolute inset-0 overflow-auto px-5 py-3 font-code text-sm leading-6 whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
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
                <span>Tulis program ASM x86 32-bit dengan <code>nasm</code> syntax.</span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-default-200/80 bg-default-50/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-default-100/30 dark:bg-default-100/20">
                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.35)]" />
                <span>Pastikan program memanggil <code>Linux syscalls</code> atau prosedur yang menghasilkan output.</span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-default-200/80 bg-default-50/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-default-100/30 dark:bg-default-100/20">
                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_0_3px_rgba(59,130,246,0.35)]" />
                <span>Tekan <strong>Run</strong> untuk merakit, menautkan, dan menjalankan kode melalui CheerpX.</span>
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
            size="lg"
            startContent={<PlayIcon className="h-4 w-4" />}
            variant="solid"
            isLoading={isRunning}
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

