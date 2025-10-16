import { Button } from "@heroui/button";

type AdminLoginPromptProps = {
  onNavigateToLogin: () => void;
};

export const AdminLoginPrompt = ({ onNavigateToLogin }: AdminLoginPromptProps) => (
  <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-default-200 bg-default-50 px-8 py-12 text-center shadow-xl dark:border-default-100/40 dark:bg-default-50/10">
    <h2 className="text-2xl font-semibold text-default-900 dark:text-default-50">Login Admin Diperlukan</h2>
    <p className="text-sm text-default-600 dark:text-default-400">
      Admin sudah terdaftar. Silakan login menggunakan akun admin Anda.
    </p>
    <Button color="primary" variant="solid" onPress={onNavigateToLogin}>
      Buka Halaman Login
    </Button>
  </div>
);
