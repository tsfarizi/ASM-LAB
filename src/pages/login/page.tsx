import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";
import DefaultLayout from "@/layouts/default";

import { LoginForm } from "./components/LoginForm";
import { LoginHeader } from "./components/LoginHeader";
import { parseRedirect } from "./utils";

export const LoginPage = () => {
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
        <LoginHeader />
        <LoginForm
          error={error}
          isSubmitting={isSubmitting}
          npm={npm}
          onNpmChange={setNpm}
          onSubmit={handleSubmit}
        />
      </section>
    </DefaultLayout>
  );
};
