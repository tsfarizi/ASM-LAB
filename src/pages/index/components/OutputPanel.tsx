type OutputPanelProps = {
  output: string;
};

export const OutputPanel = ({ output }: OutputPanelProps) => (
  <div className="flex flex-1 flex-col rounded-3xl border border-default-200 bg-default-50 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.38)] dark:border-default-100/40 dark:bg-default-50/15">
    <h3 className="text-base font-semibold text-default-800 dark:text-default-200">Output:</h3>
    <div className="mt-3 flex-1 rounded-2xl border border-dashed border-default-200 bg-default-50/40 p-4 text-sm text-default-600 dark:border-default-100/30 dark:text-default-400">
      <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-code text-sm leading-6">{output}</pre>
    </div>
  </div>
);
