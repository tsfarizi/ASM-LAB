import { Button } from "@heroui/button";

type AccessLimitedProps = {
  accountNpm: string;
  roleLabel: string;
  onBackToHome: () => void;
};

export const AccessLimited = ({ accountNpm, roleLabel, onBackToHome }: AccessLimitedProps) => (
  <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-warning-300 bg-warning-50 px-8 py-12 text-center shadow-xl dark:border-warning-200/40 dark:bg-warning-500/10 dark:text-warning-200">
    <h2 className="text-2xl font-semibold">Akses Terbatas</h2>
    <p className="text-sm">
      Anda masuk sebagai <strong className="font-semibold">{accountNpm}</strong> dengan role{' '}
      <strong className="font-semibold">{roleLabel}</strong>. Hubungi admin untuk meminta akses.
    </p>
    <Button color="primary" variant="solid" onPress={onBackToHome}>
      Kembali ke Beranda
    </Button>
  </div>
);
