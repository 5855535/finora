import { ReactNode, useState } from "react";
import {
  LogOut,
  Menu,
  X,
  Home,
  CreditCard,
  Target,
  PieChart,
  Settings,
} from "lucide-react";
import type { AppPage } from "../../App";

interface AppLayoutProps {
  children: ReactNode;
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
  user: any;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "transactions", label: "Transacciones", icon: CreditCard },
  { id: "subscriptions", label: "Suscripciones", icon: Target },
  { id: "budgets", label: "Presupuestos", icon: PieChart },
  { id: "goals", label: "Metas", icon: Target },
  { id: "statistics", label: "Estadísticas", icon: PieChart },
  { id: "settings", label: "Ajustes", icon: Settings },
] as const;

export function AppLayout({
  children,
  currentPage,
  onNavigate,
  onLogout,
  user,
}: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* ── Sidebar Desktop ── */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-card flex-col overflow-hidden">
        <div className="p-5 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight text-primary truncate">
            Finora
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            Finanzas Personales
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id as AppPage)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all truncate ${
                currentPage === id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate text-sm">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3 mb-4 min-w-0">
            <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {user?.displayName ?? user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-medium text-sm"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Finora</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg hover:bg-muted"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Mobile Drawer ── */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/70"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-card w-72 max-w-[85vw] h-full overflow-y-auto p-4 pt-16 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1 flex-1">
              {menuItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    onNavigate(id as AppPage);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left ${
                    currentPage === id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="text-base truncate">{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-3 mb-4 min-w-0">
                <div className="w-9 h-9 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.email?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {user?.displayName ?? user?.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full py-3 text-red-600 border border-red-200 rounded-2xl font-medium text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-14 md:pt-0 min-w-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
