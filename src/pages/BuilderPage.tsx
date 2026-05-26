import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import ShareModal from "@/components/ShareModal";
import { formsApi, type Form, type FormField } from "@/lib/api";

const FIELD_GROUPS: { title: string; items: { type: string; label: string; icon: string; color: string }[] }[] = [
  {
    title: "Базовые",
    items: [
      { type: "text",     label: "Короткий текст",     icon: "Type",        color: "text-blue-400" },
      { type: "textarea", label: "Длинный текст",       icon: "AlignLeft",   color: "text-indigo-400" },
      { type: "email",    label: "Email",               icon: "Mail",        color: "text-purple-400" },
      { type: "phone",    label: "Телефон",             icon: "Phone",       color: "text-pink-400" },
      { type: "number",   label: "Число",               icon: "Hash",        color: "text-orange-400" },
      { type: "url",      label: "Ссылка (URL)",        icon: "Link",        color: "text-sky-400" },
      { type: "date",     label: "Дата",                icon: "Calendar",    color: "text-cyan-400" },
      { type: "time",     label: "Время",               icon: "Clock",       color: "text-cyan-400" },
    ],
  },
  {
    title: "Выбор",
    items: [
      { type: "select",   label: "Выпадающий список",   icon: "ChevronDown", color: "text-yellow-400" },
      { type: "radio",    label: "Один из вариантов",   icon: "CircleDot",   color: "text-green-400" },
      { type: "checkbox", label: "Несколько вариантов", icon: "CheckSquare", color: "text-teal-400" },
      { type: "yesno",    label: "Да / Нет",            icon: "ToggleLeft",  color: "text-lime-400" },
    ],
  },
  {
    title: "Оценка",
    items: [
      { type: "rating",   label: "Рейтинг (звёзды)",    icon: "Star",        color: "text-amber-400" },
      { type: "nps",      label: "NPS (0-10)",          icon: "TrendingUp",  color: "text-pink-400" },
      { type: "scale",    label: "Шкала (1-5)",         icon: "Sliders",     color: "text-fuchsia-400" },
      { type: "emoji",    label: "Эмоции",              icon: "Smile",       color: "text-yellow-400" },
    ],
  },
  {
    title: "Продвинутые",
    items: [
      { type: "file",      label: "Файл / Картинка",    icon: "Upload",      color: "text-rose-400" },
      { type: "signature", label: "Подпись",            icon: "Pen",         color: "text-violet-400" },
      { type: "address",   label: "Адрес",              icon: "MapPin",      color: "text-emerald-400" },
      { type: "color",     label: "Цвет",               icon: "Palette",     color: "text-pink-400" },
      { type: "consent",   label: "Согласие (галка)",   icon: "ShieldCheck", color: "text-green-400" },
      { type: "section",   label: "Раздел / Заголовок", icon: "Heading",     color: "text-foreground/50" },
    ],
  },
];

const FIELD_TYPES = FIELD_GROUPS.flatMap((g) => g.items);

const BG_PRESETS = [
  { id: "dark",     label: "Тёмный",     style: { background: "rgba(12,6,2,0.95)" } },
  { id: "orange",   label: "Оранжевый",  style: { background: "linear-gradient(135deg, rgba(244,81,30,0.18), rgba(12,6,2,0.97))" } },
  { id: "purple",   label: "Фиолетовый", style: { background: "linear-gradient(135deg, rgba(120,40,200,0.2), rgba(12,6,2,0.97))" } },
  { id: "teal",     label: "Изумруд",    style: { background: "linear-gradient(135deg, rgba(20,180,140,0.18), rgba(12,6,2,0.97))" } },
  { id: "blue",     label: "Синий",      style: { background: "linear-gradient(135deg, rgba(30,100,255,0.18), rgba(12,6,2,0.97))" } },
  { id: "rose",     label: "Розовый",    style: { background: "linear-gradient(135deg, rgba(255,50,100,0.18), rgba(12,6,2,0.97))" } },
  { id: "slate",    label: "Серый",      style: { background: "linear-gradient(135deg, rgba(100,120,140,0.2), rgba(12,6,2,0.97))" } },
  { id: "white",    label: "Светлый",    style: { background: "linear-gradient(135deg, #1a1a2a, #2a2a3a)" } },
];

