import {
  ArrowRight,
  Shield,
  TrendingUp,
  Bell,
  PieChart,
  Target,
  Zap,
  Star,
  ChevronRight,
  Check,
} from "lucide-react";

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const features = [
  {
    icon: TrendingUp,
    title: "Control total de gastos",
    desc: "Registra y categoriza cada movimiento de dinero con inteligencia automática.",
    color: "#059669",
  },
  {
    icon: PieChart,
    title: "Presupuestos inteligentes",
    desc: "Define límites por categoría y recibe alertas antes de excederlos.",
    color: "#0ea5e9",
  },
  {
    icon: Bell,
    title: "Alertas en tiempo real",
    desc: "Nunca te sorprendas por un cobro inesperado o suscripción olvidada.",
    color: "#f59e0b",
  },
  {
    icon: Target,
    title: "Metas de ahorro",
    desc: "Establece objetivos y sigue tu progreso mes a mes hacia tus metas.",
    color: "#8b5cf6",
  },
  {
    icon: Shield,
    title: "Gestión de suscripciones",
    desc: "Visualiza todas tus suscripciones activas y cuánto gastas en ellas.",
    color: "#ef4444",
  },
];

const testimonials = [
  {
    name: "Ana García",
    role: "Diseñadora UX",
    avatar: "AG",
    text: "Finora me ayudó a ahorrar €400 al mes simplemente organizando mis gastos. ¡Es increíble lo que no sabía que gastaba!",
    rating: 5,
  },
  {
    name: "Carlos Mendez",
    role: "Ingeniero de software",
    avatar: "CM",
    text: "La vista de suscripciones me permitió cancelar 4 servicios que ni recordaba tener. Ahorro €60 al mes.",
    rating: 5,
  },
  {
    name: "Laura Sánchez",
    role: "Profesora",
    avatar: "LS",
    text: "Los presupuestos visuales son perfectos. Ahora toda mi familia tiene claro en qué gastamos cada mes.",
    rating: 5,
  },
];

