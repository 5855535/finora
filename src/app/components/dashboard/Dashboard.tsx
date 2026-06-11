import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, StatCard, Badge, ProgressBar } from "../ui/Card";
import { useFirestore } from "../../hooks/useFirestore";
import { useAuth } from "../../hooks/useAuth";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { data: transactions = [], loading: txLoading } =
    useFirestore("transactions");
  const { data: subscriptions = [], loading: subLoading } =
    useFirestore("subscriptions");
  const { data: budgets = [], loading: budgetsLoading } =
    useFirestore("budgets");

  const loading = txLoading || subLoading || budgetsLoading;

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  // ==================== PRESUPUESTO MENSUAL (MEJORADO) ====================
  const now = new Date();
  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};

    transactions
      .filter((tx: any) => {
        if (tx.type !== "expense") return false;
        const d = new Date(tx.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .forEach((tx: any) => {
        const category = String(tx.category || "").trim();
        if (category) {
          map[category] = (map[category] || 0) + Number(tx.amount || 0);
        }
      });

    return map;
  }, [transactions]);

  const totalBudget = budgets.reduce(
    (sum: number, b: any) => sum + Number(b.allocated || 0),
    0,
  );
  const totalSpent = budgets.reduce((sum: number, b: any) => {
    const cat = String(b.category || "").trim();
    return sum + (spentByCategory[cat] || Number(b.spent || 0));
  }, 0);

  const budgetUsed =
    totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0;

  // Cálculos mensuales
  const monthlyTransactions = transactions.filter((tx: any) => {
    const d = new Date(tx.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const totalIncome = monthlyTransactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const totalExpense = monthlyTransactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  const activeSubscriptions = subscriptions.filter(
    (s: any) => s.status === "active",
  );
  const totalSubscriptionsMonthly = activeSubscriptions.reduce(
    (acc: number, s: any) => {
      return (
        acc +
        (s.billingCycle === "monthly"
          ? Number(s.amount)
          : Number(s.amount) / 12)
      );
    },
    0,
  );

  // Gráficos
  const monthlyData = useMemo(() => {
    const grouped = new Map();
    transactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          month: date.toLocaleString("es-ES", { month: "short" }),
          ingresos: 0,
          gastos: 0,
        });
      }
      const entry = grouped.get(key);
      if (tx.type === "income") entry.ingresos += Number(tx.amount || 0);
      else entry.gastos += Number(tx.amount || 0);
    });
    return Array.from(grouped.values()).slice(-6);
  }, [transactions]);

  const categoryExpenses = useMemo(() => {
    const map = new Map();
    transactions
      .filter((t: any) => t.type === "expense")
      .forEach((t: any) => {
        const cat = String(t.category || "Sin categoría").trim();
        map.set(cat, (map.get(cat) || 0) + Number(t.amount || 0));
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Number(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  const COLORS = ["#ef4444", "#059669", "#f59e0b", "#0ea5e9", "#8b5cf6"];
  const savingsRate =
    totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
  const recentTx = transactions.slice(0, 5);

  if (loading) {
    return <div className="p-8 text-center">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Buenos días,{" "}
          {user?.displayName || user?.email?.split("@")[0] || "Usuario"} 👋
        </h2>
        <p className="text-muted-foreground">
          Resumen de tus finanzas •{" "}
          {new Date().toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos del mes"
          value={formatCOP(totalIncome)}
          subtitle={new Date().toLocaleString("es-ES", { month: "long" })}
          trend="+11.2%"
          trendUp
          icon={<TrendingUp size={20} color="#059669" />}
          iconBg="#d1fae5"
        />
        <StatCard
          title="Gastos del mes"
          value={formatCOP(totalExpense)}
          subtitle={new Date().toLocaleString("es-ES", { month: "long" })}
          trend="-8.3%"
          trendUp={false}
          icon={<TrendingDown size={20} color="#ef4444" />}
          iconBg="#fee2e2"
        />
        <StatCard
          title="Disponible"
          value={formatCOP(balance)}
          subtitle="Saldo libre"
          icon={<Wallet size={20} color="#0ea5e9" />}
          iconBg="#dbeafe"
        />
        <StatCard
          title="Ahorro mensual"
          value={`${savingsRate}%`}
          subtitle={`${formatCOP(balance)} ahorrados`}
          trend="+5.1%"
          trendUp
          icon={<PiggyBank size={20} color="#8b5cf6" />}
          iconBg="#ede9fe"
        />
      </div>

      {/* Presupuesto Mensual - Ahora funciona correctamente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="uppercase text-xs tracking-widest font-semibold text-muted-foreground">
              Presupuesto mensual
            </p>
            <Badge
              variant={
                budgetUsed >= 100
                  ? "danger"
                  : budgetUsed >= 75
                    ? "warning"
                    : "success"
              }
            >
              {budgetUsed}% usado
            </Badge>
          </div>
          <ProgressBar value={budgetUsed} max={100} />
          <div className="flex justify-between mt-3 text-sm">
            <span className="text-muted-foreground">
              {formatCOP(totalSpent)} gastados
            </span>
            <span className="text-muted-foreground">
              de {formatCOP(totalBudget)}
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <p className="uppercase text-xs tracking-widest font-semibold text-muted-foreground mb-1">
            Suscripciones activas
          </p>
          <p className="text-3xl font-bold font-mono text-foreground">
            {formatCOP(totalSubscriptionsMonthly)}
          </p>
          <p className="text-sm text-muted-foreground">
            {activeSubscriptions.length} suscripciones
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold mb-4 text-foreground">
            Evolución últimos meses
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={
                monthlyData.length
                  ? monthlyData
                  : [{ month: "Sin datos", ingresos: 0, gastos: 0 }]
              }
              margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
            >
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#gradIncome)"
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradExpense)"
                name="Gastos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4 text-foreground">
            Gastos por categoría
          </h3>
          <div className="flex justify-center">
            <PieChart width={130} height={130}>
              <Pie
                data={categoryExpenses}
                cx={65}
                cy={65}
                innerRadius={38}
                outerRadius={60}
                dataKey="value"
              >
                {categoryExpenses.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2 mt-4">
            {categoryExpenses.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm">{c.name}</span>
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {formatCOP(c.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Próximos cobros y Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Próximos cobros</h3>
            <button
              onClick={() => onNavigate("subscriptions")}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {activeSubscriptions.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No hay suscripciones activas
              </p>
            ) : (
              activeSubscriptions.slice(0, 3).map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{sub.icon}</span>
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sub.nextBillingDate).toLocaleDateString(
                          "es-ES",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold">
                    {formatCOP(sub.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Actividad reciente
            </h3>
            <button
              onClick={() => onNavigate("transactions")}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              Ver todo <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentTx.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                Aún no hay movimientos
              </p>
            ) : (
              recentTx.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{tx.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-semibold ${tx.type === "income" ? "text-emerald-500" : ""}`}
                  >
                    {tx.type === "income" ? "+" : ""}
                    {formatCOP(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
