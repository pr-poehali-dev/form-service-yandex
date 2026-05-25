import Icon from "@/components/ui/icon";

const WEEKLY = [12, 28, 19, 45, 38, 61, 52];
const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MAX_VAL = Math.max(...WEEKLY);

const TOP_FORMS = [
  { name: "Обратная связь о продукте", responses: 247, conv: 13.5, color: "from-orange-600 to-red-700" },
  { name: "Опрос удовлетворённости", responses: 1204, conv: 21.2, color: "from-red-700 to-rose-800" },
  { name: "Регистрация на мероприятие", responses: 89, conv: 21.6, color: "from-amber-600 to-orange-700" },
  { name: "Заявка на консультацию", responses: 34, conv: 17.2, color: "from-orange-500 to-amber-600" },
];

const SOURCES = [
  { name: "Прямой переход", pct: 42, color: "bg-neon-orange" },
  { name: "Поисковики", pct: 28, color: "bg-neon-amber" },
  { name: "Соцсети", pct: 18, color: "bg-neon-red" },
  { name: "Email", pct: 12, color: "bg-neon-warm" },
];

const KPI = [
  { label: "Всего ответов", value: "1 574", delta: "+23%", icon: "MessageSquare", color: "text-neon-orange", bg: "bg-neon-orange/10" },
  { label: "Конверсия", value: "18.4%", delta: "+3.1%", icon: "TrendingUp", color: "text-neon-amber", bg: "bg-neon-amber/10" },
  { label: "Среднее время", value: "2:34", delta: "-12с", icon: "Clock", color: "text-neon-warm", bg: "bg-neon-warm/10" },
  { label: "Завершили", value: "91.2%", delta: "+1.8%", icon: "CheckCircle2", color: "text-neon-orange", bg: "bg-neon-orange/10" },
];

export default function StatsPage() {
  return (
    <div className="space-y-8 max-w-6xl px-8 md:px-14 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Статистика</h1>
        <p className="text-muted-foreground mt-1">Аналитика по всем формам за последние 30 дней</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((k, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-5 card-hover animate-fade-in"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}>
                <Icon name={k.icon} fallback="Circle" size={18} className={k.color} />
              </div>
              <span className="text-xs font-semibold text-neon-orange bg-neon-orange/10 px-2 py-0.5 rounded-full">
                {k.delta}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Ответы по дням</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Текущая неделя</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground glass px-3 py-1.5 rounded-xl">
              <Icon name="Calendar" size={13} />
              19–25 мая
            </div>
          </div>

          <div className="flex items-end gap-3 h-40">
            {WEEKLY.map((val, i) => {
              const h = (val / MAX_VAL) * 100;
              const isToday = i === 6;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-muted-foreground font-medium">{val}</div>
                  <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${h}%`, minHeight: 4 }}>
                    <div
                      className={`w-full h-full rounded-t-lg ${
                        isToday ? "gradient-primary glow-orange" : "bg-white/10 hover:bg-white/15"
                      } transition-all cursor-pointer`}
                    />
                  </div>
                  <div className={`text-xs ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {DAYS[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sources donut */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-1">Источники трафика</h3>
          <p className="text-xs text-muted-foreground mb-6">За текущий месяц</p>

          {/* Simple donut via conic-gradient */}
          <div className="flex justify-center mb-6">
            <div
              className="w-28 h-28 rounded-full relative"
              style={{
                background: "conic-gradient(#f4511e 0% 42%, #ff8c00 42% 70%, #c0392b 70% 88%, #ff6b35 88% 100%)",
                boxShadow: "0 0 30px rgba(244,81,30,0.3)",
              }}
            >
              <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">100%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {SOURCES.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${s.color} flex-shrink-0`} />
                <div className="flex-1 text-sm text-muted-foreground truncate">{s.name}</div>
                <div className="text-sm font-semibold text-foreground">{s.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top forms */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/8">
          <h3 className="font-semibold text-foreground">Топ форм по ответам</h3>
        </div>
        <div className="divide-y divide-white/6">
          {TOP_FORMS.map((f, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-white/3 transition animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="text-2xl font-bold text-muted-foreground/30 w-6 text-center font-mono">
                {i + 1}
              </div>
              <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${f.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Конверсия: {f.conv}%</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">{f.responses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">ответов</div>
              </div>
              {/* Progress bar */}
              <div className="w-24 hidden sm:block">
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${f.color} rounded-full`}
                    style={{ width: `${(f.responses / 1204) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}