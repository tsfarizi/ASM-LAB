import { Button } from "@heroui/button";

type FirstAdminRegistrationProps = {
  npm: string;
  error: string | null;
  isSubmitting: boolean;
  onChangeNpm: (value: string) => void;
  onRegister: () => void;
};

export const FirstAdminRegistration = ({
  npm,
  error,
  isSubmitting,
  onChangeNpm,
  onRegister,
}: FirstAdminRegistrationProps) => (
  <div className="mx-auto max-w-lg rounded-3xl border border-default-200 bg-content1 px-8 py-12 shadow-xl dark:border-default-100/40 dark:bg-content1/10">
    <h2 className="text-2xl font-semibold text-foreground dark:text-default-50">
      Daftarkan Admin Pertama
    </h2>
    <p className="mt-2 text-sm text-foreground dark:text-default-200">
      Masukkan NPM untuk mendaftarkan admin pertama. Setelah berhasil, Anda akan
      otomatis masuk sebagai admin.
    </p>

    <div className="mt-6 space-y-3">
      <input
        className="w-full rounded-2xl border border-default-200 bg-content1 px-4 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-content1/20 dark:text-default-200"
        disabled={isSubmitting}
        placeholder="NPM"
        value={npm}
        onChange={(event) => onChangeNpm(event.target.value)}
      />
      {error ? (
        <p className="text-sm text-danger-500 dark:text-danger-300">{error}</p>
      ) : null}
      <Button
        color="primary"
        isLoading={isSubmitting}
        variant="solid"
        onPress={onRegister}
      >
        Daftarkan Admin
      </Button>
    </div>
  </div>
);
