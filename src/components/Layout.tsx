import { useState } from "react";
import Icon from "@/components/ui/icon";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  user: { name: string; avatar: string; email: string } | null;
  onLogin: () => void;
}

const navItems = [
  { id: "forms", label: "Активность" },
  { id: "builder", label: "Конструктор" },
  { id: "responses", label: "Ответы" },
  { id: "stats", label: "Статистика" },
  { id: "profile", label: "Прочее" },
];

export default function Layout({ children, currentPage, onNavigate, user, onLogin }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-golos">
      {/* Top navigation bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(8,4,2,0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(244,81,30,0.12)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{ background: "rgba(244,81,30,0.9)", boxShadow: "0 0 18px rgba(244,81,30,0.5)" }}
          >
            F
          </div>
        </div>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-foreground text-background font-semibold"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/8"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: user + menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-2.5 px-3 py-2 rounded-full glass hover:bg-white/8 transition"
            >
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.name[0]}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-foreground leading-tight">{user.name.split(" ")[0]}</div>
                <div className="text-[10px] text-foreground/50 leading-tight">{user.email.split("@")[0]}</div>
              </div>
              <Icon name="ChevronDown" size={14} className="text-foreground/40" />
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white gradient-primary glow-sm hover:opacity-90 transition"
            >
              Войти
            </button>
          )}

          {/* Hamburger menu icon */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center glass text-foreground/60 hover:text-foreground transition"
          >
            <Icon name="Menu" size={18} />
          </button>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div
          className="fixed top-[61px] left-0 right-0 z-40 md:hidden animate-fade-in"
          style={{ background: "rgba(8,4,2,0.95)", borderBottom: "1px solid rgba(244,81,30,0.12)" }}
        >
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`w-full text-left px-6 py-3.5 text-sm font-medium border-b border-white/5 transition ${
                  active ? "text-primary" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {!user && (
            <div className="px-6 py-4">
              <button
                onClick={() => { onLogin(); setMobileOpen(false); }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white gradient-primary"
              >
                Войти через Яндекс
              </button>
            </div>
          )}
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 pt-[61px]">
        {children}
      </main>
    </div>
  );
}