let _id = 1;
const uid = () => `f${++_id}-${Date.now()}`;

interface ExtendedField extends FormField {
  description?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  minDate?: string;
  maxDate?: string;
  pattern?: string;
  errorMessage?: string;
  allowMultiple?: boolean;
  maxFileSize?: number;
  acceptedTypes?: string;
  rows?: number;
  showCharCount?: boolean;
  consentText?: string;
}

export default function BuilderPage() {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const token = typeof window !== "undefined" ? localStorage.getItem("ff_session_token") || "" : "";
  const onBack = () => navigate("/forms");

  const [fields, setFields] = useState<ExtendedField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<ExtendedField | null>(null);
  const [title, setTitle] = useState("Новая форма");
  const [titleFocused, setTitleFocused] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Form["status"]>("draft");
  const [slug, setSlug] = useState("");
  const [bgPreset, setBgPreset] = useState("dark");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"design" | "form" | "submit">("design");
  const [submitLabel, setSubmitLabel] = useState("Отправить");
  const [thanksTitle, setThanksTitle] = useState("Спасибо за ответ!");
  const [thanksText, setThanksText] = useState("Мы получили вашу форму и скоро свяжемся с вами.");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (formId || !token) return;
    formsApi.create({ title: "Новая форма", description: "" }).then((f) => {
      if (f && f.id) navigate(`/builder/${f.id}`, { replace: true });
    }).catch(() => {});
  }, [formId, token, navigate]);

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
        if (data.settings?.bgPreset) setBgPreset(data.settings.bgPreset);
        if (data.settings?.submitLabel) setSubmitLabel(data.settings.submitLabel);
        if (data.settings?.thanksTitle) setThanksTitle(data.settings.thanksTitle);
        if (data.settings?.thanksText) setThanksText(data.settings.thanksText);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [formId, token]);

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

  const addField = (type: string) => {
    const ft = FIELD_TYPES.find(f => f.type === type);
    const defaultOptions = ["select","radio","checkbox"].includes(type)
      ? ["Вариант 1","Вариант 2","Вариант 3"]
      : type === "yesno" ? ["Да","Нет"]
      : type === "emoji" ? ["😡","😕","😐","🙂","😍"]
      : undefined;

    const labelByType: Record<string,string> = {
      section: "Раздел",
      signature: "Подпись",
      file: "Загрузите файл",
      address: "Адрес",
      consent: "Я согласен с условиями обработки персональных данных",
      nps: "Насколько вероятно, что вы порекомендуете нас?",
      scale: "Оцените по шкале",
      url: "Ссылка",
      time: "Время",
      color: "Выберите цвет",
      yesno: "Да или нет?",
      emoji: "Как вам наш сервис?",
    };

    const field: ExtendedField = {
      id: uid(),
      type,
      label: labelByType[type] || ft?.label || "Поле",
      required: false,
      placeholder: "",
      options: defaultOptions,
    };
    setFields(prev => [...prev, field]);
    setEditingField(field);
    setSelectedId(field.id);
    setShowPalette(false);
  };

  const updateField = (id: string, patch: Partial<ExtendedField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
    if (editingField?.id === id) setEditingField(prev => prev ? { ...prev, ...patch } : null);
  };

  const deleteField = (id: string) => {
    setFields(prev => {
      const rest = prev.filter(f => f.id !== id);
      if (selectedId === id) setSelectedId(rest[0]?.id || null);
      return rest;
    });
    setEditingField(null);
    setSelectedId(null);
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

  const openEdit = (field: ExtendedField) => {
    setEditingField({ ...field });
    setSelectedId(field.id);
  };

  const closeEdit = () => {
    if (editingField) {
      setFields(prev => prev.map(f => f.id === editingField.id ? editingField : f));
    }
    setEditingField(null);
  };

  const saveEdit = () => {
    if (editingField) {
      setFields(prev => prev.map(f => f.id === editingField.id ? editingField : f));
    }
    setEditingField(null);
  };

  const handleSave = useCallback(async () => {
    if (!formId) return;
    setSaving(true);
    try {
      await formsApi.update({ id: formId, title, description, fields, status, settings: { bgPreset, submitLabel, thanksTitle, thanksText } });
      setSaved(true);
      showToast("Сохранено ✓");
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [formId, title, description, fields, status, bgPreset, submitLabel, thanksTitle, thanksText]);

  const handlePublish = async () => {
    if (!formId) { showToast("Сначала сохраните форму"); return; }
    if (fields.length === 0) { showToast("Добавьте хотя бы одно поле"); return; }
    setSaving(true);
    try {
      await formsApi.update({ id: formId, title, description, fields, status: "active", settings: { bgPreset, submitLabel, thanksTitle, thanksText } });
      setStatus("active");
      setShareOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formsApi.publicUrl(slug));
    showToast("Ссылка скопирована!");
  };

  const currentBg = BG_PRESETS.find(b => b.id === bgPreset)?.style || BG_PRESETS[0].style;

  const fieldBase = "w-full px-4 py-3 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";

  const renderPreview = (field: ExtendedField) => {
    switch (field.type) {
      case "textarea":
        return <textarea className={`${fieldBase} resize-none`} style={{ height: `${(field.rows || 3) * 28}px` }} placeholder={field.placeholder || "Введите текст..."} />;
      case "select":
        return (
          <select className={`${fieldBase} bg-transparent`}>
            <option value="">Выберите...</option>
            {(field.options || []).map(o => <option key={o}>{o}</option>)}
          </select>
        );
      case "radio":
      case "yesno":
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
      case "nps":
        return (
          <div className="grid grid-cols-11 gap-1.5">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} type="button" className="aspect-square rounded-lg glass text-xs font-semibold text-foreground/60 hover:text-foreground hover:border-primary/40 transition">{n}</button>
            ))}
          </div>
        );
      case "scale":
        return (
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" className="flex-1 py-2 rounded-lg glass text-sm text-foreground/60 hover:text-foreground hover:border-primary/40 transition">{n}</button>
            ))}
          </div>
        );
      case "emoji":
        return (
          <div className="flex items-center gap-3">
            {(field.options || ["😡","😕","😐","🙂","😍"]).map(e => (
              <button key={e} type="button" className="text-3xl opacity-50 hover:opacity-100 hover:scale-110 transition">{e}</button>
            ))}
          </div>
        );
      case "file":
        return (
          <div className={`${fieldBase} flex items-center justify-center gap-2 py-6 border-dashed text-muted-foreground cursor-pointer hover:border-primary/40`}>
            <Icon name="Upload" size={18} />
            <span className="text-sm">Перетащите файл или нажмите для выбора</span>
          </div>
        );
      case "signature":
        return (
          <div className="rounded-xl glass h-28 flex items-center justify-center text-muted-foreground text-sm border-dashed">
            <span className="flex items-center gap-2"><Icon name="Pen" size={14} /> Поле для подписи</span>
          </div>
        );
      case "address":
        return (
          <div className="space-y-2">
            <input className={fieldBase} placeholder="Город" />
            <input className={fieldBase} placeholder="Улица, дом" />
          </div>
        );
      case "color":
        return <input type="color" className="w-16 h-10 rounded-lg cursor-pointer bg-transparent border border-white/15" />;
      case "consent":
        return (
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="w-4 h-4 mt-0.5 rounded border-2 border-white/25 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{field.label}</span>
          </label>
        );
      case "section":
        return (
          <div className="py-2 border-l-2 border-primary/40 pl-3">
            <p className="text-xs text-muted-foreground">Декоративный заголовок раздела</p>
          </div>
        );
      case "date":
        return <input type="date" className={fieldBase} min={field.minDate} max={field.maxDate} />;
      case "time":
        return <input type="time" className={fieldBase} />;
      case "url":
        return <input type="url" className={fieldBase} placeholder={field.placeholder || "https://"} />;
      default:
        return <input
          type={field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
          className={fieldBase}
          placeholder={field.placeholder || "Введите значение..."}
          min={field.type === "number" ? field.minValue : undefined}
          max={field.type === "number" ? field.maxValue : undefined}
        />;
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 border border-white/10 bg-white/5 placeholder:text-foreground/30";
  const labelCls = "block text-xs font-medium text-foreground/50 mb-1.5 uppercase tracking-wider";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium text-white animate-fade-in"
          style={{ background: "rgba(244,81,30,0.95)", backdropFilter: "blur(12px)", boxShadow: "0 8px 24px rgba(244,81,30,0.4)" }}>
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/7 flex-shrink-0"
        style={{ background: "rgba(8,4,2,0.7)", backdropFilter: "blur(12px)" }}>
        <button onClick={onBack} className="p-2 rounded-xl glass text-foreground/50 hover:text-foreground transition flex-shrink-0">
          <Icon name="ArrowLeft" size={16} />
        </button>

        {/* Title with hint */}
        <div className="relative flex-1 min-w-0 group">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            className="w-full bg-transparent text-base font-bold text-foreground focus:outline-none pr-8"
            placeholder="Название формы..."
          />
          {!titleFocused && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none">
              <Icon name="Pencil" size={13} className="text-foreground/30" />
            </div>
          )}
          {titleFocused && (
            <div className="absolute left-0 top-full mt-1.5 z-30 bg-black/80 text-xs text-foreground/60 px-2.5 py-1.5 rounded-lg border border-white/10 whitespace-nowrap pointer-events-none">
              Введите название формы и нажмите Enter или кликните в другое место
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`hidden sm:inline text-xs px-2.5 py-1 rounded-full border font-medium ${
            status === "active" ? "text-green-400 border-green-400/30 bg-green-400/10" :
            status === "paused" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
            "text-foreground/40 border-white/10 bg-white/5"
          }`}>
            {status === "active" ? "Активна" : status === "paused" ? "Пауза" : "Черновик"}
          </span>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition glass text-foreground/50 hover:text-foreground"
            title="Настройки формы"
          >
            <Icon name="Settings2" size={14} />
            <span className="hidden sm:inline">Настройки</span>
          </button>

          {slug && (
            <button onClick={handleCopyLink} className="hidden sm:flex items-center gap-1.5 text-xs glass px-3 py-1.5 rounded-xl text-foreground/50 hover:text-foreground transition">
              <Icon name="Link" size={13} />
              Ссылка
            </button>
          )}
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition glass ${preview ? "text-primary border-primary/30" : "text-foreground/50 hover:text-foreground"}`}
          >
            <Icon name={preview ? "EyeOff" : "Eye"} size={14} />
            <span className="hidden sm:inline">{preview ? "Редактор" : "Просмотр"}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formId}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${saved ? "text-green-400 bg-green-400/10 border border-green-400/30" : "glass text-foreground/60 hover:text-foreground"}`}
          >
            <Icon name={saving ? "Loader2" : saved ? "Check" : "Save"} size={14} className={saving ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{saved ? "Сохранено" : "Сохранить"}</span>
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || !formId}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white gradient-primary hover:opacity-90 transition glow-sm disabled:opacity-60"
          >
            <Icon name="Share2" size={14} />
            <span className="hidden sm:inline">Опубликовать</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left palette */}
        {!preview && (
          <div className="w-52 flex-shrink-0 overflow-y-auto p-3 space-y-4 border-r border-white/6 hidden lg:block"
            style={{ background: "rgba(8,4,2,0.5)" }}>
            {FIELD_GROUPS.map(group => (
              <div key={group.title} className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">{group.title}</p>
                {group.items.map(ft => (
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
            ))}
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-xl mx-auto">
            <div className="rounded-3xl p-6 md:p-8 space-y-5 border border-white/8" style={currentBg}>
              <div className="pb-4 border-b border-white/8">
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>

              {fields.length === 0 && !preview && (
                <div className="text-center py-10 text-muted-foreground">
                  <Icon name="MousePointerClick" size={28} className="mx-auto mb-3 opacity-25" />
                  <p className="text-sm">Добавь поля из панели слева</p>
                  <p className="text-xs mt-1 opacity-50">или нажми + на мобильном</p>
                </div>
              )}

              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  onClick={() => !preview && openEdit(field)}
                  className={`relative group rounded-2xl transition-all ${!preview
                    ? `cursor-pointer p-3 -mx-3 ${selectedId === field.id ? "bg-primary/8 ring-1 ring-primary/25" : "hover:bg-white/3"}`
                    : ""}`}
                >
                  {!preview && (
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                      <button onClick={e => { e.stopPropagation(); moveField(field.id, -1); }} disabled={idx === 0}
                        className="w-6 h-6 rounded-lg glass flex items-center justify-center text-foreground/40 hover:text-foreground disabled:opacity-20 transition">
                        <Icon name="ChevronUp" size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); moveField(field.id, 1); }} disabled={idx === fields.length - 1}
                        className="w-6 h-6 rounded-lg glass flex items-center justify-center text-foreground/40 hover:text-foreground disabled:opacity-20 transition">
                        <Icon name="ChevronDown" size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); openEdit(field); }}
                        className="w-6 h-6 rounded-lg glass flex items-center justify-center text-foreground/40 hover:text-primary transition">
                        <Icon name="Settings2" size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteField(field.id); }}
                        className="w-6 h-6 rounded-lg glass flex items-center justify-center text-foreground/40 hover:text-red-400 transition">
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  )}
                  {field.type !== "consent" && field.type !== "section" && (
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      {field.label}
                      {field.required && <span className="text-primary ml-1">*</span>}
                    </label>
                  )}
                  {field.description && field.type !== "section" && (
                    <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
                  )}
                  {renderPreview(field)}
                  {field.type !== "section" && field.showCharCount && field.maxLength && (
                    <p className="text-[10px] text-foreground/30 mt-1 text-right">0 / {field.maxLength}</p>
                  )}
                </div>
              ))}

              <div className="pt-2 space-y-3">
                <button className="w-full py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition glow-sm">
                  {submitLabel}
                </button>

                {/* Thanks screen preview */}
                {!preview && (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-center">
                    <p className="text-[10px] text-foreground/30 uppercase tracking-wider mb-2">Экран после отправки</p>
                    <p className="text-sm font-semibold text-foreground/60">{thanksTitle}</p>
                    <p className="text-xs text-foreground/35 mt-1">{thanksText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      {!preview && (
        <button
          onClick={() => setShowPalette(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg glow-orange"
        >
          <Icon name="Plus" size={24} />
        </button>
      )}

      {/* Mobile palette drawer */}
      {showPalette && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" onClick={() => setShowPalette(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto animate-slide-up"
            style={{ background: "rgba(12,6,2,0.97)", borderTop: "1px solid rgba(244,81,30,0.25)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-base font-bold text-foreground">Добавить поле</h3>
              <button onClick={() => setShowPalette(false)} className="p-2 rounded-xl glass text-foreground/60">
                <Icon name="X" size={16} />
              </button>
            </div>
            {FIELD_GROUPS.map(group => (
              <div key={group.title} className="mb-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">{group.title}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map(ft => (
                    <button
                      key={ft.type}
                      onClick={() => addField(ft.type)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass text-xs text-foreground/80 hover:text-foreground transition text-left"
                    >
                      <Icon name={ft.icon} fallback="Circle" size={14} className={ft.color} />
                      <span className="truncate">{ft.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Field editor modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeEdit}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl animate-scale-in"
            style={{ background: "rgba(12,6,2,0.98)", border: "1px solid rgba(244,81,30,0.2)", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 sticky top-0 z-10"
              style={{ background: "rgba(12,6,2,0.98)" }}>
              <div className="flex items-center gap-2.5">
                {(() => {
                  const ft = FIELD_TYPES.find(f => f.type === editingField.type);
                  return ft ? <Icon name={ft.icon} fallback="Circle" size={16} className={ft.color} /> : null;
                })()}
                <h3 className="text-sm font-bold text-foreground">
                  {FIELD_TYPES.find(f => f.type === editingField.type)?.label || "Настройки поля"}
                </h3>
              </div>
              <button onClick={closeEdit} className="p-1.5 rounded-xl glass text-foreground/40 hover:text-foreground transition">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Label */}
              {editingField.type !== "section" && (
                <div>
                  <label className={labelCls}>Вопрос / Подпись</label>
                  <input
                    value={editingField.label}
                    onChange={e => setEditingField(p => p ? { ...p, label: e.target.value } : p)}
                    className={inputCls}
                    placeholder="Введите вопрос..."
                  />
                </div>
              )}

              {/* Section title */}
              {editingField.type === "section" && (
                <div>
                  <label className={labelCls}>Заголовок раздела</label>
                  <input
                    value={editingField.label}
                    onChange={e => setEditingField(p => p ? { ...p, label: e.target.value } : p)}
                    className={inputCls}
                    placeholder="Название раздела..."
                  />
                </div>
              )}

              {/* Description */}
              {editingField.type !== "section" && (
                <div>
                  <label className={labelCls}>Описание / Пояснение</label>
                  <textarea
                    value={editingField.description || ""}
                    onChange={e => setEditingField(p => p ? { ...p, description: e.target.value } : p)}
                    className={`${inputCls} resize-none h-16`}
                    placeholder="Дополнительное пояснение для пользователя..."
                  />
                </div>
              )}

              {/* Placeholder */}
              {["text","textarea","email","phone","number","url","address"].includes(editingField.type) && (
                <div>
                  <label className={labelCls}>Подсказка внутри поля</label>
                  <input
                    value={editingField.placeholder || ""}
                    onChange={e => setEditingField(p => p ? { ...p, placeholder: e.target.value } : p)}
                    className={inputCls}
                    placeholder="placeholder..."
                  />
                </div>
              )}

              {/* Options */}
              {["select","radio","checkbox","yesno","emoji"].includes(editingField.type) && (
                <div>
                  <label className={labelCls}>Варианты — каждый с новой строки</label>
                  <textarea
                    value={(editingField.options || []).join("\n")}
                    onChange={e => setEditingField(p => p ? { ...p, options: e.target.value.split("\n") } : p)}
                    className={`${inputCls} resize-none h-28`}
                    placeholder={"Вариант 1\nВариант 2\nВариант 3"}
                  />
                </div>
              )}

              {/* Rows for textarea */}
              {editingField.type === "textarea" && (
                <div>
                  <label className={labelCls}>Высота поля (строк): {editingField.rows || 3}</label>
                  <input
                    type="range" min={2} max={10}
                    value={editingField.rows || 3}
                    onChange={e => setEditingField(p => p ? { ...p, rows: +e.target.value } : p)}
                    className="w-full accent-primary"
                  />
                </div>
              )}

              {/* --- Validation section --- */}
              <div className="border-t border-white/8 pt-5">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-4">Валидация</p>

                {/* Required */}
                {editingField.type !== "section" && (
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-foreground">Обязательное поле</p>
                      <p className="text-xs text-foreground/40">Нельзя отправить форму без ответа</p>
                    </div>
                    <button
                      onClick={() => setEditingField(p => p ? { ...p, required: !p.required } : p)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${editingField.required ? "bg-primary" : "bg-white/15"}`}
                      style={{ minWidth: 40, height: 22 }}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${editingField.required ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                )}

                {/* Min/Max length for text */}
                {["text","textarea","email","url","phone"].includes(editingField.type) && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className={labelCls}>Мин. символов</label>
                      <input
                        type="number" min={0}
                        value={editingField.minLength || ""}
                        onChange={e => setEditingField(p => p ? { ...p, minLength: e.target.value ? +e.target.value : undefined } : p)}
                        className={inputCls}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Макс. символов</label>
                      <input
                        type="number" min={0}
                        value={editingField.maxLength || ""}
                        onChange={e => setEditingField(p => p ? { ...p, maxLength: e.target.value ? +e.target.value : undefined } : p)}
                        className={inputCls}
                        placeholder="∞"
                      />
                    </div>
                  </div>
                )}

                {/* Show char count */}
                {["text","textarea"].includes(editingField.type) && editingField.maxLength && (
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-foreground">Счётчик символов</p>
                      <p className="text-xs text-foreground/40">Показывать «0 / {editingField.maxLength}»</p>
                    </div>
                    <button
                      onClick={() => setEditingField(p => p ? { ...p, showCharCount: !p.showCharCount } : p)}
                      className={`relative flex-shrink-0 rounded-full transition-colors ${editingField.showCharCount ? "bg-primary" : "bg-white/15"}`}
                      style={{ minWidth: 40, height: 22 }}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${editingField.showCharCount ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                )}

                {/* Min/Max for number */}
                {editingField.type === "number" && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className={labelCls}>Минимум</label>
                      <input
                        type="number"
                        value={editingField.minValue ?? ""}
                        onChange={e => setEditingField(p => p ? { ...p, minValue: e.target.value ? +e.target.value : undefined } : p)}
                        className={inputCls}
                        placeholder="—"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Максимум</label>
                      <input
                        type="number"
                        value={editingField.maxValue ?? ""}
                        onChange={e => setEditingField(p => p ? { ...p, maxValue: e.target.value ? +e.target.value : undefined } : p)}
                        className={inputCls}
                        placeholder="—"
                      />
                    </div>
                  </div>
                )}

                {/* Min/Max date */}
                {editingField.type === "date" && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className={labelCls}>Дата от</label>
                      <input
                        type="date"
                        value={editingField.minDate || ""}
                        onChange={e => setEditingField(p => p ? { ...p, minDate: e.target.value } : p)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Дата до</label>
                      <input
                        type="date"
                        value={editingField.maxDate || ""}
                        onChange={e => setEditingField(p => p ? { ...p, maxDate: e.target.value } : p)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}

                {/* File settings */}
                {editingField.type === "file" && (
                  <>
                    <div className="mb-4">
                      <label className={labelCls}>Допустимые типы файлов</label>
                      <input
                        value={editingField.acceptedTypes || ""}
                        onChange={e => setEditingField(p => p ? { ...p, acceptedTypes: e.target.value } : p)}
                        className={inputCls}
                        placeholder="image/*, .pdf, .docx"
                      />
                      <p className="text-[10px] text-foreground/30 mt-1">Через запятую: image/*, .pdf, .docx</p>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-foreground">Несколько файлов</p>
                        <p className="text-xs text-foreground/40">Разрешить загрузку нескольких файлов</p>
                      </div>
                      <button
                        onClick={() => setEditingField(p => p ? { ...p, allowMultiple: !p.allowMultiple } : p)}
                        className={`relative flex-shrink-0 rounded-full transition-colors ${editingField.allowMultiple ? "bg-primary" : "bg-white/15"}`}
                        style={{ minWidth: 40, height: 22 }}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${editingField.allowMultiple ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </>
                )}

                {/* Regex pattern */}
                {["text","email","phone","url"].includes(editingField.type) && (
                  <div className="mb-4">
                    <label className={labelCls}>Регулярное выражение (regex)</label>
                    <input
                      value={editingField.pattern || ""}
                      onChange={e => setEditingField(p => p ? { ...p, pattern: e.target.value } : p)}
                      className={inputCls}
                      placeholder="^[a-zA-Z]+$"
                    />
                    <p className="text-[10px] text-foreground/30 mt-1">Оставьте пустым если не нужно</p>
                  </div>
                )}

                {/* Custom error */}
                {editingField.type !== "section" && (
                  <div>
                    <label className={labelCls}>Сообщение об ошибке</label>
                    <input
                      value={editingField.errorMessage || ""}
                      onChange={e => setEditingField(p => p ? { ...p, errorMessage: e.target.value } : p)}
                      className={inputCls}
                      placeholder="Это поле заполнено неверно"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t border-white/8 flex items-center justify-between gap-3"
              style={{ background: "rgba(12,6,2,0.98)" }}>
              <button
                onClick={() => { deleteField(editingField.id); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 transition"
              >
                <Icon name="Trash2" size={13} />
                Удалить поле
              </button>
              <button
                onClick={saveEdit}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition"
              >
                <Icon name="Check" size={14} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSettingsOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl animate-scale-in"
            style={{ background: "rgba(12,6,2,0.98)", border: "1px solid rgba(244,81,30,0.2)", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h3 className="text-sm font-bold text-foreground">Настройки формы</h3>
              <button onClick={() => setSettingsOpen(false)} className="p-1.5 rounded-xl glass text-foreground/40 hover:text-foreground transition">
                <Icon name="X" size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4">
              {(["design","form","submit"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${settingsTab === tab ? "bg-primary/20 text-primary border border-primary/30" : "text-foreground/40 hover:text-foreground"}`}
                >
                  {tab === "design" ? "Дизайн" : tab === "form" ? "Форма" : "Отправка"}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5">
              {settingsTab === "design" && (
                <>
                  <div>
                    <label className={labelCls}>Фон формы</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {BG_PRESETS.map(bg => (
                        <button
                          key={bg.id}
                          onClick={() => setBgPreset(bg.id)}
                          className={`relative h-14 rounded-xl overflow-hidden border-2 transition ${bgPreset === bg.id ? "border-primary" : "border-white/10 hover:border-white/30"}`}
                          style={bg.style}
                          title={bg.label}
                        >
                          {bgPreset === bg.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Icon name="Check" size={16} className="text-white drop-shadow" />
                            </div>
                          )}
                          <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white/70">{bg.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {settingsTab === "submit" && (
                <>
                  <div>
                    <label className={labelCls}>Текст кнопки отправки</label>
                    <input
                      value={submitLabel}
                      onChange={e => setSubmitLabel(e.target.value)}
                      className={inputCls}
                      placeholder="Отправить"
                    />
                  </div>

                  <div className="border-t border-white/8 pt-5">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-4">Экран благодарности</p>
                    <p className="text-xs text-foreground/40 mb-4">Показывается после успешной отправки формы</p>
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Заголовок</label>
                        <input
                          value={thanksTitle}
                          onChange={e => setThanksTitle(e.target.value)}
                          className={inputCls}
                          placeholder="Спасибо за ответ!"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Сообщение</label>
                        <textarea
                          value={thanksText}
                          onChange={e => setThanksText(e.target.value)}
                          className={`${inputCls} resize-none h-20`}
                          placeholder="Мы получили вашу форму и скоро свяжемся с вами."
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-4 rounded-2xl p-5 text-center border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="w-10 h-10 rounded-full bg-green-400/15 flex items-center justify-center mx-auto mb-3">
                        <Icon name="Check" size={20} className="text-green-400" />
                      </div>
                      <p className="text-sm font-bold text-foreground">{thanksTitle}</p>
                      <p className="text-xs text-foreground/50 mt-1.5">{thanksText}</p>
                    </div>
                  </div>
                </>
              )}

              {settingsTab === "form" && (
                <>
                  <div>
                    <label className={labelCls}>Название формы</label>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className={inputCls}
                      placeholder="Название формы..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Описание формы</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className={`${inputCls} resize-none h-20`}
                      placeholder="Опишите, зачем эта форма..."
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Статус</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as Form["status"])}
                      className={`${inputCls} bg-black/30`}
                    >
                      <option value="draft">Черновик</option>
                      <option value="active">Активна</option>
                      <option value="paused">Пауза</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal
        open={shareOpen}
        url={formsApi.publicUrl(slug)}
        title={title}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}