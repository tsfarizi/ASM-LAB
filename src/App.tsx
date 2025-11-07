import { useEffect, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import AdminPage from "@/pages/admin";
import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";

import { API_BASE_URL } from "@/constants/api";
import { FullscreenExitModal } from "@/components/fullscreen-exit-modal";

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

const App = () => {
  const { isExamMode, logout, enterFullscreen, account, classroom, lastCode } = useAuth();
  const { activeLanguage } = useLanguage();
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [showInitialFullscreenPrompt, setShowInitialFullscreenPrompt] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isExamMode) {
        setShowFullscreenModal(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isExamMode]);

  useEffect(() => {
    if (isExamMode && !document.fullscreenElement) {
      setShowInitialFullscreenPrompt(true);
    }
  }, [isExamMode]);

  const handleFinishExam = async () => {
    if (!isExamMode || !classroom?.id || !account?.npm || account.npm.trim() === '') return;

    try {
      await fetch(`${API_BASE_URL}/api/classrooms/${classroom.id}/finish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          npm: account.npm,
          code: lastCode,
          language_id: activeLanguage.id,
        }),
      });
    } catch (error) {
      console.error("Failed to finish exam:", error);
      // Even if finishing fails, log the user out
    } finally {
      logout();
      setShowFullscreenModal(false);
    }
  };

  const handleResumeExam = () => {
    setShowFullscreenModal(false);
    enterFullscreen();
  };

  return (
    <HashRouter>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RequireAuth><IndexPage /></RequireAuth>} path="/" />
        <Route element={<AdminPage />} path="/admin" />
      </Routes>
      <FullscreenExitModal
        isOpen={showFullscreenModal || showInitialFullscreenPrompt}
        type={showInitialFullscreenPrompt ? 'initial' : 'exit'}
        onConfirm={() => {
          if (showInitialFullscreenPrompt) {
            enterFullscreen();
            setShowInitialFullscreenPrompt(false);
          } else {
            handleFinishExam();
          }
        }}
        onCancel={() => {
          if (showInitialFullscreenPrompt) {
            // If user cancels initial fullscreen, they cannot proceed with the exam
            logout();
            setShowInitialFullscreenPrompt(false);
          } else {
            setShowFullscreenModal(false);
            enterFullscreen(); // Re-enter fullscreen if they cancel exiting
          }
        }}
      />
    </HashRouter>
  );
};

export default App;
