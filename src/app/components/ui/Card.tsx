import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className = "", style, onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl border ${className} ${onClick ? "cursor-pointer" : ""}`}
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-5 pt-5 pb-0 ${className}`}>{children}</div>;
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-5 py-5 ${className}`}>{children}</div>;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendUp,
  icon,
  iconBg,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon?: ReactNode;
  iconBg?: string;
}) {
  return (
    <Card className="p-3 sm:p-5 overflow-hidden">
      <div className="flex items-start justify-between gap-1">
        {/* Texto — min-w-0 + overflow-hidden evitan que desborde */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <p
            className="truncate"
            style={{
              fontSize: "0.7rem",
              color: "var(--muted-foreground)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {title}
          </p>

          {/* Valor: fuente adaptable según ancho */}
          <p
            className="truncate"
            style={{
              fontSize: "clamp(0.95rem, 3.5vw, 1.6rem)", // ← clave: se achica automáticamente
              fontWeight: 700,
              color: "var(--foreground)",
              fontFamily: "var(--font-family-mono)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginTop: "0.2rem",
            }}
          >
            {value}
          </p>

          {subtitle && (
            <p
              className="truncate"
              style={{
                fontSize: "0.7rem",
                color: "var(--muted-foreground)",
                marginTop: "0.2rem",
              }}
            >
              {subtitle}
            </p>
          )}

          {trend && (
            <p
              style={{
                fontSize: "0.7rem",
                color: trendUp ? "#059669" : "#ef4444",
                fontWeight: 600,
                marginTop: "0.3rem",
              }}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>

        {/* Ícono — se oculta en pantallas muy pequeñas para dar espacio */}
        {icon && (
          <div
            className="hidden xs:flex sm:flex w-9 h-9 sm:w-11 sm:h-11 rounded-xl items-center justify-center flex-shrink-0"
            style={{ background: iconBg || "var(--muted)" }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "var(--muted)", color: "var(--muted-foreground)" },
    success: { background: "#d1fae5", color: "#065f46" },
    warning: { background: "#fef3c7", color: "#92400e" },
    danger: { background: "#fee2e2", color: "#991b1b" },
    info: { background: "#dbeafe", color: "#1e40af" },
    secondary: {
      background: "var(--secondary)",
      color: "var(--secondary-foreground)",
    },
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap"
      style={styles[variant]}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor =
    color || (pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#059669");
  return (
    <div
      className="w-full h-2 rounded-full overflow-hidden"
      style={{ background: "var(--muted)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: barColor }}
      />
    </div>
  );
}
