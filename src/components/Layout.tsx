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
  { id: "forms", label: "Мои формы", icon: "LayoutDashboard" },
  { id: "builder", label: "Конструктор", icon: "PenSquare" },
  { id: "responses", label: "Ответы", icon: "MessageSquare" },
  { id: "stats", label: "Статистика", icon: "BarChart3" },
  { id: "profile", label: "Профиль", icon: "User" },
];

export default function Layout({ children, currentPage, onNavigate, user, onLogin }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background font-golos">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, hsl(220,20%,7%) 0%, hsl(220,20%,5%) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center neon-glow flex-shrink-0">
            <Icon name="Zap" size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">FormFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/25 neon-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon} fallback="Circle" size={18} />
                {item.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User block */}
        <div className="p-4 border-t border-white/7">
          {user ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground gradient-primary hover:opacity-90 transition-opacity"
            >
              <Icon name="LogIn" size={16} />
              Войти через Яндекс
            </button>
          )}
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
          style={{
            background: "rgba(10,10,18,0.8)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="Menu" size={20} />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-muted-foreground text-sm">
            <span className="text-primary font-semibold">
              {navItems.find((n) => n.id === currentPage)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-white/5 text-muted-foreground transition-colors">
              <Icon name="Bell" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full" />
            </button>
            {!user && (
              <button
                onClick={onLogin}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-opacity"
              >
                <Icon name="LogIn" size={15} />
                Войти
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}