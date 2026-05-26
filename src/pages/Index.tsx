import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import FormsPage from "@/pages/FormsPage";
import BuilderPage from "@/pages/BuilderPage";
import ResponsesPage from "@/pages/ResponsesPage";
import StatsPage from "@/pages/StatsPage";
import ProfilePage from "@/pages/ProfilePage";
import FormPublicPage from "@/pages/FormPublicPage";
import Icon from "@/components/ui/icon";
import { useYandexAuth } from "@/hooks/useYandexAuth";

export default function Index() {
  const [currentPage, setCurrentPage] = useState("forms");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | undefined>();

  const { user, loading, login, loginDubble, logout } = useYandexAuth();
  const token = localStorage.getItem("ff_session_token") || "";

  // Проверяем публичный маршрут /form/:slug
  const path = window.location.pathname;
  const publicMatch = path.match(/^\/form\/([a-z0-9]+)$/);
  const publicSlug = publicMatch ? publicMatch[1] : null;

  // Следим за изменением URL (History API)
  const [urlPath, setUrlPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setUrlPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const currentSlug = (() => {
    const m = urlPath.match(/^\/form\/([a-z0-9]+)$/);
    return m ? m[1] : null;
  })();

  // Если это публичная страница формы — рендерим без Layout
  if (currentSlug) {
    return <FormPublicPage slug={currentSlug} />;
  }

  const layoutUser = user ? { name: user.name, email: user.email, avatar: user.avatar_url } : null;

  const handleLoginClick = () => setShowLoginModal(true);
  const handleYandexLogin = async () => {
    setLoginLoading(true);
    await login();
    setLoginLoading(false);
  };

  const handleOpenBuilder = (formId?: string) => {
    setEditingFormId(formId);
    setCurrentPage("builder");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== "builder") setEditingFormId(undefined);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "forms":
        return <FormsPage onOpenBuilder={handleOpenBuilder} token={token} />;
      case "builder":
        return <BuilderPage formId={editingFormId} token={token} onBack={() => setCurrentPage("forms")} />;
      case "responses":
        return <ResponsesPage token={token} />;
      case "stats":
        return <StatsPage />;
      case "profile":
        return <ProfilePage user={layoutUser} onLogin={handleLoginClick} onLogout={logout} />;
      default:
        return <FormsPage onOpenBuilder={handleOpenBuilder} token={token} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(15,12%,5%)" }}>
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://cdn.poehali.dev/projects/267e080f-eff8-4afa-95f4-c72c1b12bd16/bucket/398999e0-d058-4e86-ae0c-96d1a6895ef3.png"
            alt="Формус"
            className="w-12 h-12 rounded-2xl animate-float"
            style={{ boxShadow: "0 0 28px rgba(244,81,30,0.5)" }}
          />
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow"
                style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={handleNavigate} user={layoutUser} onLogin={handleLoginClick}>
        {renderPage()}
      </Layout>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="rounded-3xl p-10 w-full max-w-md text-center animate-scale-in relative"
            style={{ background: "rgba(12,6,2,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(244,81,30,0.2)" }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src="https://cdn.poehali.dev/projects/267e080f-eff8-4afa-95f4-c72c1b12bd16/bucket/398999e0-d058-4e86-ae0c-96d1a6895ef3.png"
              alt="Формус"
              className="w-16 h-16 mx-auto mb-6 rounded-2xl animate-float"
              style={{ boxShadow: "0 0 32px rgba(244,81,30,0.5)" }}
            />
            <h2 className="text-2xl font-bold text-foreground mb-2">Добро пожаловать в Формус!</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Выберите способ входа
            </p>
            {/* Даббл ID */}
            <button
              onClick={() => loginDubble()}
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-semibold text-white mb-3 hover:opacity-90 transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 0 20px rgba(0,0,0,0.4)" }}
            >
              <span className="text-lg font-black leading-none">D</span>
              Войти через Даббл ID
            </button>
            {/* Разделитель */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-muted-foreground">или</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            {/* Яндекс */}
            <button
              onClick={handleYandexLogin}
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-semibold text-white mb-4 hover:opacity-90 transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #fc3f1d, #ff6534)", boxShadow: "0 0 24px rgba(252,63,29,0.4)" }}
            >
              {loginLoading
                ? <Icon name="Loader2" size={20} className="animate-spin" />
                : <span className="text-2xl font-black leading-none">Я</span>}
              {loginLoading ? "Перенаправление..." : "Войти через Яндекс"}
            </button>
            <p className="text-xs text-muted-foreground">
              Ваши данные защищены.
            </p>
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}