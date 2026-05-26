import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import Icon from "@/components/ui/icon";
import { useYandexAuth } from "@/hooks/useYandexAuth";

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useYandexAuth();

  // current page key from path
  const path = location.pathname;
  let currentPage = "forms";
  if (path.startsWith("/builder")) currentPage = "builder";
  else if (path.startsWith("/responses")) currentPage = "responses";
  else if (path.startsWith("/stats")) currentPage = "stats";
  else if (path.startsWith("/profile")) currentPage = "profile";

  // Auto-redirect to /login if not logged in (kроме профиля, чтобы можно было посмотреть онбординг)
  useEffect(() => {
    if (!loading && !user && currentPage !== "profile") {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [loading, user, currentPage, navigate, location.pathname]);

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
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const layoutUser = user
    ? { name: user.name, email: user.email, avatar: user.avatar_url }
    : null;

  const handleNavigate = (page: string) => {
    if (page === "builder") {
      navigate("/builder");
    } else {
      navigate(`/${page}`);
    }
  };

  const handleLogin = () => navigate("/login");

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      user={layoutUser}
      onLogin={handleLogin}
    >
      <Outlet />
    </Layout>
  );
}
