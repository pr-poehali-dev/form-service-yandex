import { useState } from "react";
import Icon from "@/components/ui/icon";

const DEMO_FORMS = [
  {
    id: 1,
    title: "Обратная связь о продукте",
    responses: 247,
    views: 1830,
    status: "active",
    updatedAt: "Сегодня, 14:32",
    color: "from-violet-500 to-purple-700",
    emoji: "💬",
  },
  {
    id: 2,
    title: "Регистрация на мероприятие",
    responses: 89,
    views: 412,
    status: "active",
    updatedAt: "Вчера, 10:15",
    color: "from-cyan-500 to-blue-600",
    emoji: "🎉",
  },
  {
    id: 3,
    title: "Опрос удовлетворённости",
    responses: 1204,
    views: 5670,
    status: "paused",
    updatedAt: "3 дня назад",
    color: "from-rose-500 to-pink-700",
    emoji: "⭐",
  },
  {
    id: 4,
    title: "Заявка на консультацию",
    responses: 34,
    views: 198,
    status: "active",
    updatedAt: "Неделю назад",
    color: "from-orange-500 to-amber-600",
    emoji: "📋",
  },
  {
    id: 5,
    title: "Анкета нового сотрудника",
    responses: 0,
    views: 0,
    status: "draft",
    updatedAt: "Сегодня, 09:00",
    color: "from-green-500 to-emerald-700",
    emoji: "👤",
  },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Активна", color: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/25" },
  paused: { label: "Пауза", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25" },
  draft: { label: "Черновик", color: "text-muted-foreground bg-white/5 border-white/10" },
};

interface FormsPageProps {
  onOpenBuilder: () => void;
}

export default function FormsPage({ onOpenBuilder }: FormsPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DEMO_FORMS.filter((f) => {
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || f.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: "Всего форм", value: "5", icon: "FileText", color: "text-neon-purple", bg: "bg-neon-purple/10" },
    { label: "Активных", value: "3", icon: "Zap", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
    { label: "Ответов", value: "1 574", icon: "MessageSquare", color: "text-neon-pink", bg: "bg-neon-pink/10" },
    { label: "Просмотров", value: "8 110", icon: "Eye", color: "text-neon-orange", bg: "bg-neon-orange/10" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Мои формы</h1>
          <p className="text-muted-foreground mt-1">Управляй своими формами и отслеживай ответы</p>
        </div>
        <button
          onClick={onOpenBuilder}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all neon-glow hover:scale-105 active:scale-100"
          style={{ transition: "all 0.2s ease" }}
        >
          <Icon name="Plus" size={18} />
          Создать форму
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-5 card-hover"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Icon name={s.icon} fallback="Circle" size={18} className={s.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск форм..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "paused", "draft"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {{ all: "Все", active: "Активные", paused: "Пауза", draft: "Черновики" }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Forms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((form, i) => (
          <div
            key={form.id}
            className="glass rounded-2xl overflow-hidden card-hover animate-fade-in"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {/* Card top gradient */}
            <div className={`h-2 bg-gradient-to-r ${form.color}`} />

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{form.emoji}</span>
                  <div>
                    <div className="font-semibold text-foreground leading-tight">{form.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{form.updatedAt}</div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_MAP[form.status].color}`}
                >
                  {STATUS_MAP[form.status].label}
                </span>
              </div>

              <div className="flex gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon name="MessageSquare" size={14} className="text-neon-cyan" />
                  <span className="font-medium text-foreground">{form.responses}</span> ответов
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon name="Eye" size={14} className="text-neon-purple" />
                  <span className="font-medium text-foreground">{form.views}</span> просмотров
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition border border-primary/20">
                  <Icon name="Pencil" size={13} />
                  Редактировать
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground glass transition">
                  <Icon name="Share2" size={13} />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground glass transition">
                  <Icon name="MoreHorizontal" size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* New form card */}
        <button
          onClick={onOpenBuilder}
          className="glass rounded-2xl p-5 border-2 border-dashed border-white/10 hover:border-primary/40 flex flex-col items-center justify-center gap-3 min-h-[200px] text-muted-foreground hover:text-primary transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-primary/15 flex items-center justify-center transition-all">
            <Icon name="Plus" size={24} className="transition-transform group-hover:scale-110" />
          </div>
          <span className="text-sm font-medium">Создать новую форму</span>
        </button>
      </div>
    </div>
  );
}
