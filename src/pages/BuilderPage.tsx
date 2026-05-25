import { useState } from "react";
import Icon from "@/components/ui/icon";

const FIELD_TYPES = [
  { type: "text", label: "Короткий текст", icon: "Type", color: "text-blue-400" },
  { type: "textarea", label: "Длинный текст", icon: "AlignLeft", color: "text-indigo-400" },
  { type: "email", label: "Email", icon: "Mail", color: "text-purple-400" },
  { type: "phone", label: "Телефон", icon: "Phone", color: "text-pink-400" },
  { type: "number", label: "Число", icon: "Hash", color: "text-orange-400" },
  { type: "select", label: "Выпадающий список", icon: "ChevronDown", color: "text-yellow-400" },
  { type: "radio", label: "Один из вариантов", icon: "CircleDot", color: "text-green-400" },
  { type: "checkbox", label: "Несколько вариантов", icon: "CheckSquare", color: "text-teal-400" },
  { type: "date", label: "Дата", icon: "Calendar", color: "text-cyan-400" },
  { type: "rating", label: "Рейтинг", icon: "Star", color: "text-amber-400" },
  { type: "file", label: "Загрузка файла", icon: "Upload", color: "text-rose-400" },
  { type: "divider", label: "Разделитель", icon: "Minus", color: "text-gray-400" },
];

