import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { formsApi, responsesApi, type Form, type FormResponse } from "@/lib/api";

export default function ResponsesPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("ff_session_token") || "" : "";
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingForms, setLoadingForms] = useState(true);
  const [detail, setDetail] = useState<FormResponse | null>(null);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (!token) return;
    formsApi.list().then(data => {
      setForms(data);
      if (data.length > 0) setSelectedFormId(data[0].id);
    }).finally(() => setLoadingForms(false));
  }, [token]);

  const loadResponses = useCallback(async () => {
    if (!selectedFormId || !token) return;
    setLoading(true);
    try {
      const data = await responsesApi.list(selectedFormId);
      setResponses(data);
    } finally {
      setLoading(false);
    }
  }, [selectedFormId, token]);

  useEffect(() => { loadResponses(); }, [loadResponses]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await responsesApi.delete(id);
      setResponses(prev => prev.filter(r => r.id !== id));
      setDetail(null);
      showToast("Ответ удалён");
    } finally {
      setDeleting(null);
    }
  };

  const handleExportCSV = () => {
    if (!responses.length) return;
    const keys = [...new Set(responses.flatMap(r => Object.keys(r.data)))];
    const header = ["Дата", "Имя", "Email", ...keys].join(";");
    const rows = responses.map(r => [
      new Date(r.created_at).toLocaleString("ru"),
      r.name || "",
      r.email || "",
      ...keys.map(k => (r.data[k] || "").replace(/;/g, ",")),
    ].join(";"));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `responses-${selectedFormId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV скачан!");
  };

  const filtered = responses.filter(r =>
    (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.email || "").toLowerCase().includes(search.toLowerCase()) ||
    Object.values(r.data || {}).some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedForm = forms.find(f => f.id === selectedFormId);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Войдите, чтобы просматривать ответы
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium text-white animate-fade-in"
          style={{ background: "rgba(244,81,30,0.95)", backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(244,81,30,0.4)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ответы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {selectedForm ? selectedForm.title : "Выберите форму"}
            {responses.length > 0 && ` — ${responses.length} ответов`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!responses.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass text-muted-foreground hover:text-foreground transition disabled:opacity-40"
          >
            <Icon name="Download" size={15} className="text-primary" />
            CSV
          </button>
        </div>
      </div>

      {/* Form selector */}
      {loadingForms ? (
        <div className="h-10 glass rounded-xl animate-pulse-slow" />
      ) : forms.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
          <Icon name="FileText" size={28} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">Нет форм. Создайте форму и соберите ответы.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {forms.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFormId(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedFormId === f.id
                  ? "text-white gradient-primary glow-sm"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.title}
              <span className="ml-2 text-xs opacity-60">{f.response_count || 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      {responses.length > 0 && (
        <div className="relative max-w-sm">
          <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по ответам..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Responses table */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-14 glass rounded-2xl animate-pulse-slow" />)}
        </div>
      ) : !selectedFormId || filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">{search ? "Ничего не найдено" : "Ответов пока нет"}</p>
          {!search && selectedForm && (
            <p className="text-xs mt-2 opacity-60">
              Опубликуйте форму и поделитесь ссылкой:{" "}
              <span className="text-primary">{formsApi.publicUrl(selectedForm.slug)}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/8 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>#</span>
            <span>Имя / Email</span>
            <span className="hidden md:block">Первый ответ</span>
            <span>Дата</span>
          </div>
          {filtered.map((r, i) => {
            const firstKey = Object.keys(r.data || {})[0];
            const firstVal = firstKey ? r.data[firstKey] : "—";
            return (
              <div
                key={r.id}
                className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 border-b border-white/6 last:border-0 cursor-pointer hover:bg-white/3 transition animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => setDetail(r)}
              >
                <span className="text-xs text-muted-foreground/40 font-mono w-6 text-center">{i + 1}</span>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(r.name || r.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{r.name || r.email || "Аноним"}</div>
                    {r.email && r.name && <div className="text-xs text-muted-foreground truncate">{r.email}</div>}
                  </div>
                </div>
                <div className="hidden md:block text-xs text-muted-foreground truncate">{String(firstVal).slice(0, 60)}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  {new Date(r.created_at).toLocaleDateString("ru")}
                  <Icon name="ChevronRight" size={14} className="opacity-40" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setDetail(null)}>
          <div
            className="rounded-3xl p-7 w-full max-w-lg animate-scale-in relative max-h-[85vh] overflow-y-auto"
            style={{ background: "rgba(12,6,2,0.97)", border: "1px solid rgba(244,81,30,0.2)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                  {(detail.name || detail.email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{detail.name || "Аноним"}</div>
                  <div className="text-xs text-muted-foreground">{detail.email || ""} · {new Date(detail.created_at).toLocaleString("ru")}</div>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(detail.data || {}).map(([k, v]) => (
                <div key={k} className="glass rounded-xl p-4">
                  <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider">{k}</div>
                  <div className="text-sm text-foreground">{String(v)}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => handleDelete(detail.id)}
                disabled={deleting === detail.id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 transition disabled:opacity-50"
              >
                <Icon name={deleting === detail.id ? "Loader2" : "Trash2"} size={15} className={deleting === detail.id ? "animate-spin" : ""} />
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}