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
} from "recharts";

const COLORS = [
  "#059669",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#ef4444",
];

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

export function Statistics() {
  const { data: transactions = [], loading } = useFirestore("transactions");

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
      if (tx.type === "income") entry.ingresos += amount;
      else entry.gastos += amount;
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
  const totalCategories = categoryData.reduce((s, c) => s + c.value, 0);

  if (loading) return <div className="p-8 text-center">Cargando estadísticas...</div>;

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-6xl mb-4">📊</p>
        <h3 className="text-xl sm:text-2xl font-semibold">Sin datos aún</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Agrega transacciones para ver las gráficas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full min-w-0">
      <h1 className="text-xl sm:text-3xl font-bold">Estadísticas</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 sm:p-6 overflow-hidden">
          <p className="text-xs sm:text-sm text-muted-foreground">Ingresos</p>
          <p className="font-bold font-mono text-emerald-600 mt-1 truncate" style={{ fontSize: "clamp(1rem,4vw,1.875rem)" }}>
            {formatCOP(totalIncome)}
          </p>
        </Card>
        <Card className="p-4 sm:p-6 overflow-hidden">
          <p className="text-xs sm:text-sm text-muted-foreground">Gastos</p>
          <p className="font-bold font-mono text-red-500 mt-1 truncate" style={{ fontSize: "clamp(1rem,4vw,1.875rem)" }}>
            {formatCOP(totalExpense)}
          </p>
        </Card>
        <Card className="p-4 sm:p-6 overflow-hidden">
          <p className="text-xs sm:text-sm text-muted-foreground">Balance</p>
          <p
            className={`font-bold font-mono mt-1 truncate ${balance >= 0 ? "text-emerald-600" : "text-red-500"}`}
            style={{ fontSize: "clamp(1rem,4vw,1.875rem)" }}
          >
            {formatCOP(balance)}
          </p>
        </Card>
        <Card className="p-4 sm:p-6 overflow-hidden">
          <p className="text-xs sm:text-sm text-muted-foreground">Movimientos</p>
          <p className="font-bold font-mono mt-1 truncate" style={{ fontSize: "clamp(1rem,4vw,1.875rem)" }}>
            {transactions.length}
          </p>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Bar Chart minimalista */}
        <Card className="lg:col-span-2 p-4 sm:p-6 min-w-0 overflow-hidden">
          <h3 className="font-semibold mb-1 text-sm sm:text-base">Ingresos vs Gastos</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos meses</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barGap={4} barCategoryGap="28%">
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value: number) => formatCOP(value)}
              />
              <Bar dataKey="ingresos" fill="#059669" name="Ingresos" radius={[6, 6, 6, 6]} maxBarSize={18} />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={[6, 6, 6, 6]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Ingresos
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Gastos
            </span>
          </div>
        </Card>

        {/* Pie Chart minimalista */}
        <Card className="p-4 sm:p-6 min-w-0 overflow-hidden">
          <h3 className="font-semibold mb-1 text-sm sm:text-base">Gastos por Categoría</h3>
          <p className="text-xs text-muted-foreground mb-2">Distribución del total</p>

          <div className="relative flex justify-center py-2">
            <PieChart width={180} height={180}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                dataKey="value"
                paddingAngle={2}
                strokeWidth={0}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  fontSize: 12,
                }}
                formatter={(value: number) => formatCOP(value)}
              />
            </PieChart>
            {/* Total en el centro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-mono font-bold text-sm truncate max-w-[90px]">
                {formatCOP(totalCategories)}
              </span>
            </div>
          </div>

          {/* Lista de categorías */}
          <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {categoryData.map((cat, i) => {
              const pct = totalCategories > 0 ? (cat.value / totalCategories) * 100 : 0;
              return (
                <div key={i} className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-foreground text-sm truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">{pct.toFixed(0)}%</span>
                    <span className="font-mono text-sm font-medium">{formatCOP(cat.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}