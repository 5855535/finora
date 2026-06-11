import { useState } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  RefreshCw,
  PieChart,
  Target,
  BarChart2,
  Lightbulb,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Movimientos", icon: ArrowLeftRight },
  { id: "subscriptions", label: "Suscripciones", icon: RefreshCw },
  { id: "budgets", label: "Presupuestos", icon: PieChart },
  { id: "goals", label: "Objetivos", icon: Target },
  { id: "statistics", label: "Estadísticas", icon: BarChart2 },
  { id: "alerts", label: "Alertas", icon: Bell },
];

export function Sidebar({
  currentPage,
  onNavigate,
  onLogout,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Logo Header */}
        <div
          className={`flex items-center h-16 px-4 border-b flex-shrink-0 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <FinoraLogo />
              <span
                style={{
                  color: "#f1f5f9",
                  fontFamily: "var(--font-family)",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Finora
              </span>
            </div>
          ) : (
            <FinoraLogo />
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent"
            style={{ color: "var(--sidebar-foreground)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1 px-2">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = currentPage === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => {
                      onNavigate(id);
                      onMobileClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200 text-left group
                      ${collapsed ? "justify-center" : ""}
                    `}
                    style={{
                      background: isActive
                        ? "var(--sidebar-primary)"
                        : "transparent",
                      color: isActive
                        ? "var(--sidebar-primary-foreground)"
                        : "var(--sidebar-foreground)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background =
                          "var(--sidebar-accent)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                      }
                    }}
                    title={collapsed ? label : undefined}
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className="flex-shrink-0"
                    />
                    {!collapsed && (
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: isActive ? 600 : 500,
                        }}
                      >
                        {label}
                      </span>
                    )}

                    {id === "alerts" && !collapsed && (
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "#ef4444", color: "#fff" }}
                      >
                        3
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div
          className="py-4 border-t px-2 space-y-1 flex-shrink-0"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <SidebarButton
            icon={Settings}
            label="Configuración"
            collapsed={collapsed}
            onClick={() => {
              onNavigate("settings");
              onMobileClose();
            }}
            active={currentPage === "settings"}
          />
          <SidebarButton
            icon={LogOut}
            label="Cerrar sesión"
            collapsed={collapsed}
            onClick={onLogout}
            danger
          />
        </div>

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center rounded-full border shadow-sm hover:shadow transition-all"
          style={{
            background: "var(--sidebar)",
            borderColor: "var(--sidebar-border)",
            color: "var(--sidebar-foreground)",
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Spacer for main content */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      />
    </>
  );
}

/* Sidebar Button Component */
function SidebarButton({
  icon: Icon,
  label,
  collapsed,
  onClick,
  active,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
      style={{
        background: active ? "var(--sidebar-primary)" : "transparent",
        color: danger
          ? "#f87171"
          : active
            ? "var(--sidebar-primary-foreground)"
            : "var(--sidebar-foreground)",
        fontSize: "0.875rem",
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.background =
            "var(--sidebar-accent)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
      title={collapsed ? label : undefined}
    >
      <Icon size={18} strokeWidth={1.8} className="flex-shrink-0" />
      {!collapsed && <span style={{ fontWeight: 500 }}>{label}</span>}
    </button>
  );
}

/* Logo Component */
function FinoraLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="8" fill="#059669" />
      <path d="M8 8h12v3H11v3h7v3h-7v6H8V8z" fill="white" />
    </svg>
  );
}
