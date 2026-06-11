import { useState } from "react";
import { Plus, Edit2, Trash2, X, Target } from "lucide-react";
import { Card, Badge, ProgressBar } from "../ui/Card";
import { useFirestore } from "../../hooks/useFirestore";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

export function Goals() {
  const {
    data: goals = [],
    loading,
    addItem,
    updateItem,
    deleteItem,
  } = useFirestore("goals");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    icon: "🎯",
    color: "#059669",
  });

  const openCreate = () => {
    setForm({
      name: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: "",
      icon: "🎯",
      color: "#059669",
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (goal: Goal) => {
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      icon: goal.icon,
      color: goal.color,
    });
    setEditId(goal.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.targetAmount || !form.deadline) return;

    const data = {
      name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
      deadline: form.deadline,
      icon: form.icon,
      color: form.color,
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
    if (await deleteItem(id)) setEditId(null); // o maneja modal de confirmación
  };

  if (loading) return <div className="p-8 text-center">Cargando metas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Metas de Ahorro</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium"
        >
          <Plus size={18} /> Nueva Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal: Goal) => {
          const progress =
            goal.targetAmount > 0
              ? Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100),
                )
              : 0;

          return (
            <Card key={goal.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl" style={{ color: goal.color }}>
                    {goal.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence:{" "}
                      {new Date(goal.deadline).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(goal)}>
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(goal.id)}>
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <ProgressBar value={progress} max={100} />
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-mono font-bold">
                  ${goal.currentAmount.toLocaleString("es-CO")}
                </span>
                <span className="text-muted-foreground">
                  de ${goal.targetAmount.toLocaleString("es-CO")}
                </span>
              </div>
              <p className="text-right text-xs text-muted-foreground mt-1">
                {progress}% completado
              </p>
            </Card>
          );
        })}

        {goals.length === 0 && (
          <Card className="p-12 text-center col-span-full">
            <p className="text-6xl mb-4">🎯</p>
            <p className="text-xl font-semibold mb-2">Sin metas aún</p>
            <p className="text-muted-foreground">
              Crea tu primera meta de ahorro
            </p>
          </Card>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-5">
              {editId ? "Editar Meta" : "Nueva Meta"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre de la meta
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border"
                  placeholder="Ej: Viaje a Cartagena"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Monto objetivo
                  </label>
                  <input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, targetAmount: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Monto actual
                  </label>
                  <input
                    type="number"
                    value={form.currentAmount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, currentAmount: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-primary text-white rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
