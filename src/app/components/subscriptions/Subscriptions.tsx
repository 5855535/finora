import { useState, useMemo } from "react";
import { Plus, AlertCircle, TrendingUp, Calendar, Clock } from "lucide-react";
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

const ICON_OPTIONS = [
  "🎥",
  "🎵",
  "☁️",
  "📺",
  "🛒",
  "🏋️",
  "📚",
  "🎮",
  "🚗",
  "💳",
  "🍔",
  "✈️",
];
const CATEGORIES = [
  "Entretenimiento",
  "Productividad",
  "Salud",
  "Educación",
  "Transporte",
  "Alimentación",
  "Tecnología",
  "Otro",
];

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function DaysChip({ days }: { days: number }) {
  if (days < 0)
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
        Vencida
      </span>
    );
  if (days === 0)
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
        Hoy
      </span>
    );
  if (days <= 3)
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
        En {days}d
      </span>
    );
  if (days <= 7)
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
        En {days}d
      </span>
    );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
      En {days}d
    </span>
  );
}

export function Subscriptions() {
  const {
    data: subscriptions = [],
    loading,
    addItem,
    updateItem,
    deleteItem,
  } = useFirestore("subscriptions");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused">(
    "all",
  );
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

  const activeSubscriptions = subscriptions.filter(
    (s: Subscription) => s.status === "active",
  );

  const totalMonthly = useMemo(
    () =>
      activeSubscriptions.reduce(
        (sum, s) =>
          sum + (s.billingCycle === "monthly" ? s.amount : s.amount / 12),
        0,
      ),
    [activeSubscriptions],
  );

  const totalYearly = useMemo(
    () =>
      activeSubscriptions.reduce(
        (sum, s) =>
          sum + (s.billingCycle === "monthly" ? s.amount * 12 : s.amount),
        0,
      ),
    [activeSubscriptions],
  );

  const upcomingNext7Days = useMemo(
    () =>
      activeSubscriptions.filter((s: Subscription) => {
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
      map[cat] =
        (map[cat] || 0) +
        (s.billingCycle === "monthly" ? s.amount : s.amount / 12);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [activeSubscriptions]);

  const filteredAndSorted = useMemo(() => {
    let list = [...subscriptions] as Subscription[];
    if (filterStatus !== "all")
      list = list.filter((s) => s.status === filterStatus);
    if (sortBy === "date")
      list.sort(
        (a, b) =>
          new Date(a.nextBillingDate).getTime() -
          new Date(b.nextBillingDate).getTime(),
      );
    if (sortBy === "amount") list.sort((a, b) => b.amount - a.amount);
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [subscriptions, filterStatus, sortBy]);

  const openCreate = () => {
    setForm({
      name: "",
      amount: "",
      billingCycle: "monthly",
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
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
    const success = editId
      ? await updateItem(editId, data)
      : await addItem(data);
    if (success) {
      setShowModal(false);
      setEditId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (await deleteItem(id)) setDeleteId(null);
  };

  if (loading)
    return <div className="p-8 text-center">Cargando suscripciones...</div>;

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border outline-none text-sm";
  const inputStyle = {
    background: "var(--input-background)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  };

  return (
    <div className="space-y-6">
      {/* Resumen - 4 tarjetas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Activas
          </p>
          <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {subscriptions.length} en total
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Costo mensual
          </p>
          <p className="text-2xl font-bold font-mono text-primary">
            $
            {totalMonthly.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ~$
            {(totalMonthly / activeSubscriptions.length || 0).toLocaleString(
              "es-CO",
              { maximumFractionDigits: 0 },
            )}{" "}
            por suscripción
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Costo anual
          </p>
          <p className="text-2xl font-bold font-mono">
            ${totalYearly.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            proyección 12 meses
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Próximos 7 días
          </p>
          <p className="text-3xl font-bold flex items-center gap-2">
            {upcomingNext7Days.length}
            {upcomingNext7Days.length > 0 && (
              <AlertCircle size={20} className="text-orange-500" />
            )}
          </p>
          {upcomingNext7Days.length > 0 && (
            <p className="text-xs text-orange-600 mt-1 font-medium">
              ${upcomingCost7Days.toLocaleString("es-CO")} por cobrar
            </p>
          )}
        </Card>
      </div>

      {/* Distribución por categoría */}
      {categoryBreakdown.length > 0 && (
        <Card className="p-5">
          <p className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Distribución del
            gasto mensual
          </p>
          <div className="space-y-3">
            {categoryBreakdown.map(([cat, amount]) => {
              const pct = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-medium font-mono">
                      $
                      {amount.toLocaleString("es-CO", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      <span className="text-muted-foreground text-xs">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Controles */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-2xl font-bold">Todas las Suscripciones</h2>
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
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium text-sm"
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
            const monthlyEquiv =
              sub.billingCycle === "yearly" ? sub.amount / 12 : null;
            return (
              <Card
                key={sub.id}
                className={`p-6 ${sub.status === "paused" ? "opacity-60" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{sub.icon}</div>
                    <div>
                      <p className="font-semibold text-base leading-tight">
                        {sub.name}
                      </p>
                      {sub.category && (
                        <span className="text-xs text-muted-foreground">
                          {sub.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-xl">
                      ${sub.amount.toLocaleString("es-CO")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sub.billingCycle === "monthly" ? "/ mes" : "/ año"}
                    </p>
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
                    <span className="flex items-center gap-1 ml-auto font-medium text-muted-foreground">
                      ≈ $
                      {monthlyEquiv.toLocaleString("es-CO", {
                        maximumFractionDigits: 0,
                      })}
                      /mes
                    </span>
                  )}
                  <Badge
                    variant={sub.status === "active" ? "success" : "warning"}
                  >
                    {sub.status === "active" ? "Activa" : "Pausada"}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(sub)}
                    className="flex-1 py-2.5 border rounded-xl text-sm hover:bg-muted transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(sub.id)}
                    className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors"
                  >
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
          <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">
              {editId ? "Editar suscripción" : "Nueva suscripción"}
            </h3>
            <div className="space-y-4">
              {/* Icono */}
              <div>
                <label
                  className="text-xs font-semibold block mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Icono
                </label>
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

              {/* Nombre */}
              <div>
                <label
                  className="text-xs font-semibold block mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Nombre
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ej: Netflix"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Importe + Ciclo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-xs font-semibold block mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    Importe ($)
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="0.00"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-semibold block mb-1"
                    style={{ color: "var(--foreground)" }}
                  >
                    Ciclo
                  </label>
                  <select
                    value={form.billingCycle}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        billingCycle: e.target.value as any,
                      }))
                    }
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label
                  className="text-xs font-semibold block mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className={inputClass}
                  style={inputStyle}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Próximo cobro */}
              <div>
                <label
                  className="text-xs font-semibold block mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Próximo cobro
                </label>
                <input
                  type="date"
                  value={form.nextBillingDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nextBillingDate: e.target.value }))
                  }
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Estado */}
              <div>
                <label
                  className="text-xs font-semibold block mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Estado
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as any }))
                  }
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="active">Activa</option>
                  <option value="paused">Pausada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border rounded-2xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-primary text-white rounded-2xl font-medium text-sm"
                >
                  Guardar
                </button>
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
            <p className="text-sm text-muted-foreground mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 border rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
