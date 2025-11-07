import { Button } from "@heroui/button";

type AdminLoginPromptProps = {
  onNavigateToLogin: () => void;
};

export const AdminLoginPrompt = ({
  onNavigateToLogin,
}: AdminLoginPromptProps) => (
  <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-default-200 bg-content1 px-8 py-12 text-center shadow-xl dark:border-default-100/40 dark:bg-content1/10">
    <h2 className="text-2xl font-semibold text-foreground dark:text-default-50">
      Login Admin Diperlukan
    </h2>
    <p className="text-sm text-foreground dark:text-default-200">
      Admin sudah terdaftar. Silakan login menggunakan akun admin Anda.
    </p>
    <Button color="primary" variant="solid" onPress={onNavigateToLogin}>
      Buka Halaman Login
    </Button>
  </div>
);
