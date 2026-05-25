import { useState } from "react";
import Icon from "@/components/ui/icon";

const FORMS = [
  "Обратная связь о продукте",
  "Регистрация на мероприятие",
  "Опрос удовлетворённости",
];

const RESPONSES = [
  {
    id: 1,
    form: "Обратная связь о продукте",
    name: "Александра Петрова",
    email: "alex@example.com",
    date: "25.05.2026 14:32",
    rating: 5,
    data: { "Имя": "Александра Петрова", "Email": "alex@example.com", "Оценка": "★★★★★", "Комментарий": "Отличный продукт, очень удобно!" },
  },
  {
    id: 2,
    form: "Обратная связь о продукте",
    name: "Михаил Орлов",
    email: "m.orlov@mail.ru",
    date: "25.05.2026 11:15",
    rating: 4,
    data: { "Имя": "Михаил Орлов", "Email": "m.orlov@mail.ru", "Оценка": "★★★★☆", "Комментарий": "Нравится, но хочется больше интеграций." },
  },
  {
    id: 3,
    form: "Регистрация на мероприятие",
    name: "Екатерина Новикова",
    email: "kate@gmail.com",
    date: "24.05.2026 18:00",
    rating: 5,
    data: { "Имя": "Екатерина Новикова", "Email": "kate@gmail.com", "Телефон": "+7 900 123-45-67", "Участие": "Онлайн" },
  },
  {
    id: 4,
    form: "Опрос удовлетворённости",
    name: "Дмитрий Соколов",
    email: "dsokolov@corp.ru",
    date: "24.05.2026 09:45",
    rating: 3,
    data: { "Имя": "Дмитрий Соколов", "Email": "dsokolov@corp.ru", "Оценка": "★★★☆☆", "Что улучшить": "Добавить тёмную тему" },
  },
  {
    id: 5,
    form: "Обратная связь о продукте",
    name: "Ирина Васильева",
    email: "irina.v@yandex.ru",
    date: "23.05.2026 16:22",
    rating: 5,
    data: { "Имя": "Ирина Васильева", "Email": "irina.v@yandex.ru", "Оценка": "★★★★★", "Комментарий": "Лучший конструктор форм!" },
  },
];

const STARS = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default function ResponsesPage() {
  const [selectedForm, setSelectedForm] = useState("all");
  const [selectedResponse, setSelectedResponse] = useState<typeof RESPONSES[0] | null>(null);
  const [search, setSearch] = useState("");

  const filtered = RESPONSES.filter((r) => {
    const matchForm = selectedForm === "all" || r.form === selectedForm;
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    return matchForm && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl px-8 md:px-14 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ответы</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} ответов найдено</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass text-muted-foreground hover:text-foreground transition">
            <Icon name="Download" size={15} className="text-neon-cyan" />
            CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass text-muted-foreground hover:text-foreground transition">
            <Icon name="FileSpreadsheet" size={15} className="text-neon-cyan" />
            Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium glass text-muted-foreground hover:text-foreground transition">
            <Icon name="FileText" size={15} className="text-neon-pink" />
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          className="px-4 py-2.5 rounded-xl glass text-sm text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-primary/50"
        >
          <option value="all">Все формы</option>
          {FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-0 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 border-b border-white/8">
          <span>Имя</span>
          <span className="hidden md:block">Форма</span>
          <span className="hidden sm:block">Оценка</span>
          <span>Дата</span>
          <span />
        </div>

        {filtered.map((r, i) => (
          <div
            key={r.id}
            className={`grid grid-cols-[1fr_1fr_auto_auto_auto] gap-0 items-center px-5 py-4 cursor-pointer transition-colors hover:bg-white/4 animate-fade-in ${
              i !== filtered.length - 1 ? "border-b border-white/6" : ""
            } ${selectedResponse?.id === r.id ? "bg-primary/8" : ""}`}
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => setSelectedResponse(r)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {r.name[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground truncate">{r.email}</div>
              </div>
            </div>
            <div className="hidden md:block text-xs text-muted-foreground truncate pr-4">{r.form}</div>
            <div className="hidden sm:block text-amber-400 text-sm tracking-tight font-mono mr-4">{STARS(r.rating)}</div>
            <div className="text-xs text-muted-foreground whitespace-nowrap mr-4">{r.date}</div>
            <button className="p-1.5 rounded-lg hover:bg-white/8 text-muted-foreground hover:text-foreground transition">
              <Icon name="ChevronRight" size={15} />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ответов пока нет</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedResponse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedResponse(null)}
        >
          <div
            className="glass-strong rounded-3xl p-8 w-full max-w-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                  {selectedResponse.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{selectedResponse.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedResponse.date}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-2 rounded-xl hover:bg-white/8 text-muted-foreground transition"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="text-xs text-muted-foreground mb-4 px-1">{selectedResponse.form}</div>

            <div className="space-y-4">
              {Object.entries(selectedResponse.data).map(([key, value]) => (
                <div key={key} className="bg-white/4 rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">{key}</div>
                  <div className="text-sm font-medium text-foreground">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-foreground glass hover:bg-white/8 transition">
                <Icon name="Download" size={15} />
                Экспорт
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition">
                <Icon name="Trash2" size={15} />
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}