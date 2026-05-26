import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  user: { name: string; avatar: string; email: string } | null;
  onLogin: () => void;
}

const navItems = [
  { id: "forms", label: "Мои формы", icon: "LayoutDashboard" },
  { id: "builder", label: "Конструктор", icon: "PenSquare" },
  { id: "responses", label: "Ответы", icon: "MessageSquare" },
  { id: "stats", label: "Статистика", icon: "BarChart3" },
];

export default function Layout({ children, currentPage, onNavigate, user, onLogin }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 ${collapsed ? "justify-center" : ""}`}>
        <img
          src="https://cdn.poehali.dev/projects/267e080f-eff8-4afa-95f4-c72c1b12bd16/bucket/398999e0-d058-4e86-ae0c-96d1a6895ef3.png"
          alt="Формус"
          className="w-9 h-9 rounded-xl flex-shrink-0"
          style={{ boxShadow: "0 0 14px rgba(244,81,30,0.4)" }}
        />
        {!collapsed && (
          <span className="text-lg font-bold text-foreground tracking-tight">Формус</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "text-white"
                  : "text-foreground/50 hover:text-foreground hover:bg-white/6"
              }`}
              style={active ? {
                background: "linear-gradient(135deg, rgba(244,81,30,0.25), rgba(255,140,0,0.15))",
                border: "1px solid rgba(244,81,30,0.3)",
              } : {}}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} fallback="Circle" size={18} className={active ? "text-primary" : ""} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: profile + collapse */}
      <div className="p-3 border-t border-white/6 space-y-2">
        <button
          onClick={() => { onNavigate("profile"); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-foreground/50 hover:text-foreground hover:bg-white/6 ${collapsed ? "justify-center" : ""} ${currentPage === "profile" ? "text-white" : ""}`}
          style={currentPage === "profile" ? {
            background: "linear-gradient(135deg, rgba(244,81,30,0.25), rgba(255,140,0,0.15))",
            border: "1px solid rgba(244,81,30,0.3)",
          } : {}}
        >
          <Icon name="User" fallback="Circle" size={18} className={currentPage === "profile" ? "text-primary" : ""} />
          {!collapsed && <span>Профиль</span>}
        </button>

        {user ? (
          <div className={`flex items-center gap-2.5 px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 gradient-primary">
              {user.name[0]}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{user.name.split(" ")[0]}</div>
                <div className="text-[10px] text-foreground/40 truncate">{user.email}</div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLogin}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition ${collapsed ? "justify-center" : ""}`}
          >
            <Icon name="LogIn" size={16} />
            {!collapsed && "Войти"}
          </button>
        )}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden lg:flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs text-foreground/30 hover:text-foreground/60 hover:bg-white/4 transition ${collapsed ? "justify-center" : ""}`}
        >
          <Icon name={collapsed ? "ChevronRight" : "ChevronLeft"} size={14} />
          {!collapsed && "Свернуть"}
        </button>

        {/* Legal links */}
        {!collapsed && (
          <div className="px-3 pt-1 pb-1 flex gap-3">
            <Link to="/privacy" className="text-[10px] text-foreground/25 hover:text-foreground/50 transition">Конфиденциальность</Link>
            <Link to="/terms" className="text-[10px] text-foreground/25 hover:text-foreground/50 transition">Соглашение</Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex font-golos">
      {/* Sidebar — desktop */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-200 ${collapsed ? "w-[64px]" : "w-56"}`}
        style={{
          background: "rgba(8,4,2,0.85)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-56 flex flex-col lg:hidden animate-slide-up"
            style={{
              background: "rgba(8,4,2,0.97)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? "lg:ml-[64px]" : "lg:ml-56"}`}>
        {/* Mobile topbar */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3"
          style={{
            background: "rgba(8,4,2,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-foreground/60 hover:text-foreground">
            <Icon name="Menu" size={20} />
          </button>
          <img
            src="https://cdn.poehali.dev/projects/267e080f-eff8-4afa-95f4-c72c1b12bd16/bucket/398999e0-d058-4e86-ae0c-96d1a6895ef3.png"
            alt="Формус"
            className="w-8 h-8 rounded-lg"
          />
          {user ? (
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
              {user.name[0]}
            </div>
          ) : (
            <button onClick={onLogin} className="text-sm font-semibold text-primary">Войти</button>
          )}
        </header>

        <main className="flex-1 min-h-0">
          {children}
        </main>

        {/* Footer — mobile only */}
        <footer className="lg:hidden flex items-center justify-center gap-4 py-3 border-t border-white/5">
          <Link to="/privacy" className="text-[10px] text-foreground/25 hover:text-foreground/50 transition">Конфиденциальность</Link>
          <span className="text-foreground/15 text-[10px]">·</span>
          <Link to="/terms" className="text-[10px] text-foreground/25 hover:text-foreground/50 transition">Соглашение</Link>
        </footer>
      </div>
    </div>
  );
}