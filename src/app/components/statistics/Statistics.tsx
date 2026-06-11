import { useMemo } from "react";
import { Card } from "../ui/Card";
import { useFirestore } from "../../hooks/useFirestore";
import { useAuth } from "../../hooks/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#ef4444",
  "#059669",
  "#f59e0b",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function Statistics() {
  const { user } = useAuth();
  const { data: transactions = [], loading } = useFirestore("transactions");

  // Gastos por categoría (para Pie Chart)
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();

    transactions
      .filter((t: any) => t.type === "expense" && t.amount > 0)
      .forEach((t: any) => {
        const category = String(t.category || "Sin categoría").trim();
        map.set(category, (map.get(category) || 0) + Number(t.amount));
      });

    return Array.from(map.entries())
      .map(([name, value], index) => ({
        name,
        value: Number(value),
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Evolución mensual (Bar Chart)
  const monthlyData = useMemo(() => {
    const map = new Map<string, any>();

    transactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!map.has(key)) {
        map.set(key, {
          month: date.toLocaleString("es-ES", { month: "short" }),
          ingresos: 0,
          gastos: 0,
        });
      }

      const entry = map.get(key);
      const amount = Number(tx.amount || 0);
      if (tx.type === "income") {
        entry.ingresos += amount;
      } else {
        entry.gastos += amount;
      }
    });

    return Array.from(map.values())
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [transactions]);

  const totalIncome = transactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  if (loading) {
    return <div className="p-8 text-center">Cargando estadísticas...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-6xl mb-4">📊</p>
        <h3 className="text-2xl font-semibold">Sin datos aún</h3>
        <p className="text-muted-foreground mt-2">
          Agrega transacciones para ver las gráficas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Estadísticas</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Ingresos Totales</p>
          <p className="text-3xl font-bold font-mono text-emerald-600 mt-1">
            ${totalIncome.toLocaleString("es-CO")}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Gastos Totales</p>
          <p className="text-3xl font-bold font-mono text-red-600 mt-1">
            ${totalExpense.toLocaleString("es-CO")}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p
            className={`text-3xl font-bold font-mono mt-1 ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            ${balance.toLocaleString("es-CO")}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Movimientos</p>
          <p className="text-3xl font-bold font-mono mt-1">
            {transactions.length}
          </p>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Evolución Mensual */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-semibold mb-4">Ingresos vs Gastos por Mes</h3>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="ingresos"
                fill="#059669"
                name="Ingresos"
                radius={6}
              />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart - Gastos por Categoría */}
        <Card className="p-6">
          <h3 className="font-semibold mb-5">Gastos por Categoría</h3>

          <div className="flex justify-center py-4">
            <PieChart width={260} height={260}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="value"
                paddingAngle={3}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString("es-CO")}`,
                ]}
              />
            </PieChart>
          </div>

          {/* Lista de categorías */}
          <div className="mt-6 space-y-3 max-h-[320px] overflow-y-auto">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-foreground">{cat.name}</span>
                </div>
                <span className="font-mono font-medium">
                  ${cat.value.toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
