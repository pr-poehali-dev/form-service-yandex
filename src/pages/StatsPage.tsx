import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { formsApi, responsesApi, type Form, type FormResponse } from "@/lib/api";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface Stats {
  totalResponses: number;
  totalForms: number;
  activeForms: number;
  todayResponses: number;
  weekResponses: number[];
  topForms: { name: string; responses: number; id: string }[];
  averagePerForm: number;
}

export default function StatsPage() {
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("ff_session_token") || "" : "";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const forms = await formsApi.list();
        const allResponses: FormResponse[] = [];

        await Promise.all(
          forms.map(async (f: Form) => {
            try {
              const rs = await responsesApi.list(f.id);
              rs.forEach((r) => allResponses.push({ ...r, form_id: f.id } as FormResponse & { form_id: string }));
            } catch { /* skip */ }
          })
        );

        // Last 7 days bucket
        const now = new Date();
        const buckets = new Array(7).fill(0);
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(now.getDate() - 6);

        let todayCount = 0;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        allResponses.forEach((r) => {
          const d = new Date(r.created_at);
          const diff = Math.floor((d.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
          if (diff >= 0 && diff < 7) buckets[diff]++;
          if (d >= todayStart) todayCount++;
        });

        // Top forms by response_count
        const topForms = [...forms]
          .map((f) => ({ id: f.id, name: f.title, responses: f.response_count || 0 }))
          .sort((a, b) => b.responses - a.responses)
          .slice(0, 5);

        const totalResponses = forms.reduce((a, f) => a + (f.response_count || 0), 0);
        const activeForms = forms.filter((f) => f.status === "active").length;

        setStats({
          totalResponses,
          totalForms: forms.length,
          activeForms,
          todayResponses: todayCount,
          weekResponses: buckets,
          topForms,
          averagePerForm: forms.length > 0 ? Math.round(totalResponses / forms.length) : 0,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <Icon name="BarChart3" size={40} className="text-foreground/20 mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Войдите, чтобы увидеть статистику</h2>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition glow-sm"
        >
          Войти
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!stats || stats.totalForms === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <Icon name="BarChart3" size={40} className="text-foreground/20 mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Пока нет данных</h2>
        <p className="text-muted-foreground text-sm mb-4">Создайте первую форму, чтобы увидеть статистику</p>
        <button
          onClick={() => navigate("/builder")}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition glow-sm"
        >
          Создать форму
        </button>
      </div>
    );
  }

  const maxVal = Math.max(...stats.weekResponses, 1);

  const KPI = [
    { label: "Всего ответов", value: stats.totalResponses.toLocaleString("ru"), icon: "MessageSquare", color: "text-neon-orange", bg: "bg-neon-orange/10" },
    { label: "Сегодня", value: stats.todayResponses.toLocaleString("ru"), icon: "TrendingUp", color: "text-neon-amber", bg: "bg-neon-amber/10" },
    { label: "Активных форм", value: `${stats.activeForms} из ${stats.totalForms}`, icon: "Zap", color: "text-neon-warm", bg: "bg-neon-warm/10" },
    { label: "Средн. на форму", value: stats.averagePerForm.toLocaleString("ru"), icon: "Activity", color: "text-neon-orange", bg: "bg-neon-orange/10" },
  ];

  return (
    <div className="space-y-8 max-w-6xl px-8 md:px-14 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Статистика</h1>
        <p className="text-muted-foreground mt-1">Реальные данные по всем формам</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map((k, i) => (
          <div key={i} className="glass rounded-2xl p-5 card-hover animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-4`}>
              <Icon name={k.icon} fallback="Circle" size={18} className={k.color} />
            </div>
            <div className="text-2xl font-bold text-foreground">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">Ответы за неделю</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Последние 7 дней</p>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {stats.weekResponses.map((val, i) => {
            const h = (val / maxVal) * 100;
            const isToday = i === 6;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs text-muted-foreground font-medium">{val}</div>
                <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${h}%`, minHeight: 4 }}>
                  <div className={`w-full h-full rounded-t-lg ${isToday ? "gradient-primary glow-orange" : "bg-white/10 hover:bg-white/15"} transition-all cursor-pointer`} />
                </div>
                <div className={`text-xs ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {DAYS[(new Date().getDay() + 6 - (6 - i)) % 7]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {stats.topForms.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Топ форм по ответам</h3>
            <button
              onClick={() => navigate("/forms")}
              className="text-xs text-primary hover:underline"
            >
              Все формы →
            </button>
          </div>
          <div className="divide-y divide-white/6">
            {stats.topForms.map((f, i) => (
              <button
                key={f.id}
                onClick={() => navigate(`/builder/${f.id}`)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/3 transition animate-fade-in text-left"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="text-2xl font-bold text-muted-foreground/30 w-6 text-center font-mono">{i + 1}</div>
                <div className="w-1 h-10 rounded-full bg-gradient-to-b from-orange-600 to-red-700 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">{f.responses.toLocaleString("ru")}</div>
                  <div className="text-xs text-muted-foreground">ответов</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
