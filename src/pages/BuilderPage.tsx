import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { formsApi, type Form, type FormField } from "@/lib/api";

const FIELD_TYPES = [
  { type: "text",     label: "Короткий текст",     icon: "Type",        color: "text-blue-400" },
  { type: "textarea", label: "Длинный текст",       icon: "AlignLeft",   color: "text-indigo-400" },
  { type: "email",    label: "Email",               icon: "Mail",        color: "text-purple-400" },
  { type: "phone",    label: "Телефон",             icon: "Phone",       color: "text-pink-400" },
  { type: "number",   label: "Число",               icon: "Hash",        color: "text-orange-400" },
  { type: "select",   label: "Выпадающий список",   icon: "ChevronDown", color: "text-yellow-400" },
  { type: "radio",    label: "Один из вариантов",   icon: "CircleDot",   color: "text-green-400" },
  { type: "checkbox", label: "Несколько вариантов", icon: "CheckSquare", color: "text-teal-400" },
  { type: "date",     label: "Дата",                icon: "Calendar",    color: "text-cyan-400" },
  { type: "rating",   label: "Рейтинг",             icon: "Star",        color: "text-amber-400" },
];

let _id = 1;
const uid = () => `f${++_id}-${Date.now()}`;

interface BuilderPageProps {
  formId?: string;
  token: string;
  onBack?: () => void;
}

