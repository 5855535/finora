import { ReactNode } from 'react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'var(--font-family)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12" style={{ background: 'var(--primary)' }}>
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="rgba(255,255,255,0.2)" />
            <path d="M8 8h12v3H11v3h7v3h-7v6H8V8z" fill="white" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.025em' }}>Finora</span>
        </div>
        <div>
          <blockquote style={{ fontSize: '1.4rem', fontWeight: 600, color: '#fff', lineHeight: 1.4, marginBottom: '1.5rem' }}>
            "Finora me dio claridad sobre mis finanzas. Ahora sé exactamente en qué gasto mi dinero."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>MR</div>
            <div>
              <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>María Rodríguez</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Marketing Manager</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === 1 ? '#fff' : 'rgba(255,255,255,0.4)' }} />)}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#059669" />
              <path d="M8 8h12v3H11v3h7v3h-7v6H8V8z" fill="white" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>Finora</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--foreground)', marginBottom: '0.5rem' }}>{title}</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)', marginBottom: '2rem' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function FormInput({ label, type = 'text', placeholder, value, onChange, error }: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-lg border outline-none transition-all"
        style={{
          background: 'var(--card)',
          borderColor: error ? '#ef4444' : 'var(--border)',
          color: 'var(--foreground)',
          fontSize: '0.9rem',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
      />
      {error && <p style={{ fontSize: '0.75rem', color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

export function SubmitButton({ children, loading, onClick }: { children: ReactNode; loading?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-3 rounded-lg font-semibold text-white transition-all"
      style={{ background: loading ? '#6ee7b7' : 'var(--primary)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Cargando...
        </span>
      ) : children}
    </button>
  );
}
