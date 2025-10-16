import { Button } from "@heroui/button";

type PreviewBannerProps = {
  onExit: () => void;
};

export const PreviewBanner = ({ onExit }: PreviewBannerProps) => (
  <div className="flex flex-col gap-3 rounded-3xl border border-blue-300/60 bg-blue-50/80 px-6 py-5 text-sm text-blue-800 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] dark:border-blue-200/40 dark:bg-blue-500/10 dark:text-blue-100">
    <div>
      <h2 className="text-base font-semibold text-blue-900 dark:text-blue-100">
        Mode Pratinjau Kode User
      </h2>
      <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-100/80">
        Editor dalam keadaan hanya-baca. Gunakan tombol di bawah untuk kembali ke mode pengeditan biasa.
      </p>
    </div>
    <Button className="w-full sm:w-auto" color="primary" variant="solid" onPress={onExit}>
      Keluar dari Pratinjau
    </Button>
  </div>
);
