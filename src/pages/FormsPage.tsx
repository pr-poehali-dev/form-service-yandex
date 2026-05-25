import { useState } from "react";
import Icon from "@/components/ui/icon";

const DEMO_FORMS = [
  { id: 1, title: "Обратная связь", responses: 247, views: 1830, status: "active", emoji: "💬", color: "#f4511e" },
  { id: 2, title: "Регистрация на событие", responses: 89, views: 412, status: "active", emoji: "🎉", color: "#ff8c00" },
  { id: 3, title: "Опрос клиентов", responses: 1204, views: 5670, status: "paused", emoji: "⭐", color: "#c0392b" },
  { id: 4, title: "Заявка на консультацию", responses: 34, views: 198, status: "active", emoji: "📋", color: "#e8520a" },
];

const TIMELINE = [
  { year: "2022", label: "Web3", icon: "Activity", active: false },
  { year: "2023", label: "DeFi", icon: "Anchor", active: false },
  { year: "2024", label: "AI", icon: "Zap", active: true },
  { year: "2025", label: "Данные", icon: "TrendingUp", active: false },
  { year: "2026", label: "Авто", icon: "Settings", active: false },
  { year: "2027", label: "SaaS", icon: "Monitor", active: false },
];

const NAV_TABS = ["Активность", "Аналитика", "Ответы", "Партнёры", "Прочее"];

interface FormsPageProps {
  onOpenBuilder: () => void;
}

