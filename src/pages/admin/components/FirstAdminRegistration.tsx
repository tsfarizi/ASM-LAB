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
  <div className="mx-auto max-w-lg rounded-3xl border border-default-200 bg-default-50 px-8 py-12 shadow-xl dark:border-default-100/40 dark:bg-default-50/10">
    <h2 className="text-2xl font-semibold text-default-900 dark:text-default-50">
      Daftarkan Admin Pertama
    </h2>
    <p className="mt-2 text-sm text-default-600 dark:text-default-200">
      Masukkan NPM untuk mendaftarkan admin pertama. Setelah berhasil, Anda akan
      otomatis masuk sebagai admin.
    </p>

    <div className="mt-6 space-y-3">
      <input
        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
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
