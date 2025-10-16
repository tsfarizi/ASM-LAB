import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";
import DefaultLayout from "@/layouts/default";

const parseRedirect = (search: string) => {
  if (!search) {
    return "/";
  }

  const params = new URLSearchParams(search);
  const redirect = params.get("redirect");

  if (!redirect || !redirect.startsWith("/")) {
    return "/";
  }

  return redirect;
};

const LoginPage = () => {
  const { login, account } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [npm, setNpm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => parseRedirect(location.search), [location.search]);

  useEffect(() => {
    if (account) {
      navigate(redirectPath, { replace: true });
    }
  }, [account, navigate, redirectPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = npm.trim();
    if (!trimmed) {
      setError("NPM wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ npm: trimmed });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center gap-6 py-16">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-default-900 dark:text-default-50">
            Masuk ke ASM LAB
          </h1>
          <p className="text-sm text-default-600 dark:text-default-400">
            Masukkan NPM Anda untuk melanjutkan.
          </p>
        </div>

        <form
          className="space-y-5 rounded-3xl border border-default-200 bg-default-50 px-8 py-10 shadow-xl dark:border-default-100/50 dark:bg-default-50/10"
          onSubmit={handleSubmit}
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
              onChange={(event) => setNpm(event.target.value)}
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

          <Button
            className="h-12 w-full justify-center text-base"
            color="primary"
            isLoading={isSubmitting}
            type="submit"
            variant="solid"
          >
            Masuk
          </Button>
        </form>
      </section>
    </DefaultLayout>
  );
};

export default LoginPage;