export function Landing({ onGetStarted, onLogin }: LandingProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          background: "rgba(255,255,255,0.9)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FinoraLogo />
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.25rem",
                letterSpacing: "-0.025em",
                color: "var(--foreground)",
              }}
            >
              Finora
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Funciones", "Precios", "Testimonios"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  fontSize: "0.9rem",
                  color: "var(--muted-foreground)",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--foreground)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--muted-foreground)")
                }
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              style={{
                fontSize: "0.875rem",
                color: "var(--muted-foreground)",
                fontWeight: 500,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: "var(--primary)" }}
            >
              Empezar gratis <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #059669 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
            style={{ borderColor: "#a7f3d0", background: "#ecfdf5" }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#059669" }}
            />
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--foreground)",
              lineHeight: 1.08,
              marginBottom: "1.5rem",
            }}
          >
            Tus finanzas,
            <br />
            <span style={{ color: "var(--primary)" }}>bajo control</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "var(--muted-foreground)",
              maxWidth: "580px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
            }}
          >
            Finora es la app de finanzas personales que te da una visión clara
            de tus ingresos, gastos, suscripciones y metas de ahorro en un solo
            lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onGetStarted}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base"
              style={{ background: "var(--primary)" }}
            >
              Empezar gratis <ArrowRight size={16} />
            </button>
            <button
              onClick={onLogin}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base border"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
                background: "var(--card)",
              }}
            >
              Ver demo
            </button>
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--muted-foreground)",
              marginTop: "1rem",
            }}
          >
            Gratis para siempre · Sin tarjeta de crédito · Configura en 2
            minutos
          </p>
        </div>

        {/* App preview */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          <div
            className="rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section
        className="py-12 border-y"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "50K+", label: "Usuarios activos" },
            { value: "€2.4M", label: "Ahorro generado" },
            { value: "4.9★", label: "Valoración media" },
            { value: "98%", label: "Satisfacción" },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--primary)",
                  fontFamily: "var(--font-family-mono)",
                  letterSpacing: "-0.02em",
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--muted-foreground)",
                  marginTop: "0.25rem",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="funciones" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
              }}
            >
              Todo lo que necesitas
            </h2>
            <p
              style={{
                color: "var(--muted-foreground)",
                marginTop: "0.75rem",
                fontSize: "1.05rem",
              }}
            >
              Herramientas financieras de nivel profesional, diseñadas para
              todos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    color: "var(--foreground)",
                    marginBottom: "0.5rem",
                    fontSize: "1rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="precios"
        className="py-20 px-4"
        style={{ background: "var(--card)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
              }}
            >
              Precios simples y justos
            </h2>
            <p
              style={{ color: "var(--muted-foreground)", marginTop: "0.75rem" }}
            >
              Empieza gratis, actualiza cuando quieras.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PricingCard
              plan="Gratuito"
              price="€0"
              period="/mes"
              features={[
                "Hasta 50 movimientos/mes",
                "2 presupuestos",
                "1 objetivo de ahorro",
                "Dashboard básico",
              ]}
              cta="Empezar gratis"
              onCta={onGetStarted}
            />
            <PricingCard
              plan="Pro"
              price="€4.99"
              period="/mes"
              features={[
                "Movimientos ilimitados",
                "Presupuestos ilimitados",
                "Objetivos ilimitados",
                "Exportar datos",
                "Soporte prioritario",
              ]}
              cta="Probar 30 días gratis"
              onCta={onGetStarted}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--foreground)",
              }}
            >
              Lo que dicen nuestros usuarios
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, avatar, text, rating }) => (
              <div
                key={name}
                className="p-6 rounded-2xl border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="#f59e0b"
                      style={{ color: "#f59e0b" }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--foreground)",
                    lineHeight: 1.7,
                    marginBottom: "1.25rem",
                  }}
                >
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "var(--primary)" }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--foreground)",
                      }}
                    >
                      {name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="p-12 rounded-3xl"
            style={{ background: "var(--primary)" }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
              }}
            >
              Empieza a controlar tu dinero hoy
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                marginBottom: "2rem",
                fontSize: "1.05rem",
              }}
            >
              Únete a más de 50,000 personas que ya gestionan sus finanzas con
              Finora.
            </p>
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 mx-auto px-8 py-3.5 rounded-xl font-semibold text-base"
              style={{ background: "#fff", color: "var(--primary)" }}
            >
              Crear cuenta gratuita <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-8 px-4"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FinoraLogo />
            <span style={{ fontWeight: 700, color: "var(--foreground)" }}>
              Finora
            </span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            © 2024 Finora. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            {["Privacidad", "Términos", "Contacto"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted-foreground)",
                  textDecoration: "none",
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({
  plan,
  price,
  period,
  features,
  cta,
  onCta,
  highlighted,
}: {
  plan: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  onCta: () => void;
  highlighted?: boolean;
}) {
  return (
    <div
      className="p-7 rounded-2xl border"
      style={{
        background: highlighted ? "var(--primary)" : "var(--card)",
        borderColor: highlighted ? "transparent" : "var(--border)",
      }}
    >
      <p
        style={{
          fontWeight: 700,
          color: highlighted ? "#fff" : "var(--muted-foreground)",
          marginBottom: "0.5rem",
        }}
      >
        {plan}
      </p>
      <div className="flex items-end gap-1 mb-1">
        <span
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            color: highlighted ? "#fff" : "var(--foreground)",
            fontFamily: "var(--font-family-mono)",
            letterSpacing: "-0.03em",
          }}
        >
          {price}
        </span>
        <span
          style={{
            color: highlighted
              ? "rgba(255,255,255,0.7)"
              : "var(--muted-foreground)",
            marginBottom: "0.5rem",
          }}
        >
          {period}
        </span>
      </div>
      <ul className="space-y-2 my-6">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2"
            style={{
              fontSize: "0.875rem",
              color: highlighted
                ? "rgba(255,255,255,0.9)"
                : "var(--foreground)",
            }}
          >
            <Check
              size={15}
              style={{
                color: highlighted ? "#a7f3d0" : "var(--primary)",
                flexShrink: 0,
              }}
            />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onCta}
        className="w-full py-2.5 rounded-xl font-semibold text-sm"
        style={{
          background: highlighted ? "#fff" : "var(--primary)",
          color: highlighted ? "var(--primary)" : "#fff",
        }}
      >
        {cta}
      </button>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div
      className="p-6"
      style={{ background: "var(--background)", minHeight: "320px" }}
    >
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: "Ingresos", value: "€4,670", color: "#059669" },
          { label: "Gastos", value: "€2,730", color: "#ef4444" },
          { label: "Disponible", value: "€1,940", color: "#0ea5e9" },
          { label: "Ahorro", value: "41.5%", color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-3 rounded-xl border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                color: "var(--muted-foreground)",
                fontWeight: 500,
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color,
                fontFamily: "var(--font-family-mono)",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div
          className="col-span-2 p-4 rounded-xl border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            height: "140px",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              marginBottom: "8px",
            }}
          >
            EVOLUCIÓN MENSUAL
          </p>
          <div className="flex items-end gap-2 h-20">
            {[60, 75, 55, 70, 80, 65].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${h}%`,
                  background: i === 5 ? "var(--primary)" : "var(--muted)",
                }}
              />
            ))}
          </div>
        </div>
        <div
          className="p-4 rounded-xl border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              marginBottom: "8px",
            }}
          >
            SUSCRIPCIONES
          </p>
          <p
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              color: "var(--foreground)",
              fontFamily: "var(--font-family-mono)",
            }}
          >
            €227
          </p>
          <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>
            10 activas / mes
          </p>
          <div className="mt-3 space-y-1">
            {["Netflix", "Spotify", "Adobe"].map((s) => (
              <div key={s} className="flex items-center justify-between">
                <span
                  style={{ fontSize: "0.65rem", color: "var(--foreground)" }}
                >
                  {s}
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinoraLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="8" fill="#059669" />
      <path d="M8 8h12v3H11v3h7v3h-7v6H8V8z" fill="white" />
    </svg>
  );
}
