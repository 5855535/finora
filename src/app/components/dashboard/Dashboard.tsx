import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
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

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { data: transactions = [], loading: txLoading } =
    useFirestore("transactions");
  const { data: subscriptions = [], loading: subLoading } =
    useFirestore("subscriptions");
  const { data: budgets = [], loading: budgetsLoading } =
    useFirestore("budgets");

  const loading = txLoading || subLoading || budgetsLoading;

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
        const cat = String(tx.category ?? "").trim();
        if (cat) map[cat] = (map[cat] ?? 0) + Number(tx.amount ?? 0);
      });
    return map;
  }, [transactions]);

  const totalBudget = budgets.reduce(
    (s: number, b: any) => s + Number(b.allocated ?? 0),
    0,
  );
  const totalSpent = budgets.reduce((s: number, b: any) => {
    const cat = String(b.category ?? "").trim();
    return s + (spentByCategory[cat] ?? Number(b.spent ?? 0));
  }, 0);
  const budgetUsed =
    totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0;

  const monthlyTransactions = transactions.filter((tx: any) => {
    const d = new Date(tx.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const totalIncome = monthlyTransactions
    .filter((t: any) => t.type === "income")
    .reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0);
  const totalExpense = monthlyTransactions
    .filter((t: any) => t.type === "expense")
    .reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0);
  const balance = totalIncome - totalExpense;

  const activeSubscriptions = subscriptions.filter(
    (s: any) => s.status === "active",
  );
  const totalSubscriptionsMonthly = activeSubscriptions.reduce(
    (acc: number, s: any) =>
      acc +
      (s.billingCycle === "monthly" ? Number(s.amount) : Number(s.amount) / 12),
    0,
  );

  const monthlyData = useMemo(() => {
    const grouped = new Map();
    transactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped.has(key))
        grouped.set(key, {
          month: date.toLocaleString("es-ES", { month: "short" }),
          ingresos: 0,
          gastos: 0,
        });
      const e = grouped.get(key);
      if (tx.type === "income") e.ingresos += Number(tx.amount ?? 0);
      else e.gastos += Number(tx.amount ?? 0);
    });
    return Array.from(grouped.values()).slice(-6);
  }, [transactions]);

  const categoryExpenses = useMemo(() => {
    const map = new Map();
    transactions
      .filter((t: any) => t.type === "expense")
      .forEach((t: any) => {
        const cat = String(t.category ?? "Sin categoría").trim();
        map.set(cat, (map.get(cat) ?? 0) + Number(t.amount ?? 0));
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

  if (loading)
    return <div className="p-8 text-center">Cargando dashboard...</div>;

  return (
    <div className="space-y-5 w-full min-w-0">
      {/* Greeting */}
      <div className="min-w-0">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground break-words">
          Buenos días,{" "}
          {user?.displayName ?? user?.email?.split("@")[0] ?? "Usuario"} 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          Resumen de tus finanzas •{" "}
          {now.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Ingresos"
          value={formatCOP(totalIncome)}
          subtitle={now.toLocaleString("es-ES", { month: "long" })}
          trendUp
          icon={<TrendingUp size={18} color="#059669" />}
          iconBg="#d1fae5"
        />
        <StatCard
          title="Gastos"
          value={formatCOP(totalExpense)}
          subtitle={now.toLocaleString("es-ES", { month: "long" })}
          trendUp={false}
          icon={<TrendingDown size={18} color="#ef4444" />}
          iconBg="#fee2e2"
        />
        <StatCard
          title="Disponible"
          value={formatCOP(balance)}
          subtitle="Saldo libre"
          icon={<Wallet size={18} color="#0ea5e9" />}
          iconBg="#dbeafe"
        />
        <StatCard
          title="Ahorro"
          value={`${savingsRate}%`}
          subtitle={`${formatCOP(balance)} ahorrados`}
          trendUp
          icon={<PiggyBank size={18} color="#8b5cf6" />}
          iconBg="#ede9fe"
        />
      </div>

      {/* Budget + Subscriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
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
          <div className="flex justify-between mt-3 text-xs text-muted-foreground gap-2 flex-wrap">
            <span>{formatCOP(totalSpent)} gastados</span>
            <span>de {formatCOP(totalBudget)}</span>
          </div>
        </Card>

        <Card className="p-5">
          <p className="uppercase text-xs tracking-widest font-semibold text-muted-foreground mb-1">
            Suscripciones activas
          </p>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {formatCOP(totalSubscriptionsMonthly)}
          </p>
          <p className="text-sm text-muted-foreground">
            {activeSubscriptions.length} suscripciones
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 p-4 min-w-0 overflow-hidden">
          <h3 className="font-semibold mb-3 text-foreground text-sm sm:text-base">
            Evolución últimos meses
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={
                monthlyData.length
                  ? monthlyData
                  : [{ month: "Sin datos", ingresos: 0, gastos: 0 }]
              }
              margin={{ top: 5, right: 5, bottom: 5, left: -25 }}
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
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: 12,
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

        <Card className="p-4 min-w-0 overflow-hidden">
          <h3 className="font-semibold mb-3 text-foreground text-sm sm:text-base">
            Gastos por categoría
          </h3>
          <div className="flex justify-center">
            <PieChart width={120} height={120}>
              <Pie
                data={categoryExpenses}
                cx={60}
                cy={60}
                innerRadius={34}
                outerRadius={56}
                dataKey="value"
              >
                {categoryExpenses.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-1.5 mt-3">
            {categoryExpenses.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center justify-between gap-2 min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 shrink-0 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs truncate">{c.name}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {formatCOP(c.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Próximos cobros + Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              Próximos cobros
            </h3>
            <button
              onClick={() => onNavigate("subscriptions")}
              className="text-xs text-primary flex items-center gap-1 hover:underline shrink-0"
            >
              Ver todos <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {activeSubscriptions.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No hay suscripciones activas
              </p>
            ) : (
              activeSubscriptions.slice(0, 3).map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center py-2 border-b last:border-0 gap-2 min-w-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{sub.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sub.nextBillingDate).toLocaleDateString(
                          "es-ES",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-sm shrink-0">
                    {formatCOP(sub.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              Actividad reciente
            </h3>
            <button
              onClick={() => onNavigate("transactions")}
              className="text-xs text-primary flex items-center gap-1 hover:underline shrink-0"
            >
              Ver todo <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {recentTx.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Aún no hay movimientos
              </p>
            ) : (
              recentTx.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-2 min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{tx.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.category}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-mono font-semibold text-sm shrink-0 ${tx.type === "income" ? "text-emerald-500" : ""}`}
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
