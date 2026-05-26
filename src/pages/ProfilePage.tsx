import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";

const INTEGRATIONS = [
  { name: "Яндекс", icon: "🟡", status: true, desc: "Вход и синхронизация" },
  { name: "Telegram", icon: "💬", status: false, desc: "Уведомления о новых ответах" },
  { name: "Email-рассылка", icon: "📧", status: false, desc: "Отправка на почту" },
  { name: "Google Sheets", icon: "📊", status: false, desc: "Автосинхронизация ответов" },
];

const PLANS = [
  { name: "Старт", price: "0 ₽", forms: "3 формы", responses: "100 ответов/мес", active: false },
  { name: "Про", price: "990 ₽", forms: "∞ форм", responses: "∞ ответов", active: true },
  { name: "Бизнес", price: "4 990 ₽", forms: "∞ форм", responses: "∞ + API доступ", active: false },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const user = authUser ? { name: authUser.name, email: authUser.email, avatar: authUser.avatar_url } : null;
  const onLogin = () => navigate("/login");
  const onLogout = async () => { await logout(); navigate("/login"); };

  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem("ff_notifications");
      return stored ? JSON.parse(stored) : { newResponse: true, weeklyReport: true, tips: false };
    } catch {
      return { newResponse: true, weeklyReport: true, tips: false };
    }
  });
  const [integrations, setIntegrations] = useState(() => {
    try {
      const stored = localStorage.getItem("ff_integrations");
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { Яндекс: true, Telegram: false, "Email-рассылка": false, "Google Sheets": false };
  });
  const [toast, setToast] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("Про");
  const [planLoading, setPlanLoading] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleIntegration = (name: string) => {
    const next = { ...integrations, [name]: !integrations[name] };
    setIntegrations(next);
    localStorage.setItem("ff_integrations", JSON.stringify(next));
    showToast(`${name}: ${next[name] ? "включено" : "выключено"}`);
  };

  const toggleNotification = (key: string) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    localStorage.setItem("ff_notifications", JSON.stringify(next));
  };

  const handleSelectPlan = (planName: string) => {
    setPlanLoading(planName);
    setTimeout(() => {
      setCurrentPlan(planName);
      setPlanLoading(null);
      showToast(`Тариф «${planName}» активирован`);
    }, 800);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center neon-glow animate-float">
          <Icon name="User" size={40} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Войдите в аккаунт</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Войдите через Яндекс, чтобы получить доступ ко всем функциям Формус
          </p>
        </div>
        <button
          onClick={onLogin}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white gradient-primary hover:opacity-90 transition-all neon-glow hover:scale-105 active:scale-100"
          style={{ transition: "all 0.2s ease" }}
        >
          <span className="text-xl">🟡</span>
          Войти через Яндекс
        </button>
        <p className="text-xs text-muted-foreground">
          Мы используем Яндекс OAuth. Ваши данные защищены.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl px-8 md:px-14 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-foreground">Профиль</h1>

      {/* User card */}
      <div className="glass rounded-3xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold glow-orange">
            {user.name[0]}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-orange rounded-full flex items-center justify-center glow-sm">
            <Icon name="Check" size={12} className="text-background font-bold" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Icon name="Mail" size={13} />
            {user.email}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-neon-orange/15 text-neon-orange border border-neon-orange/25 font-medium">
              ✦ Тариф «{currentPlan}»
            </span>
            <span className="text-xs text-muted-foreground">до 01.06.2026</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground glass hover:text-destructive hover:border-destructive/30 transition"
        >
          <Icon name="LogOut" size={15} />
          Выйти
        </button>
      </div>

      {/* Tariffs */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Тариф</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isActive = plan.name === currentPlan;
            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 transition-all ${
                  isActive ? "gradient-primary neon-glow" : "glass card-hover"
                }`}
              >
                {isActive && (
                  <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Текущий</div>
                )}
                <div className={`text-xl font-bold ${isActive ? "text-white" : "text-foreground"} mb-1`}>
                  {plan.name}
                </div>
                <div className={`text-2xl font-black mb-3 ${isActive ? "text-white" : "text-foreground"}`}>
                  {plan.price}
                  {plan.price !== "0 ₽" && <span className="text-sm font-normal opacity-70">/мес</span>}
                </div>
                <div className={`text-xs space-y-1.5 ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                  <div className="flex items-center gap-1.5">
                    <Icon name="FileText" size={12} />
                    {plan.forms}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="MessageSquare" size={12} />
                    {plan.responses}
                  </div>
                </div>
                {!isActive && (
                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    disabled={planLoading === plan.name}
                    className="w-full mt-4 py-2 rounded-xl text-xs font-semibold glass text-foreground hover:bg-white/8 transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {planLoading === plan.name ? <Icon name="Loader2" size={12} className="animate-spin" /> : null}
                    {planLoading === plan.name ? "Активация..." : "Выбрать"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Integrations */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Интеграции</h3>
        <div className="glass rounded-2xl divide-y divide-white/6 overflow-hidden">
          {INTEGRATIONS.map((integ) => {
            const status = integrations[integ.name] ?? integ.status;
            return (
              <div key={integ.name} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition">
                <span className="text-2xl">{integ.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{integ.name}</div>
                  <div className="text-xs text-muted-foreground">{integ.desc}</div>
                </div>
                <button
                  onClick={() => toggleIntegration(integ.name)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    status ? "bg-primary neon-glow" : "bg-white/15"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      status ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Уведомления</h3>
        <div className="glass rounded-2xl divide-y divide-white/6 overflow-hidden">
          {[
            { key: "newResponse" as const, label: "Новый ответ", desc: "Уведомлять при каждом новом ответе" },
            { key: "weeklyReport" as const, label: "Еженедельный отчёт", desc: "Сводка за неделю каждый понедельник" },
            { key: "tips" as const, label: "Советы и новости", desc: "Полезные подсказки по улучшению форм" },
          ].map((n) => (
            <div key={n.key} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition">
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <button
                onClick={() => toggleNotification(n.key)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  notifications[n.key] ? "bg-primary" : "bg-white/15"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    notifications[n.key] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account actions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Аккаунт</h3>
        <div className="glass rounded-2xl divide-y divide-white/6 overflow-hidden">
          <button
            onClick={() => navigate("/forms")}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition text-left"
          >
            <Icon name="LayoutDashboard" size={18} className="text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Мои формы</div>
              <div className="text-xs text-muted-foreground">Перейти к списку форм</div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-foreground/30" />
          </button>
          <button
            disabled
            className="w-full flex items-center gap-4 px-5 py-4 text-left opacity-40 cursor-not-allowed"
          >
            <Icon name="MessageCircle" size={18} className="text-sky-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Сообщество</div>
              <div className="text-xs text-muted-foreground">Telegram-чат для пользователей</div>
            </div>
            <Icon name="ExternalLink" size={14} className="text-foreground/30" />
          </button>
          <button
            disabled
            className="w-full flex items-center gap-4 px-5 py-4 text-left opacity-40 cursor-not-allowed"
          >
            <Icon name="HelpCircle" size={18} className="text-amber-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Поддержка</div>
              <div className="text-xs text-muted-foreground">Связаться с нами при проблемах</div>
            </div>
            <Icon name="ExternalLink" size={14} className="text-foreground/30" />
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium text-white animate-fade-in"
          style={{ background: "rgba(244,81,30,0.95)", backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(244,81,30,0.4)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}