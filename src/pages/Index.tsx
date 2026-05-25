import { useState } from "react";
import Layout from "@/components/Layout";
import FormsPage from "@/pages/FormsPage";
import BuilderPage from "@/pages/BuilderPage";
import ResponsesPage from "@/pages/ResponsesPage";
import StatsPage from "@/pages/StatsPage";
import ProfilePage from "@/pages/ProfilePage";
import Icon from "@/components/ui/icon";

const DEMO_USER = {
  name: "Алексей Смирнов",
  email: "a.smirnov@yandex.ru",
  avatar: "",
};

export default function Index() {
  const [currentPage, setCurrentPage] = useState("forms");
  const [user, setUser] = useState<typeof DEMO_USER | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = () => setShowLoginModal(true);
  const handleLogout = () => setUser(null);
  const handleYandexLogin = () => {
    setUser(DEMO_USER);
    setShowLoginModal(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "forms":
        return <FormsPage onOpenBuilder={() => setCurrentPage("builder")} />;
      case "builder":
        return <BuilderPage />;
      case "responses":
        return <ResponsesPage />;
      case "stats":
        return <StatsPage />;
      case "profile":
        return <ProfilePage user={user} onLogin={handleLogin} onLogout={handleLogout} />;
      default:
        return <FormsPage onOpenBuilder={() => setCurrentPage("builder")} />;
    }
  };

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogin={handleLogin}
      >
        {renderPage()}
      </Layout>

      {/* Yandex Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="glass-strong rounded-3xl p-10 w-full max-w-md text-center animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center neon-glow animate-float">
              <Icon name="Zap" size={28} className="text-white" />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Добро пожаловать!</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Войди через Яндекс, чтобы создавать формы и собирать ответы
            </p>

            <button
              onClick={handleYandexLogin}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-semibold text-white mb-4 hover:opacity-90 transition-all"
              style={{
                background: "linear-gradient(135deg, #fc3f1d 0%, #ff6534 100%)",
                boxShadow: "0 0 24px rgba(252, 63, 29, 0.4)",
              }}
            >
              <span className="text-2xl font-black">Я</span>
              Войти через Яндекс
            </button>

            <p className="text-xs text-muted-foreground">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <span className="text-primary cursor-pointer hover:underline">условиями использования</span>
            </p>

            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl hover:bg-white/8 text-muted-foreground transition"
            >
              <Icon name="X" size={18} />
            </button>

            <div className="flex items-center gap-2 justify-center mt-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse-slow"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
