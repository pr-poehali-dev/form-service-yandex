import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useYandexAuth } from "@/hooks/useYandexAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, login, loginDubble } = useYandexAuth();
  const [yLoading, setYLoading] = useState(false);
  const [dLoading, setDLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/forms", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleYandex = async () => {
    setYLoading(true);
    await login();
    setYLoading(false);
  };

  const handleDubble = () => {
    setDLoading(true);
    loginDubble();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(15,12%,5%)" }}>
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: "hsl(15,12%,5%)" }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(244,81,30,0.15) 0%, transparent 60%)" }} />

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="rounded-3xl p-10 text-center"
          style={{ background: "rgba(12,6,2,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(244,81,30,0.2)" }}>
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

          <button
            onClick={handleDubble}
            disabled={dLoading || yLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-semibold text-white mb-3 hover:opacity-90 transition-all disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 0 20px rgba(0,0,0,0.4)" }}
          >
            {dLoading
              ? <Icon name="Loader2" size={18} className="animate-spin" />
              : <span className="text-lg font-black leading-none">D</span>}
            {dLoading ? "Перенаправление..." : "Войти через Даббл ID"}
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted-foreground">или</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleYandex}
            disabled={yLoading || dLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-semibold text-white mb-4 hover:opacity-90 transition-all disabled:opacity-70"
            style={{ background: "linear-gradient(135deg, #fc3f1d, #ff6534)", boxShadow: "0 0 24px rgba(252,63,29,0.4)" }}
          >
            {yLoading
              ? <Icon name="Loader2" size={20} className="animate-spin" />
              : <span className="text-2xl font-black leading-none">Я</span>}
            {yLoading ? "Перенаправление..." : "Войти через Яндекс"}
          </button>

          <p className="text-xs text-muted-foreground">
            Ваши данные защищены.
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 mx-auto flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground/70 transition"
        >
          <Icon name="ArrowLeft" size={14} />
          На главную
        </button>
      </div>
    </div>
  );
}
