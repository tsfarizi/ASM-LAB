type InstructionsPanelProps = {
  instructions: string[];
  labLabel: string;
};

export const InstructionsPanel = ({
  instructions,
  labLabel,
}: InstructionsPanelProps) => (
  <div className="flex flex-col rounded-3xl border border-default-200 bg-default-100 p-7 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.45)] dark:border-default-100/50 dark:bg-default-100/15 lg:max-h-[360px] lg:overflow-y-auto">
    <h2 className="text-xl font-semibold text-default-900 dark:text-default-50">
      List Tugas
    </h2>
    <p className="mt-2 text-sm text-default-600 dark:text-default-200">
      Ikuti langkah berikut untuk menyelesaikan latihan {labLabel}.
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
);
