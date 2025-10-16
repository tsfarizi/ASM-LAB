import { Button } from "@heroui/button";

import { PlayIcon } from "./icons/PlayIcon";

type ActionButtonsProps = {
  isPreviewMode: boolean;
  isRunning: boolean;
  onRun: () => void;
  onExitPreview: () => void;
};

export const ActionButtons = ({
  isPreviewMode,
  isRunning,
  onRun,
  onExitPreview,
}: ActionButtonsProps) => (
  <div className="flex flex-col gap-4 sm:flex-row">
    {isPreviewMode ? (
      <Button
        className="h-14 w-full justify-center text-base"
        color="primary"
        size="lg"
        variant="solid"
        onPress={onExitPreview}
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
        onPress={onRun}
      >
        Run
      </Button>
    )}
  </div>
);
