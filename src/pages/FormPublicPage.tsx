import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { formsApi, responsesApi, uploadApi, type Form, type FormField } from "@/lib/api";

interface FormPublicPageProps {
  slug: string;
}

export default function FormPublicPage({ slug }: FormPublicPageProps) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    formsApi.getBySlug(slug).then(data => {
      if (!data) { setNotFound(true); } else { setForm(data); }
    }).finally(() => setLoading(false));
  }, [slug]);

  const setValue = (id: string, val: string) => {
    setValues(prev => ({ ...prev, [id]: val }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: "" }));
  };

  const validate = (fields: FormField[]) => {
    const errs: Record<string, string> = {};
    fields.forEach(f => {
      if (f.type === "section") return;
      const v = (values[f.id] || "").toString().trim();
      if (f.required && !v) {
        errs[f.id] = f.type === "consent" ? "Нужно подтвердить согласие" : "Обязательное поле";
      }
      if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        errs[f.id] = "Некорректный email";
      }
      if (f.type === "url" && v && !/^https?:\/\/.+/.test(v)) {
        errs[f.id] = "Ссылка должна начинаться с http:// или https://";
      }
      if (f.type === "consent" && f.required && v !== "true") {
        errs[f.id] = "Нужно подтвердить согласие";
      }
    });
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const fields = (form.fields || []) as FormField[];
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    const data: Record<string, string> = {};
    fields.forEach(f => {
      if (f.type === "section") return;
      data[f.label] = values[f.id] || "";
    });
    const emailField = fields.find(f => f.type === "email");
    const nameField = fields.find(f => f.type === "text" && f.label.toLowerCase().includes("им"));
    const email = emailField ? values[emailField.id] : "";
    const name = nameField ? values[nameField.id] : "";

    try {
      await responsesApi.submit(form.id, data, name, email);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const base = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

  const renderField = (field: FormField) => {
    const val = values[field.id] || "";
    const err = errors[field.id];
    const errCls = err ? "ring-1 ring-red-400/50" : "";

    switch (field.type) {
      case "textarea":
        return <textarea className={`${base} ${errCls} h-28 resize-none`} style={inputStyle} value={val}
          onChange={e => setValue(field.id, e.target.value)} placeholder={field.placeholder || ""} />;
      case "select":
        return (
          <select className={`${base} ${errCls} bg-transparent`} style={inputStyle} value={val}
            onChange={e => setValue(field.id, e.target.value)}>
            <option value="">Выберите...</option>
            {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case "radio":
        return (
          <div className="space-y-2.5">
            {(field.options || []).map(o => (
              <label key={o} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${val === o ? "border-primary bg-primary" : "border-white/25"}`}>
                  {val === o && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-sm text-foreground" onClick={() => setValue(field.id, o)}>{o}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2.5">
            {(field.options || []).map(o => {
              const checked = val.split(",").filter(Boolean).includes(o);
              const toggle = () => {
                const arr = val.split(",").filter(Boolean);
                const next = checked ? arr.filter(x => x !== o) : [...arr, o];
                setValue(field.id, next.join(","));
              };
              return (
                <label key={o} className="flex items-center gap-3 cursor-pointer" onClick={toggle}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${checked ? "border-primary bg-primary" : "border-white/25"}`}>
                    {checked && <Icon name="Check" size={10} className="text-white" />}
                  </div>
                  <span className="text-sm text-foreground">{o}</span>
                </label>
              );
            })}
          </div>
        );
      case "rating":
        return (
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setValue(field.id, String(n))}
                className={`text-2xl transition ${Number(val) >= n ? "text-amber-400" : "text-white/20 hover:text-amber-400/60"}`}>
                ★
              </button>
            ))}
          </div>
        );
      case "nps":
        return (
          <div className="grid grid-cols-11 gap-1.5">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} type="button" onClick={() => setValue(field.id, String(n))}
                className={`aspect-square rounded-lg text-xs font-semibold transition ${
                  String(n) === val
                    ? "bg-primary text-white border border-primary"
                    : "glass text-foreground/60 hover:text-foreground hover:border-primary/40"
                }`}>
                {n}
              </button>
            ))}
          </div>
        );
      case "scale":
        return (
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setValue(field.id, String(n))}
                className={`flex-1 py-2 rounded-lg text-sm transition ${
                  String(n) === val
                    ? "bg-primary text-white border border-primary"
                    : "glass text-foreground/60 hover:text-foreground hover:border-primary/40"
                }`}>
                {n}
              </button>
            ))}
          </div>
        );
      case "emoji": {
        const emojiOptions = field.options && field.options.length > 0 ? field.options : ["😡","😕","😐","🙂","😍"];
        return (
          <div className="flex items-center gap-3">
            {emojiOptions.map(e => (
              <button key={e} type="button" onClick={() => setValue(field.id, e)}
                className={`text-3xl transition ${val === e ? "opacity-100 scale-110" : "opacity-50 hover:opacity-100 hover:scale-110"}`}>
                {e}
              </button>
            ))}
          </div>
        );
      }
      case "yesno": {
        const yesNoOptions = field.options && field.options.length > 0 ? field.options : ["Да","Нет"];
        return (
          <div className="flex gap-2">
            {yesNoOptions.map(o => (
              <button key={o} type="button" onClick={() => setValue(field.id, o)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  val === o
                    ? "bg-primary text-white border border-primary"
                    : "glass text-foreground/60 hover:text-foreground"
                }`}>
                {o}
              </button>
            ))}
          </div>
        );
      }
      case "file": {
        const isUploading = uploading[field.id];
        const isUploaded = val && val.startsWith("http");
        return (
          <label className={`${base} ${errCls} flex flex-col items-center justify-center gap-2 py-5 cursor-pointer hover:border-primary/40 transition ${isUploading ? "opacity-70 pointer-events-none" : ""}`} style={inputStyle}>
            {isUploading
              ? <Icon name="Loader2" size={20} className="animate-spin text-primary" />
              : isUploaded
                ? <Icon name="CheckCircle" size={20} className="text-green-400" />
                : <Icon name="Upload" size={20} className="text-muted-foreground" />}
            <span className="text-sm text-center">
              {isUploading
                ? "Загружаю файл..."
                : isUploaded
                  ? <span className="text-green-400">Файл загружен ✓</span>
                  : "Нажмите, чтобы выбрать файл"}
            </span>
            {isUploaded && (
              <a href={val} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary underline"
                onClick={e => e.stopPropagation()}>
                Открыть файл
              </a>
            )}
            <input type="file" className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(prev => ({ ...prev, [field.id]: true }));
                setErrors(prev => ({ ...prev, [field.id]: "" }));
                try {
                  const result = await uploadApi.uploadFile(file);
                  if (result.ok && result.url) {
                    setValue(field.id, result.url);
                  } else {
                    setErrors(prev => ({ ...prev, [field.id]: "Ошибка загрузки файла" }));
                  }
                } catch {
                  setErrors(prev => ({ ...prev, [field.id]: "Ошибка загрузки файла" }));
                } finally {
                  setUploading(prev => ({ ...prev, [field.id]: false }));
                }
              }}
            />
          </label>
        );
      }
      case "signature":
        return (
          <div className="rounded-xl border-dashed flex items-center justify-center h-28 text-muted-foreground text-sm" style={inputStyle}>
            <input
              className="w-full h-full bg-transparent text-center focus:outline-none italic"
              style={{ fontFamily: "'Brush Script MT', cursive" }}
              placeholder="Подпишите здесь..."
              value={val}
              onChange={e => setValue(field.id, e.target.value)}
            />
          </div>
        );
      case "address": {
        const parts = val ? val.split(" | ") : ["", ""];
        const updatePart = (idx: number, v: string) => {
          const arr = [...parts];
          arr[idx] = v;
          setValue(field.id, arr.join(" | "));
        };
        return (
          <div className="space-y-2">
            <input className={`${base} ${errCls}`} style={inputStyle} value={parts[0] || ""} onChange={e => updatePart(0, e.target.value)} placeholder="Город" />
            <input className={`${base} ${errCls}`} style={inputStyle} value={parts[1] || ""} onChange={e => updatePart(1, e.target.value)} placeholder="Улица, дом, квартира" />
          </div>
        );
      }
      case "color":
        return (
          <div className="flex items-center gap-3">
            <input type="color" value={val || "#fc3f1d"} onChange={e => setValue(field.id, e.target.value)}
              className="w-14 h-10 rounded-lg cursor-pointer bg-transparent border border-white/15" />
            <span className="text-sm text-muted-foreground">{val || "не выбрано"}</span>
          </div>
        );
      case "consent":
        return (
          <label className="flex items-start gap-3 cursor-pointer" onClick={() => setValue(field.id, val === "true" ? "" : "true")}>
            <div className={`w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${val === "true" ? "border-primary bg-primary" : "border-white/25"}`}>
              {val === "true" && <Icon name="Check" size={10} className="text-white" />}
            </div>
            <span className="text-sm text-foreground">{field.placeholder || "Согласен"}</span>
          </label>
        );
      case "section":
        return null;
      case "date":
        return <input type="date" className={`${base} ${errCls}`} style={inputStyle} value={val}
          onChange={e => setValue(field.id, e.target.value)} />;
      case "time":
        return <input type="time" className={`${base} ${errCls}`} style={inputStyle} value={val}
          onChange={e => setValue(field.id, e.target.value)} />;
      case "url":
        return <input type="url" className={`${base} ${errCls}`} style={inputStyle} value={val}
          onChange={e => setValue(field.id, e.target.value)} placeholder={field.placeholder || "https://"} />;
      default:
        return <input
          type={field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
          className={`${base} ${errCls}`}
          style={inputStyle}
          value={val}
          onChange={e => setValue(field.id, e.target.value)}
          placeholder={field.placeholder || ""}
        />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(15,12%,5%)" }}>
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: "hsl(15,12%,5%)" }}>
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-foreground mb-2">Форма не найдена</h2>
        <p className="text-muted-foreground text-sm">Возможно, ссылка устарела или форма была удалена</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: "hsl(15,12%,5%)" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(244,81,30,0.1) 0%, transparent 60%)" }} />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <img
            src="https://cdn.poehali.dev/projects/267e080f-eff8-4afa-95f4-c72c1b12bd16/bucket/398999e0-d058-4e86-ae0c-96d1a6895ef3.png"
            alt="Формус"
            className="w-8 h-8 rounded-xl"
            style={{ boxShadow: "0 0 14px rgba(244,81,30,0.4)" }}
          />
          <span className="text-sm font-semibold text-foreground/50">Формус</span>
        </div>

        {submitted ? (
          <div className="glass rounded-3xl p-10 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-5 glow-orange">
              <Icon name="Check" size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Спасибо!</h2>
            <p className="text-muted-foreground text-sm">Ваш ответ успешно отправлен</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-6">
            <div className="border-b border-white/8 pb-5">
              <h1 className="text-2xl font-bold text-foreground">{form.title}</h1>
              {form.description && <p className="text-sm text-muted-foreground mt-2">{form.description}</p>}
            </div>

            {(form.fields as FormField[] || []).map(field => {
              if (field.type === "section") {
                return (
                  <div key={field.id} className="pt-3 border-l-2 border-primary/40 pl-3">
                    <h3 className="text-base font-semibold text-foreground">{field.label}</h3>
                    {field.placeholder && <p className="text-xs text-muted-foreground mt-0.5">{field.placeholder}</p>}
                  </div>
                );
              }
              if (field.type === "consent") {
                return (
                  <div key={field.id}>
                    {renderField(field)}
                    {errors[field.id] && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <Icon name="AlertCircle" size={12} />
                        {errors[field.id]}
                      </p>
                    )}
                  </div>
                );
              }
              return (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {field.label}
                    {field.required && <span className="text-primary ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.id] && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} />
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition glow-orange disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Icon name="Loader2" size={16} className="animate-spin" />}
              Отправить
            </button>
          </form>
        )}
      </div>
    </div>
  );
}