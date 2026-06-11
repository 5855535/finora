import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { Card, Badge } from "../ui/Card";
import { useFirestore } from "../../hooks/useFirestore";
import { useAuth } from "../../hooks/useAuth";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  paymentMethod: string;
  icon: string;
}

const categories = [
  "Todas",
  "Alimentación",
  "Restaurantes",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Vivienda",
  "Suministros",
  "Moda",
  "Software",
  "Educación",
  "Seguros",
];
const paymentMethods = [
  "Tarjeta débito",
  "Tarjeta crédito",
  "Transferencia",
  "Efectivo",
  "PayPal",
  "Domiciliación",
];

const emptyForm: Omit<Transaction, "id"> = {
  description: "",
  category: "Alimentación",
  amount: 0,
  type: "expense",
  date: new Date().toISOString().split("T")[0],
  paymentMethod: "Tarjeta débito",
  icon: "💳",
};

const formatCOP = (amount: number) => {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function Transactions() {
  const { user } = useAuth();
  const {
    data: transactions = [],
    loading,
    addItem,
    updateItem,
    deleteItem,
  } = useFirestore("transactions");

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Todas");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Transaction, "id">>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = transactions.filter((tx: Transaction) => {
    const matchSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Todas" || tx.category === filterCat;
    const matchType = filterType === "all" || tx.type === filterType;
    return matchSearch && matchCat && matchType;
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (tx: Transaction) => {
    setForm({ ...tx });
    setEditId(tx.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.description?.trim() || form.amount <= 0 || saving) return;
    setSaving(true);
    try {
      const success = editId
        ? await updateItem(editId, form)
        : await addItem(form);
      if (success) {
        setShowModal(false);
        setForm(emptyForm);
        setEditId(null);
      }
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (await deleteItem(id)) setDeleteId(null);
  };

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  if (loading)
    return <div className="p-8 text-center">Cargando movimientos...</div>;

  return (
    <div className="space-y-5 w-full min-w-0">
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { label: "Ingresos", value: totalIncome },
          { label: "Gastos", value: totalExpense },
          { label: "Balance", value: totalIncome - totalExpense },
        ].map(({ label, value }) => (
          <Card key={label} className="p-3 overflow-hidden">
            <div className="flex items-center justify-between sm:block gap-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">
                {label}
              </p>
              <p
                className="font-bold text-right sm:text-left sm:mt-1 text-foreground"
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "1.1rem",
                }}
              >
                {formatCOP(value)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border bg-card text-foreground text-sm"
            placeholder="Buscar descripción o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="px-3 py-2.5 rounded-lg border bg-card text-foreground text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="all">Todos</option>
          <option value="income">Solo Ingresos</option>
          <option value="expense">Solo Gastos</option>
        </select>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium bg-primary text-sm whitespace-nowrap"
        >
          <Plus size={15} /> Nuevo movimiento
        </button>
      </div>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Importe
                </th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    No hay movimientos aún. Crea uno nuevo.
                  </td>
                </tr>
              ) : (
                filtered.map((tx: Transaction) => (
                  <tr
                    key={tx.id}
                    className="border-b hover:bg-muted/50"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-4 py-3 font-medium text-sm max-w-[120px] truncate">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge>{tx.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString("es-CO")}
                    </td>
                    <td
                      className="px-4 py-3 font-mono font-semibold text-sm whitespace-nowrap"
                      style={{
                        color: tx.type === "income" ? "#059669" : "#ef4444",
                      }}
                    >
                      {tx.type === "income" ? "+" : ""}
                      {formatCOP(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(tx)}
                          className="p-1.5 hover:bg-muted rounded"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg text-foreground">
                {editId ? "Editar movimiento" : "Nuevo movimiento"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Tipo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
                    className={`py-3 rounded-xl font-medium text-sm ${form.type === "expense" ? "bg-red-600 text-white" : "bg-muted text-foreground"}`}
                  >
                    Gasto
                  </button>
                  <button
                    onClick={() => setForm((f) => ({ ...f, type: "income" }))}
                    className={`py-3 rounded-xl font-medium text-sm ${form.type === "income" ? "bg-emerald-600 text-white" : "bg-muted text-foreground"}`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Descripción"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">
                    Importe
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">
                    Categoría
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm"
                  >
                    {categories.slice(1).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm"
              />
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentMethod: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border bg-card text-foreground text-sm"
              >
                {paymentMethods.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-sm"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card p-6 rounded-2xl max-w-sm w-full">
            <p className="mb-6 text-foreground text-sm">
              ¿Eliminar este movimiento?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 border border-border rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm"
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
