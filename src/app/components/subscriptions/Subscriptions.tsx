import { useState, useMemo } from "react";
import { Plus, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { Card, Badge } from "../ui/Card";
import { useFirestore } from "../../hooks/useFirestore";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  icon: string;
  status: "active" | "paused" | "cancelled";
  category?: string;
}

const ICON_OPTIONS = ["🎥","🎵","☁️","📺","🛒","🏋️","📚","🎮","🚗","💳","🍔","✈️"];
const CATEGORIES = ["Entretenimiento","Productividad","Salud","Educación","Transporte","Alimentación","Tecnología","Otro"];

const formatCOP = (amount: number) => {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  return `$${abs.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;
};

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function DaysChip({ days }: { days: number }) {
  if (days < 0)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium whitespace-nowrap">Vencida</span>;
  if (days === 0)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium whitespace-nowrap">Hoy</span>;
  if (days <= 3)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium whitespace-nowrap">En {days}d</span>;
  if (days <= 7)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium whitespace-nowrap">En {days}d</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">En {days}d</span>;
}

export function Subscriptions() {
  const { data: subscriptions = [], loading, addItem, updateItem, deleteItem } = useFirestore("subscriptions");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date");

  const [form, setForm] = useState({
    name: "",
    amount: "",
    billingCycle: "monthly" as "monthly" | "yearly",
    nextBillingDate: "",
    icon: "🎥",
    status: "active" as "active" | "paused" | "cancelled",
    category: "Entretenimiento",
  });

  const activeSubscriptions = subscriptions.filter((s: Subscription) => s.status === "active");

  const totalMonthly = useMemo(
    () => activeSubscriptions.reduce((sum, s) => sum + (s.billingCycle === "monthly" ? s.amount : s.amount / 12), 0),
    [activeSubscriptions],
  );

  const totalYearly = useMemo(
    () => activeSubscriptions.reduce((sum, s) => sum + (s.billingCycle === "monthly" ? s.amount * 12 : s.amount), 0),
    [activeSubscriptions],
  );

  const upcomingNext7Days = useMemo(
    () => activeSubscriptions.filter((s: Subscription) => {
      const d = daysUntil(s.nextBillingDate);
      return d >= 0 && d <= 7;
    }),
    [activeSubscriptions],
  );

  const upcomingCost7Days = useMemo(
    () => upcomingNext7Days.reduce((sum, s) => sum + s.amount, 0),
    [upcomingNext7Days],
  );

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    activeSubscriptions.forEach((s: Subscription) => {
      const cat = s.category || "Otro";
      map[cat] = (map[cat] || 0) + (s.billingCycle === "monthly" ? s.amount : s.amount / 12);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [activeSubscriptions]);

  const filteredAndSorted = useMemo(() => {
    let list = [...subscriptions] as Subscription[];
    if (filterStatus !== "all") list = list.filter((s) => s.status === filterStatus);
    if (sortBy === "date") list.sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
    if (sortBy === "amount") list.sort((a, b) => b.amount - a.amount);
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [subscriptions, filterStatus, sortBy]);

  const openCreate = () => {
    setForm({
      name: "",
      amount: "",
      billingCycle: "monthly",
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      icon: "🎥",
      status: "active",
      category: "Entretenimiento",
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (sub: Subscription) => {
    setForm({
      name: sub.name,
      amount: sub.amount.toString(),
      billingCycle: sub.billingCycle,
      nextBillingDate: sub.nextBillingDate,
      icon: sub.icon || "🎥",
      status: sub.status,
      category: sub.category || "Entretenimiento",
    });
    setEditId(sub.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.amount) return;
    const data = {
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      billingCycle: form.billingCycle,
      nextBillingDate: form.nextBillingDate,
      icon: form.icon,
      status: form.status,
      category: form.category,
    };
    const success = editId ? await updateItem(editId, data) : await addItem(data);
    if (success) { setShowModal(false); setEditId(null); }
  };

  const handleDelete = async (id: string) => {
    if (await deleteItem(id)) setDeleteId(null);
  };

  if (loading) return <div className="p-8 text-center">Cargando suscripciones...</div>;

  const inputClass = "w-full px-3 py-2.5 rounded-lg border outline-none text-sm";
  const inputStyle = {
    background: "var(--input-background)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="space-y-6 w-full min-w-0">

      {/* Resumen — 1 col móvil, 4 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center justify-between sm:block gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Activas</p>
            <p className="text-xl sm:text-2xl font-bold sm:mt-1">{activeSubscriptions.length}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{subscriptions.length} en total</p>
        </Card>

        <Card className="p-4 overflow-hidden">
          <div className="flex items-center justify-between sm:block gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Costo mensual</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-primary truncate sm:mt-1">
              {formatCOP(totalMonthly)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            ~{formatCOP(totalMonthly / activeSubscriptions.length || 0)} por suscripción
          </p>
        </Card>

        <Card className="p-4 overflow-hidden">
          <div className="flex items-center justify-between sm:block gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Costo anual</p>
            <p className="text-lg sm:text-xl font-bold font-mono truncate sm:mt-1">
              {formatCOP(totalYearly)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">proyección 12 meses</p>
        </Card>

        <Card className="p-4 overflow-hidden">
          <div className="flex items-center justify-between sm:block gap-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Próximos 7 días</p>
            <p className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:mt-1">
              {upcomingNext7Days.length}
              {upcomingNext7Days.length > 0 && <AlertCircle size={18} className="text-orange-500" />}
            </p>
          </div>
          {upcomingNext7Days.length > 0 && (
            <p className="text-xs text-orange-600 mt-1 font-medium truncate">
              {formatCOP(upcomingCost7Days)} por cobrar
            </p>
          )}
        </Card>
      </div>

      {/* Distribución por categoría */}
      {categoryBreakdown.length > 0 && (
        <Card className="p-4 sm:p-5 overflow-hidden">
          <p className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Distribución del gasto mensual
          </p>
          <div className="space-y-3">
            {categoryBreakdown.map(([cat, amount]) => {
              const pct = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;
              return (
                <div key={cat} className="min-w-0">
                  <div className="flex justify-between items-center text-sm mb-1 gap-2">
                    <span className="text-muted-foreground truncate">{cat}</span>
                    <span className="font-medium font-mono shrink-0 text-xs sm:text-sm">
                      {formatCOP(amount)}{" "}
                      <span className="text-muted-foreground text-xs">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Controles */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:justify-between sm:items-center">
        <h2 className="text-lg sm:text-2xl font-bold">Todas las Suscripciones</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={inputStyle}
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="paused">Pausadas</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={inputStyle}
          >
            <option value="date">Ordenar: Próximo cobro</option>
            <option value="amount">Ordenar: Importe</option>
            <option value="name">Ordenar: Nombre</option>
          </select>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {/* Lista de suscripciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSorted.length === 0 ? (
          <Card className="p-12 text-center col-span-full">
            <p className="text-5xl mb-4">💳</p>
            <p className="text-xl font-semibold">Aún no tienes suscripciones</p>
          </Card>
        ) : (
          filteredAndSorted.map((sub: Subscription) => {
            const days = daysUntil(sub.nextBillingDate);
            const monthlyEquiv = sub.billingCycle === "yearly" ? sub.amount / 12 : null;
            return (
              <Card key={sub.id} className={`p-4 sm:p-6 overflow-hidden ${sub.status === "paused" ? "opacity-60" : ""}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-2xl sm:text-3xl shrink-0">{sub.icon}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-base leading-tight truncate">{sub.name}</p>
                      {sub.category && (
                        <span className="text-xs text-muted-foreground truncate block">{sub.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-base sm:text-xl">{formatCOP(sub.amount)}</p>
                    <p className="text-xs text-muted-foreground">{sub.billingCycle === "monthly" ? "/ mes" : "/ año"}</p>
                  </div>
                </div>

                {/* Info extra */}
                <div className="mt-4 flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(sub.nextBillingDate).toLocaleDateString("es-CO")}
                  </span>
                  <DaysChip days={days} />
                  {monthlyEquiv && (
                    <span className="flex items-center gap-1 ml-auto font-medium text-muted-foreground whitespace-nowrap">
                      ≈ {formatCOP(monthlyEquiv)}/mes
                    </span>
                  )}
                  <Badge variant={sub.status === "active" ? "success" : "warning"}>
                    {sub.status === "active" ? "Activa" : "Pausada"}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(sub)} className="flex-1 py-2.5 border rounded-xl text-sm hover:bg-muted transition-colors">
                    Editar
                  </button>
                  <button onClick={() => setDeleteId(sub.id)} className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors">
                    Eliminar
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold mb-6">
              {editId ? "Editar suscripción" : "Nueva suscripción"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: "var(--foreground)" }}>Icono</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                      className={`text-2xl p-2 rounded-xl border transition-all ${form.icon === icon ? "border-primary bg-primary/10" : "border-border"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Netflix"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Importe ($)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Ciclo</label>
                  <select
                    value={form.billingCycle}
                    onChange={(e) => setForm((f) => ({ ...f, billingCycle: e.target.value as any }))}
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Próximo cobro</label>
                <input
                  type="date"
                  value={form.nextBillingDate}
                  onChange={(e) => setForm((f) => ({ ...f, nextBillingDate: e.target.value }))}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="active">Activa</option>
                  <option value="paused">Pausada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-2xl text-sm">Cancelar</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white rounded-2xl font-medium text-sm">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card p-6 rounded-2xl max-w-sm w-full text-center border border-border">
            <p className="text-lg font-semibold mb-2">¿Eliminar suscripción?</p>
            <p className="text-sm text-muted-foreground mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border rounded-xl text-sm">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-medium">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}