import { ReactNode, useState } from "react";
import {
  LogOut,
  Menu,
  X,
  Home,
  CreditCard,
  Target,
  PieChart,
  User,
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
    <div className="flex h-screen bg-background">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-72 border-r border-border bg-card flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Finora
          </h1>
          <p className="text-sm text-muted-foreground">Finanzas Personales</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id as AppPage)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                currentPage === id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {user?.displayName || user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-medium"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Finora</h1>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 flex items-start pt-16">
          <div className="bg-card w-full h-full overflow-auto p-4">
            <nav className="space-y-2">
              {menuItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    onNavigate(id as AppPage);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left ${
                    currentPage === id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-lg">{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 border-t border-border">
              <button
                onClick={onLogout}
                className="w-full py-4 text-red-600 border border-red-200 rounded-2xl font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
