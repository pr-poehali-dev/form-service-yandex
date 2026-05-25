import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { formsApi, responsesApi, type Form, type FormField } from "@/lib/api";

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
      if (f.required && !values[f.id]?.trim()) {
        errs[f.id] = "Обязательное поле";
      }
      if (f.type === "email" && values[f.id] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.id])) {
        errs[f.id] = "Некорректный email";
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
    fields.forEach(f => { data[f.label] = values[f.id] || ""; });
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
      case "date":
        return <input type="date" className={`${base} ${errCls}`} style={inputStyle} value={val}
          onChange={e => setValue(field.id, e.target.value)} />;
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

            {(form.fields as FormField[] || []).map(field => (
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
            ))}

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