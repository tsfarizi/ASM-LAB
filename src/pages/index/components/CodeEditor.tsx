import { RefObject, ChangeEventHandler, KeyboardEventHandler } from "react";

import { type ExtendedLanguage } from "@/contexts/language-context";

type CodeEditorProps = {
  language: Pick<ExtendedLanguage, "labLabel" | "shortName" | "prismLanguage">;
  code: string;
  highlightedCode: string;
  lineNumbers: number[];
  isPreviewMode: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  highlightContainerRef: RefObject<HTMLDivElement>;
  lineNumbersContainerRef: RefObject<HTMLDivElement>;
  lineNumbersInnerRef: RefObject<HTMLDivElement>;
  onScroll: () => void;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
};

export const CodeEditor = ({
  language,
  code,
  highlightedCode,
  lineNumbers,
  isPreviewMode,
  textareaRef,
  highlightContainerRef,
  lineNumbersContainerRef,
  lineNumbersInnerRef,
  onScroll,
  onChange,
  onKeyDown,
}: CodeEditorProps) => (
  <div className="flex min-h-[680px] flex-1 flex-col overflow-hidden rounded-3xl border border-default-200 bg-default-50 shadow-lg dark:border-default-100/60 dark:bg-default-50/15">
    <div className="flex items-center gap-2 border-b border-default-200 bg-default-100 px-5 py-3 dark:border-default-100/40 dark:bg-default-100/10">
      <span className="h-2.5 w-2.5 rounded-full bg-danger-500" />
      <span className="h-2.5 w-2.5 rounded-full bg-warning-500" />
      <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
      <span className="ml-3 rounded-full bg-default-200 px-3 py-1 text-xs font-code text-default-500 dark:bg-default-100/40 dark:text-default-300">
        {language.shortName}
      </span>
    </div>
    <div className="relative flex flex-1 overflow-hidden">
      <div
        ref={lineNumbersContainerRef}
        className="relative flex w-14 select-none flex-col items-end overflow-hidden border-r border-default-200 bg-default-100 px-3 py-3 text-xs font-code text-default-500 dark:border-default-100/40 dark:bg-default-100/10 dark:text-default-300"
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
          className="code-editor-highlight pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words px-5 py-3 font-code text-sm leading-6"
          data-language={language.prismLanguage}
        />
        <textarea
          ref={textareaRef}
          aria-label={`Editor kode ${language.labLabel}`}
          aria-readonly={isPreviewMode}
          className="code-editor-textarea font-code caret-default-900 dark:caret-default-50 absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent px-5 py-3 text-sm leading-6 text-transparent outline-none"
          readOnly={isPreviewMode}
          spellCheck={false}
          value={code}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
        />
      </div>
    </div>
  </div>
);
