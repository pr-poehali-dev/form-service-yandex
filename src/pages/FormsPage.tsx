import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { formsApi, type Form } from "@/lib/api";

const STATUS_CFG = {
  active:  { label: "Активна",   cls: "text-green-400 bg-green-400/10 border-green-400/25" },
  paused:  { label: "Пауза",     cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25" },
  draft:   { label: "Черновик",  cls: "text-foreground/40 bg-white/5 border-white/10" },
};

const EMOJIS = ["💬", "📋", "⭐", "🎉", "📊", "🎯", "📝", "🔔"];

interface FormsPageProps {
  onOpenBuilder: (formId?: string) => void;
  token: string;
}

export default function FormsPage({ onOpenBuilder, token }: FormsPageProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "draft">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await formsApi.list();
      setForms(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const form = await formsApi.create({ title: "Новая форма", description: "" });
      setForms(prev => [{ ...form, response_count: 0 } as Form, ...prev]);
      onOpenBuilder(form.id);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await formsApi.delete(id);
      setForms(prev => prev.filter(f => f.id !== id));
      showToast("Форма удалена");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (form: Form) => {
    const newStatus = form.status === "active" ? "paused" : "active";
    await formsApi.update({ id: form.id, status: newStatus });
    setForms(prev => prev.map(f => f.id === form.id ? { ...f, status: newStatus as Form["status"] } : f));
  };

  const handleCopyLink = (form: Form) => {
    const url = formsApi.publicUrl(form.slug);
    navigator.clipboard.writeText(url);
    setCopied(form.id);
    showToast("Ссылка скопирована!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePublish = async (form: Form) => {
    await formsApi.update({ id: form.id, status: "active" });
    setForms(prev => prev.map(f => f.id === form.id ? { ...f, status: "active" } : f));
    showToast("Форма опубликована!");
  };

  const filtered = forms.filter(f => {
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || f.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: "Всего форм",  value: forms.length,                           icon: "FileText",     color: "text-primary",    bg: "bg-primary/10" },
    { label: "Активных",    value: forms.filter(f => f.status === "active").length, icon: "Zap", color: "text-green-400",  bg: "bg-green-400/10" },
    { label: "Ответов",     value: forms.reduce((a, f) => a + (f.response_count || 0), 0), icon: "MessageSquare", color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Черновиков",  value: forms.filter(f => f.status === "draft").length,  icon: "FilePen",      color: "text-foreground/50", bg: "bg-white/5" },
  ];

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-black mb-5 animate-float glow-orange">F</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Войдите в аккаунт</h2>
        <p className="text-muted-foreground text-sm">Чтобы создавать формы и собирать ответы</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-6xl">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium text-white animate-fade-in"
          style={{ background: "rgba(244,81,30,0.95)", backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(244,81,30,0.4)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Мои формы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Создавай, настраивай и публикуй формы</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition glow-sm disabled:opacity-60"
        >
          <Icon name={creating ? "Loader2" : "Plus"} size={17} className={creating ? "animate-spin" : ""} />
          Создать форму
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <Icon name={s.icon} fallback="Circle" size={16} className={s.color} />
            </div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all","active","paused","draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === f
                  ? "text-white gradient-primary glow-sm"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {{ all:"Все", active:"Активные", paused:"Пауза", draft:"Черновики" }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Forms grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="glass rounded-2xl h-40 animate-pulse-slow" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Icon name="FileText" size={40} className="text-foreground/20 mb-4" />
          <p className="text-foreground/50 text-sm">
            {search ? "Форм не найдено" : "Создайте первую форму"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((form, i) => {
            const emoji = EMOJIS[i % EMOJIS.length];
            const cfg = STATUS_CFG[form.status] || STATUS_CFG.draft;
            return (
              <div
                key={form.id}
                className="glass rounded-2xl overflow-hidden animate-fade-in group"
                style={{ animationDelay: `${i * 0.06}s`, borderTop: "2px solid rgba(244,81,30,0.3)" }}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <div className="font-semibold text-foreground text-sm leading-snug line-clamp-1">{form.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(form.updated_at || form.created_at).toLocaleDateString("ru")}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="MessageSquare" size={12} className="text-primary" />
                      <b className="text-foreground">{form.response_count || 0}</b> ответов
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Icon name="Link" size={12} className="text-foreground/30" />
                      <span className="truncate opacity-40">/form/{form.slug}</span>
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    {/* Редактировать */}
                    <button
                      onClick={() => onOpenBuilder(form.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition"
                    >
                      <Icon name="Pencil" size={13} />
                      Изменить
                    </button>

                    {/* Опубликовать / Пауза */}
                    <button
                      onClick={() => form.status === "draft" ? handlePublish(form) : handleToggleStatus(form)}
                      className={`flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium transition glass ${
                        form.status === "active" ? "text-yellow-400 hover:bg-yellow-400/10" : "text-green-400 hover:bg-green-400/10"
                      }`}
                      title={form.status === "draft" ? "Опубликовать" : form.status === "active" ? "Поставить на паузу" : "Возобновить"}
                    >
                      <Icon name={form.status === "active" ? "Pause" : "Play"} size={13} />
                    </button>

                    {/* Копировать ссылку */}
                    <button
                      onClick={() => handleCopyLink(form)}
                      className={`flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium transition glass ${
                        copied === form.id ? "text-green-400" : "text-foreground/50 hover:text-foreground"
                      }`}
                      title="Скопировать публичную ссылку"
                    >
                      <Icon name={copied === form.id ? "Check" : "Copy"} size={13} />
                    </button>

                    {/* Удалить */}
                    <button
                      onClick={() => handleDelete(form.id)}
                      disabled={deleting === form.id}
                      className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium text-foreground/30 hover:text-red-400 hover:bg-red-400/10 transition glass disabled:opacity-50"
                      title="Удалить форму"
                    >
                      <Icon name={deleting === form.id ? "Loader2" : "Trash2"} size={13} className={deleting === form.id ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="glass rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 min-h-[180px] border-dashed border-white/10 hover:border-primary/40 text-foreground/30 hover:text-primary transition-all group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glass group-hover:bg-primary/15 transition">
              <Icon name="Plus" size={20} />
            </div>
            <span className="text-xs font-medium">Новая форма</span>
          </button>
        </div>
      )}
    </div>
  );
}