export default function FormsPage({ onOpenBuilder }: FormsPageProps) {
  const [activeTab, setActiveTab] = useState("Активность");

  return (
    <div className="min-h-[calc(100vh-61px)] flex flex-col">

      {/* ═══ HERO SECTION ═══ */}
      <div className="relative overflow-hidden" style={{ minHeight: "62vh" }}>

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://cdn.poehali.dev/projects/267e080f-eff8-4afa-95f4-c72c1b12bd16/bucket/1da569e8-93a8-4db1-a5db-0db7cf2a0e49.jpeg)`,
          }}
        />

        {/* Gradient overlays — left fade + bottom fade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,4,1,0.82) 0%, rgba(10,4,1,0.35) 50%, rgba(80,20,5,0.1) 100%)," +
              "linear-gradient(to top, rgba(10,4,1,1) 0%, rgba(10,4,1,0.6) 28%, transparent 55%)",
          }}
        />

        {/* Ambient orange light */}
        <div
          className="absolute right-0 top-0 w-[55%] h-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 70% 40%, rgba(200,60,10,0.22) 0%, transparent 65%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between px-8 md:px-14 pt-12 pb-8" style={{ minHeight: "62vh" }}>

          {/* Top left — total */}
          <div className="animate-slide-up">
            <p className="text-sm font-medium text-white/50 mb-1 tracking-wide">Всего ответов</p>
            <h1
              className="text-6xl md:text-7xl font-black text-white leading-none glow-text"
              style={{ fontFamily: "'Golos Text', sans-serif" }}
            >
              1 574
            </h1>
          </div>

          {/* Top right — floating stat card */}
          <div
            className="absolute top-10 right-8 md:right-14 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div
              className="rounded-2xl p-4 w-44"
              style={{
                background: "rgba(12,6,2,0.75)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(244,81,30,0.25)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/50 font-medium">Форм создано</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#f4511e" }}>
                  <Icon name="ArrowRight" size={12} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-black text-white mb-3">5</p>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 h-8">
                {[3, 5, 4, 7, 6, 8, 7].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${(h / 8) * 100}%`,
                      background: i === 5 ? "#f4511e" : "rgba(255,255,255,0.15)",
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[10px] font-bold text-primary bg-primary/20 px-1.5 py-0.5 rounded">+23%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TABS + BOTTOM PANEL ═══ */}
      <div
        className="flex-1"
        style={{ background: "linear-gradient(180deg, rgba(10,4,1,1) 0%, hsl(15,12%,5%) 100%)" }}
      >
        {/* Tab row */}
        <div className="flex items-center justify-between px-8 md:px-14 pt-6 pb-4 border-b border-white/6">
          <div className="flex items-center gap-2 flex-wrap">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground/50 hover:text-foreground border border-white/10 hover:border-white/20"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/40 hover:text-foreground glass transition">
              <Icon name="Cloud" size={16} />
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/40 hover:text-foreground glass transition">
              <Icon name="Settings" size={16} />
            </button>
            <button
              onClick={onOpenBuilder}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white gradient-primary glow-sm transition hover:opacity-90"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-8 md:px-14 pt-8 pb-6">
          <p className="text-sm text-foreground/40 mb-6 italic" style={{ fontFamily: "'Golos Text', sans-serif" }}>
            Our Progress
          </p>

          <div className="relative">
            {/* Connector line */}
            <div
              className="absolute top-[22px] left-[22px] right-[22px] h-px"
              style={{
                background: "linear-gradient(to right, rgba(244,81,30,0.6) 0%, rgba(244,81,30,0.15) 60%, rgba(255,255,255,0.08) 100%)",
              }}
            />
            {/* Dashed continuation */}
            <div
              className="absolute top-[22px] left-[40%] right-[22px] h-px"
              style={{
                background: "repeating-linear-gradient(to right, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 6px, transparent 6px, transparent 14px)",
              }}
            />

            <div className="relative flex items-start justify-between">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className="flex flex-col items-center gap-2 flex-1 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  {/* Active badge */}
                  {item.active && (
                    <div
                      className="absolute -top-5 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                      style={{ background: "#f4511e", boxShadow: "0 0 10px rgba(244,81,30,0.7)" }}
                    >
                      сейчас
                    </div>
                  )}

                  {/* Node circle */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center z-10 transition-all ${
                      item.active
                        ? "glow-orange"
                        : ""
                    }`}
                    style={{
                      background: item.active
                        ? "linear-gradient(135deg, #f4511e, #ff8c00)"
                        : i < 2
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(20,10,5,0.9)",
                      border: item.active
                        ? "none"
                        : i < 2
                        ? "1px solid rgba(255,255,255,0.2)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Icon name={item.icon} fallback="Circle" size={18} className={item.active ? "text-white" : i < 2 ? "text-white" : "text-foreground/40"} />
                  </div>

                  <div className="text-center">
                    <div className={`text-xs font-semibold ${item.active ? "text-foreground" : "text-foreground/50"}`}>
                      {item.label}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${item.active ? "text-primary" : "text-foreground/30"}`}>
                      {item.year}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Forms grid */}
        <div className="px-8 md:px-14 pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground/70">Мои формы</h2>
            <button className="text-xs text-primary hover:text-primary/80 transition">Все →</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_FORMS.map((form, i) => (
              <div
                key={form.id}
                className="glass rounded-2xl p-5 card-hover cursor-pointer animate-fade-in group"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: `${form.color}22`, border: `1px solid ${form.color}33` }}
                >
                  {form.emoji}
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug mb-3">{form.title}</p>
                <div className="flex items-center justify-between text-xs text-foreground/40">
                  <span>{form.responses} ответов</span>
                  <span
                    className={`px-2 py-0.5 rounded-full border ${
                      form.status === "active"
                        ? "text-primary border-primary/25 bg-primary/10"
                        : "text-foreground/30 border-white/10"
                    }`}
                  >
                    {form.status === "active" ? "Активна" : "Пауза"}
                  </span>
                </div>
              </div>
            ))}

            {/* Add new */}
            <button
              onClick={onOpenBuilder}
              className="glass rounded-2xl p-5 flex flex-col items-center justify-center gap-2 min-h-[140px] border-dashed border-white/10 hover:border-primary/30 text-foreground/30 hover:text-primary transition-all group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center glass group-hover:bg-primary/15 transition">
                <Icon name="Plus" size={20} />
              </div>
              <span className="text-xs font-medium">Новая форма</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
