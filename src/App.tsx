import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";
import AdminPage from "@/pages/admin";
import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-default-50 text-default-500 dark:bg-default-900 dark:text-white">
    Memuat...
  </div>
);

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { account, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!account) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate replace to={`/login?redirect=${redirect}`} />;
  }

  return children;
};

const App = () => (
  <HashRouter>
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RequireAuth><IndexPage /></RequireAuth>} path="/" />
      <Route element={<AdminPage />} path="/admin" />
    </Routes>
  </HashRouter>
);

export default App;