interface Field {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

let idCounter = 1;

export default function BuilderPage() {
  const [fields, setFields] = useState<Field[]>([
    { id: "f1", type: "text", label: "Имя", required: true, placeholder: "Введите ваше имя" },
    { id: "f2", type: "email", label: "Email", required: true, placeholder: "example@mail.ru" },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>("f1");
  const [formTitle, setFormTitle] = useState("Новая форма");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const selectedField = fields.find((f) => f.id === selectedId) || null;

  const addField = (type: string) => {
    const ft = FIELD_TYPES.find((f) => f.type === type);
    const newField: Field = {
      id: `f${++idCounter}`,
      type,
      label: ft?.label || "Новое поле",
      required: false,
      placeholder: "",
    };
    setFields((prev) => [...prev, newField]);
    setSelectedId(newField.id);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteField = (id: string) => {
    setFields((prev) => {
      const remaining = prev.filter((f) => f.id !== id);
      if (selectedId === id) setSelectedId(remaining[0]?.id || null);
      return remaining;
    });
  };

  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    setFields((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((f) => f.id === draggingId);
      const toIdx = arr.findIndex((f) => f.id === targetId);
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    setDraggingId(null);
    setDragOverId(null);
  };

  const renderFieldPreview = (field: Field) => {
    const base = "w-full px-4 py-3 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";
    switch (field.type) {
      case "textarea":
        return <textarea className={`${base} h-24 resize-none`} placeholder={field.placeholder || "Введите текст..."} />;
      case "select":
        return (
          <select className={`${base} appearance-none`}>
            <option>Выберите вариант...</option>
            <option>Вариант 1</option>
            <option>Вариант 2</option>
          </select>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {["Вариант 1", "Вариант 2", "Вариант 3"].map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                <div className="w-4 h-4 rounded-full border-2 border-white/30 group-hover:border-primary transition" />
                <span className="text-sm text-muted-foreground">{opt}</span>
              </label>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {["Вариант 1", "Вариант 2", "Вариант 3"].map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                <div className="w-4 h-4 rounded border-2 border-white/30 group-hover:border-primary transition" />
                <span className="text-sm text-muted-foreground">{opt}</span>
              </label>
            ))}
          </div>
        );
      case "rating":
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className="text-2xl text-white/20 hover:text-amber-400 transition">★</button>
            ))}
          </div>
        );
      case "date":
        return <input type="date" className={base} />;
      case "file":
        return (
          <div className="w-full h-20 rounded-xl border-2 border-dashed border-white/15 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary/40 transition cursor-pointer">
            <Icon name="Upload" size={16} />
            Перетащи файл или нажми
          </div>
        );
      case "divider":
        return <div className="w-full h-px bg-white/10" />;
      default:
        return <input type={field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text"} className={base} placeholder={field.placeholder || "Введите значение..."} />;
    }
  };

  return (
    <div className="h-[calc(100vh-61px)] flex gap-4 px-8 md:px-14 py-6 overflow-hidden">
      {/* Left: field palette */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-2 overflow-y-auto hidden lg:flex">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-1">
          Элементы
        </div>
        {FIELD_TYPES.map((ft) => (
          <button
            key={ft.type}
            onClick={() => addField(ft.type)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all group text-left"
          >
            <Icon name={ft.icon} fallback="Circle" size={16} className={ft.color} />
            <span className="text-xs">{ft.label}</span>
            <Icon name="Plus" size={13} className="ml-auto opacity-0 group-hover:opacity-100 transition text-primary" />
          </button>
        ))}
      </div>

      {/* Center: canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="flex-1 bg-transparent text-lg font-bold text-foreground focus:outline-none border-b border-transparent focus:border-primary/40 transition pb-0.5"
          />
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
              previewMode ? "bg-primary/20 text-primary border border-primary/30" : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name={previewMode ? "EyeOff" : "Eye"} size={15} />
            {previewMode ? "Редактор" : "Предпросмотр"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition neon-glow">
            <Icon name="Share2" size={15} />
            Опубликовать
          </button>
        </div>

        {/* Form canvas */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <div className="glass rounded-3xl p-8 space-y-5">
              {/* Form header */}
              <div className="pb-4 border-b border-white/8">
                <h2 className="text-xl font-bold text-foreground">{formTitle}</h2>
                <p className="text-sm text-muted-foreground mt-1">Заполните форму ниже</p>
              </div>

              {/* Fields */}
              {fields.map((field) => (
                <div
                  key={field.id}
                  draggable={!previewMode}
                  onDragStart={() => handleDragStart(field.id)}
                  onDragOver={(e) => handleDragOver(e, field.id)}
                  onDrop={() => handleDrop(field.id)}
                  onClick={() => !previewMode && setSelectedId(field.id)}
                  className={`relative group rounded-2xl transition-all ${
                    previewMode
                      ? ""
                      : `cursor-pointer p-3 -mx-3 ${
                          selectedId === field.id
                            ? "bg-primary/8 ring-1 ring-primary/30"
                            : "hover:bg-white/3"
                        } ${dragOverId === field.id ? "ring-1 ring-neon-cyan/50 bg-neon-cyan/5" : ""}`
                  }`}
                >
                  {!previewMode && (
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition">
                      <Icon name="GripVertical" size={16} className="text-muted-foreground cursor-grab" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">
                      {field.label}
                      {field.required && <span className="text-neon-pink ml-1">*</span>}
                    </label>
                    {!previewMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                      >
                        <Icon name="Trash2" size={13} />
                      </button>
                    )}
                  </div>
                  {renderFieldPreview(field)}
                </div>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="MousePointerClick" size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Добавь элементы из панели слева</p>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <button className="w-full py-3 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition neon-glow">
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: properties panel */}
      {!previewMode && (
        <div className="w-60 flex-shrink-0 hidden xl:flex flex-col gap-3 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-1">
            Свойства поля
          </div>

          {selectedField ? (
            <div className="glass rounded-2xl p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Подпись</label>
                <input
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Подсказка</label>
                <input
                  value={selectedField.placeholder || ""}
                  onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="Placeholder..."
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Обязательное</label>
                <button
                  onClick={() => updateField(selectedField.id, { required: !selectedField.required })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    selectedField.required ? "bg-primary" : "bg-white/15"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      selectedField.required ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={() => deleteField(selectedField.id)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition"
              >
                <Icon name="Trash2" size={13} />
                Удалить поле
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 text-center text-muted-foreground">
              <Icon name="MousePointerClick" size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">Выбери поле для настройки</p>
            </div>
          )}

          {/* Form settings */}
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mt-2 mb-1">
            Настройки формы
          </div>
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Прогресс-бар</span>
              <button className="relative w-8 h-4 rounded-full bg-white/15">
                <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Одна страница</span>
              <button className="relative w-8 h-4 rounded-full bg-primary">
                <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Капча</span>
              <button className="relative w-8 h-4 rounded-full bg-white/15">
                <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}