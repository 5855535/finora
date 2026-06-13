import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Card } from "../ui/Card";
import { useFirestore } from "../../hooks/useFirestore";

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  icon: string;
  color: string;
}

const formatCOP = (amount: number) => {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

function getBudgetStatus(pct: number): { variant: "success" | "warning" | "danger"; label: string } {
  if (pct >= 100) return { variant: "danger", label: "Excedido" };
  if (pct >= 80) return { variant: "warning", label: "Alerta" };
  if (pct >= 50) return { variant: "warning", label: "A mitad" };
  return { variant: "success", label: "Bien" };
}

function getBarColor(pct: number) {
  if (pct >= 100) return "#ef4444";
  if (pct >= 80) return "#f59e0b";
  return "#059669";
}

export function Budgets() {
  const { data: budgets = [], loading: budgetsLoading, addItem, updateItem, deleteItem } = useFirestore("budgets");
  const { data: transactions = [], loading: txLoading } = useFirestore("transactions");

  const loading = budgetsLoading || txLoading;

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: "", allocated: "", icon: "📦", color: "#059669" });

  const now = new Date();
  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((tx: any) => {
        const d = new Date(tx.date);
        return tx.type === "expense" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .forEach((tx: any) => {
        map[tx.category] = (map[tx.category] || 0) + (tx.amount || 0);
      });
    return map;
  }, [transactions]);

  const enrichedBudgets = useMemo(() => {
    return budgets.map((b: Budget) => ({
      ...b,
      realSpent: spentByCategory[b.category] ?? b.spent ?? 0,
    }));
  }, [budgets, spentByCategory]);

  const totalAllocated = enrichedBudgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = enrichedBudgets.reduce((acc, b) => acc + b.realSpent, 0);
  const overBudget = enrichedBudgets.filter((b) => b.realSpent > b.allocated);

  const openCreate = () => {
    setForm({ category: "", allocated: "", icon: "📦", color: "#059669" });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (b: any) => {
    setForm({ category: b.category, allocated: b.allocated.toString(), icon: b.icon, color: b.color });
    setEditId(b.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.category.trim() || !form.allocated) return;
    const data = {
      category: form.category.trim(),
      allocated: parseFloat(form.allocated),
      spent: 0,
      icon: form.icon,
      color: form.color,
    };
    const success = editId ? await updateItem(editId, data) : await addItem(data);
    if (success) { setShowModal(false); setEditId(null); }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) setDeleteId(null);
  };

  if (loading) return <div className="p-10 text-center">Cargando presupuestos...</div>;

  return (
    <div className="space-y-6 w-full min-w-0">

      {/* Resumen — 1 col móvil, 4 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Presupuesto total", value: formatCOP(totalAllocated) },
          { label: "Total gastado", value: formatCOP(totalSpent) },
          { label: "Disponible", value: formatCOP(Math.max(0, totalAllocated - totalSpent)) },
          { label: "Excedidas", value: overBudget.length.toString() },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4 overflow-hidden">
            <div className="flex items-center justify-between sm:block gap-3">
              <p className="text-xs uppercase text-muted-foreground shrink-0">{label}</p>
              <p className="text-lg sm:text-2xl font-bold sm:mt-1 font-mono truncate">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold">Presupuestos por categoría</h2>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap"
        >
          <Plus size={18} /> Nuevo Presupuesto
        </button>
      </div>

      {/* Lista de Presupuestos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichedBudgets.map((budget: any) => {
          const pct = budget.allocated ? Math.min(110, (budget.realSpent / budget.allocated) * 100) : 0;
          return (
            <Card key={budget.id} className="p-4 sm:p-5 overflow-hidden">
              <div className="flex items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${budget.color}20` }}
                  >
                    {budget.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{budget.category}</p>
                    <p className="text-xs text-muted-foreground">Mensual</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(budget)} className="p-2 hover:bg-muted rounded">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteId(budget.id)} className="p-2 hover:bg-red-100 text-red-600 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Gastado</span>
                  <span>{pct.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${Math.min(100, pct)}%`, background: getBarColor(pct) }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm gap-2 min-w-0">
                <span className="font-mono font-bold truncate" style={{ color: getBarColor(pct) }}>
                  {formatCOP(budget.realSpent)}
                </span>
                <span className="text-muted-foreground shrink-0">de {formatCOP(budget.allocated)}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold mb-6">
              {editId ? "Editar Presupuesto" : "Nuevo Presupuesto"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm"
                  placeholder="Ej: Alimentación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monto (COP)</label>
                <input
                  type="number"
                  value={form.allocated}
                  onChange={(e) => setForm((f) => ({ ...f, allocated: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-xl text-sm">Cancelar</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-primary text-white rounded-xl text-sm">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-card p-6 rounded-2xl max-w-sm w-full">
            <p className="mb-6 text-sm">¿Eliminar este presupuesto?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border rounded-xl text-sm">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}