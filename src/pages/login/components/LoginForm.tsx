import { FormEventHandler } from "react";
import { Button } from "@heroui/button";

type LoginFormProps = {
  npm: string;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onNpmChange: (value: string) => void;
};

export const LoginForm = ({
  npm,
  error,
  isSubmitting,
  onSubmit,
  onNpmChange,
}: LoginFormProps) => (
  <form
    className="space-y-5 rounded-3xl border border-default-200 bg-default-50 px-8 py-10 shadow-xl dark:border-default-100/50 dark:bg-default-50/10"
    onSubmit={onSubmit}
  >
    <div className="space-y-2 text-left">
      <label className="text-sm font-medium text-default-700 dark:text-default-200" htmlFor="npm">
        NPM
      </label>
      <input
        id="npm"
        placeholder="Masukkan NPM"
        className="w-full rounded-2xl border border-default-200 bg-default-50 px-4 py-3 text-sm text-default-700 outline-none ring-2 ring-transparent transition focus:border-primary focus:ring-primary/40 dark:border-default-100/40 dark:bg-default-50/20 dark:text-default-200"
        value={npm}
        onChange={(event) => onNpmChange(event.target.value)}
        disabled={isSubmitting}
      />
      <p className="text-xs text-default-500 dark:text-default-400">
        Pastikan NPM sesuai dengan data yang terdaftar di sistem.
      </p>
    </div>

    {error ? (
      <div className="rounded-2xl border border-danger-300 bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:border-danger-200/40 dark:bg-danger-500/10 dark:text-danger-200">
        {error}
      </div>
    ) : null}

    <Button className="h-12 w-full justify-center text-base" color="primary" isLoading={isSubmitting} type="submit" variant="solid">
      Masuk
    </Button>
  </form>
);
