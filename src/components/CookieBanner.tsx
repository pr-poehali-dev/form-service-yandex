import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const COOKIE_KEY = "ff_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-fade-in"
      style={{ backdropFilter: "blur(0px)" }}
    >
      <div
        className="max-w-4xl mx-auto rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{
          background: "rgba(12,6,2,0.97)",
          border: "1px solid rgba(244,81,30,0.25)",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon name="Cookie" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed">
            Мы используем файлы cookie для авторизации и аналитики (Яндекс.Метрика).
            Нажимая «Принять», вы соглашаетесь с обработкой данных в соответствии с{" "}
            <Link to="/privacy" className="text-primary underline hover:no-underline">
              Политикой конфиденциальности
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-xl text-xs font-medium text-foreground/50 hover:text-foreground transition"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Отклонить
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #fc3f1d, #ff6534)" }}
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