export default function BuilderPage({ formId, token, onBack }: BuilderPageProps) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("Новая форма");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Form["status"]>("draft");
  const [slug, setSlug] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Загрузить форму если formId передан
  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    fetch(`https://functions.poehali.dev/64ba70e7-2376-416b-9dff-265e6a77cd03?id=${formId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(raw => {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.fields) setFields(data.fields);
        if (data.status) setStatus(data.status);
        if (data.slug) setSlug(data.slug);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [formId, token]);

  // Получить список форм для нахождения нужной
  useEffect(() => {
    if (!formId || !token) return;
    formsApi.list().then(forms => {
      const f = forms.find(x => x.id === formId);
      if (f) {
        setTitle(f.title);
        setDescription(f.description || "");
        setStatus(f.status);
        setSlug(f.slug);
      }
    }).catch(() => {});
  }, [formId, token]);

  const selected = fields.find(f => f.id === selectedId) || null;

  const addField = (type: string) => {
    const ft = FIELD_TYPES.find(f => f.type === type);
    const field: FormField = {
      id: uid(),
      type,
      label: ft?.label || "Поле",
      required: false,
      placeholder: "",
      options: ["select","radio","checkbox"].includes(type) ? ["Вариант 1","Вариант 2","Вариант 3"] : undefined,
    };
    setFields(prev => [...prev, field]);
    setSelectedId(field.id);
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const deleteField = (id: string) => {
    setFields(prev => {
      const rest = prev.filter(f => f.id !== id);
      if (selectedId === id) setSelectedId(rest[0]?.id || null);
      return rest;
    });
  };

  const moveField = (id: string, dir: -1 | 1) => {
    setFields(prev => {
      const arr = [...prev];
      const idx = arr.findIndex(f => f.id === id);
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return arr;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return arr;
    });
  };

  const handleSave = useCallback(async () => {
    if (!formId) return;
    setSaving(true);
    try {
      await formsApi.update({ id: formId, title, description, fields, status });
      setSaved(true);
      showToast("Сохранено ✓");
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [formId, title, description, fields, status]);

  const handlePublish = async () => {
    if (!formId) return;
    setSaving(true);
    try {
      await formsApi.update({ id: formId, title, description, fields, status: "active" });
      setStatus("active");
      showToast("Форма опубликована! Ссылка скопирована.");
      const url = formsApi.publicUrl(slug);
      navigator.clipboard.writeText(url);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    const url = formsApi.publicUrl(slug);
    navigator.clipboard.writeText(url);
    showToast("Ссылка скопирована!");
  };

  const fieldBase = "w-full px-4 py-3 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";

  const renderPreview = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return <textarea className={`${fieldBase} h-24 resize-none`} placeholder={field.placeholder || "Введите текст..."} />;
      case "select":
        return (
          <select className={`${fieldBase} bg-transparent`}>
            <option value="">Выберите...</option>
            {(field.options || []).map(o => <option key={o}>{o}</option>)}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {(field.options || []).map(o => (
              <label key={o} className="flex items-center gap-3 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-2 border-white/25 hover:border-primary transition" />
                <span className="text-sm text-muted-foreground">{o}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {(field.options || []).map(o => (
              <label key={o} className="flex items-center gap-3 cursor-pointer">
                <div className="w-4 h-4 rounded border-2 border-white/25 hover:border-primary transition" />
                <span className="text-sm text-muted-foreground">{o}</span>
              </label>
            ))}
          </div>
        );
      case "rating":
        return (
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} className="text-2xl text-white/20 hover:text-amber-400 transition">★</button>
            ))}
          </div>
        );
      case "date":
        return <input type="date" className={fieldBase} />;
      default:
        return <input type={field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text"} className={fieldBase} placeholder={field.placeholder || "Введите значение..."} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium text-white animate-fade-in"
          style={{ background: "rgba(244,81,30,0.95)", backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(244,81,30,0.4)" }}>
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-white/7 flex-shrink-0"
        style={{ background: "rgba(8,4,2,0.7)", backdropFilter: "blur(12px)" }}>
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl glass text-foreground/50 hover:text-foreground transition">
            <Icon name="ArrowLeft" size={16} />
          </button>
        )}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-base font-bold text-foreground focus:outline-none min-w-0"
          placeholder="Название формы..."
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
            status === "active" ? "text-green-400 border-green-400/30 bg-green-400/10" :
            status === "paused" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
            "text-foreground/40 border-white/10 bg-white/5"
          }`}>
            {status === "active" ? "Активна" : status === "paused" ? "Пауза" : "Черновик"}
          </span>
          {slug && (
            <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs glass px-3 py-1.5 rounded-xl text-foreground/50 hover:text-foreground transition">
              <Icon name="Link" size={13} />
              Ссылка
            </button>
          )}
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition glass ${preview ? "text-primary border-primary/30" : "text-foreground/50 hover:text-foreground"}`}
          >
            <Icon name={preview ? "EyeOff" : "Eye"} size={14} />
            {preview ? "Редактор" : "Просмотр"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formId}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${saved ? "text-green-400 bg-green-400/10 border border-green-400/30" : "glass text-foreground/60 hover:text-foreground"}`}
          >
            <Icon name={saving ? "Loader2" : saved ? "Check" : "Save"} size={14} className={saving ? "animate-spin" : ""} />
            {saved ? "Сохранено" : "Сохранить"}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || !formId}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white gradient-primary hover:opacity-90 transition glow-sm disabled:opacity-60"
          >
            <Icon name="Share2" size={14} />
            Опубликовать
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left palette */}
        {!preview && (
          <div className="w-52 flex-shrink-0 overflow-y-auto p-3 space-y-1 border-r border-white/6 hidden lg:block"
            style={{ background: "rgba(8,4,2,0.5)" }}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">Элементы</p>
            {FIELD_TYPES.map(ft => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl glass text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all group text-left"
              >
                <Icon name={ft.icon} fallback="Circle" size={14} className={ft.color} />
                <span>{ft.label}</span>
                <Icon name="Plus" size={11} className="ml-auto opacity-0 group-hover:opacity-100 text-primary transition" />
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto">
            <div className="glass rounded-3xl p-8 space-y-5">
              <div className="pb-4 border-b border-white/8">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>

              {fields.length === 0 && !preview && (
                <div className="text-center py-10 text-muted-foreground">
                  <Icon name="MousePointerClick" size={28} className="mx-auto mb-3 opacity-25" />
                  <p className="text-sm">Добавь поля из панели слева</p>
                </div>
              )}

              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  onClick={() => !preview && setSelectedId(field.id)}
                  className={`relative group rounded-2xl transition-all ${!preview ? `cursor-pointer p-3 -mx-3 ${selectedId === field.id ? "bg-primary/8 ring-1 ring-primary/25" : "hover:bg-white/3"}` : ""}`}
                >
                  {!preview && (
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={e => { e.stopPropagation(); moveField(field.id, -1); }} disabled={idx === 0}
                        className="w-6 h-6 rounded-lg glass flex items-center justify-center text-foreground/40 hover:text-foreground disabled:opacity-20">
                        <Icon name="ChevronUp" size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); moveField(field.id, 1); }} disabled={idx === fields.length - 1}
                        className="w-6 h-6 rounded-lg glass flex items-center justify-center text-foreground/40 hover:text-foreground disabled:opacity-20">
                        <Icon name="ChevronDown" size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteField(field.id); }}
                        className="w-6 h-6 rounded-lg glass flex items-center justify-center text-foreground/40 hover:text-red-400">
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  )}
                  <label className="text-sm font-medium text-foreground block mb-2">
                    {field.label}
                    {field.required && <span className="text-primary ml-1">*</span>}
                  </label>
                  {renderPreview(field)}
                </div>
              ))}

              <div className="pt-2">
                <button className="w-full py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition glow-sm">
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right props panel */}
        {!preview && (
          <div className="w-56 flex-shrink-0 overflow-y-auto p-3 border-l border-white/6 hidden xl:block"
            style={{ background: "rgba(8,4,2,0.5)" }}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-3">Свойства</p>

            {selected ? (
              <div className="space-y-4 glass rounded-2xl p-4">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Подпись</label>
                  <input
                    value={selected.label}
                    onChange={e => updateField(selected.id, { label: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Подсказка</label>
                  <input
                    value={selected.placeholder || ""}
                    onChange={e => updateField(selected.id, { placeholder: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="placeholder..."
                  />
                </div>

                {["select","radio","checkbox"].includes(selected.type) && (
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Варианты (по одному)</label>
                    <textarea
                      value={(selected.options || []).join("\n")}
                      onChange={e => updateField(selected.id, { options: e.target.value.split("\n").filter(Boolean) })}
                      className="w-full px-3 py-2 rounded-xl glass text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 h-24 resize-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Обязательное</label>
                  <button
                    onClick={() => updateField(selected.id, { required: !selected.required })}
                    className={`relative w-9 h-5 rounded-full transition-colors ${selected.required ? "bg-primary" : "bg-white/15"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${selected.required ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>

                <button
                  onClick={() => deleteField(selected.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 transition"
                >
                  <Icon name="Trash2" size={13} />
                  Удалить поле
                </button>
              </div>
            ) : (
              <div className="glass rounded-2xl p-5 text-center text-muted-foreground">
                <Icon name="MousePointerClick" size={22} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Выбери поле для настройки</p>
              </div>
            )}

            {/* Form meta */}
            <div className="mt-3 space-y-3 glass rounded-2xl p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Описание</p>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 h-16 resize-none"
                placeholder="Опишите форму..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
