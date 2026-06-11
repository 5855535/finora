import { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, AlertCircle, X, Check } from 'lucide-react';
import { Card, Badge } from '../ui/Card';
import { mockAlerts, Alert } from '../../data/mockData';

const typeConfig = {
  danger: { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2', border: '#fecaca', label: 'Urgente', badge: 'danger' as const },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', label: 'Alerta', badge: 'warning' as const },
  info: { icon: Info, color: '#0ea5e9', bg: '#dbeafe', border: '#bfdbfe', label: 'Info', badge: 'info' as const },
  success: { icon: CheckCircle, color: '#059669', bg: '#d1fae5', border: '#a7f3d0', label: 'Positivo', badge: 'success' as const },
};

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'unread' | 'danger' | 'warning'>('all');

  const unread = alerts.filter(a => !a.read).length;
  const filtered = alerts.filter(a => {
    if (filter === 'unread') return !a.read;
    if (filter === 'danger') return a.type === 'danger';
    if (filter === 'warning') return a.type === 'warning';
    return true;
  });

  const markRead = (id: string) => setAlerts(as => as.map(a => a.id === id ? { ...a, read: true } : a));
  const dismiss = (id: string) => setAlerts(as => as.filter(a => a.id !== id));
  const markAllRead = () => setAlerts(as => as.map(a => ({ ...a, read: true })));

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total alertas', value: alerts.length, color: 'var(--foreground)' },
          { label: 'Sin leer', value: unread, color: '#ef4444' },
          { label: 'Urgentes', value: alerts.filter(a => a.type === 'danger').length, color: '#ef4444' },
          { label: 'Informativas', value: alerts.filter(a => a.type === 'info' || a.type === 'success').length, color: '#059669' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4">
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: 'var(--font-family-mono)', letterSpacing: '-0.02em' }}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'unread', label: `Sin leer (${unread})` },
            { key: 'danger', label: 'Urgentes' },
            { key: 'warning', label: 'Alertas' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key as typeof filter)} className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ background: filter === key ? 'var(--primary)' : 'var(--muted)', color: filter === key ? '#fff' : 'var(--muted-foreground)', border: 'none', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ color: 'var(--primary)', background: 'var(--accent)', border: 'none', cursor: 'pointer' }}>
            <Check size={13} /> Marcar todo como leído
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>¡Sin alertas pendientes!</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Estás al día con todas tus notificaciones.</p>
          </Card>
        ) : filtered.map(alert => {
          const config = typeConfig[alert.type];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className="p-4 rounded-xl border flex items-start gap-4 transition-all"
              style={{
                background: alert.read ? 'var(--card)' : config.bg,
                borderColor: alert.read ? 'var(--border)' : config.border,
                opacity: alert.read ? 0.75 : 1,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: alert.read ? 'var(--muted)' : 'white' }}>
                <Icon size={18} style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)' }}>{alert.title}</h3>
                    <Badge variant={config.badge}>{config.label}</Badge>
                    {!alert.read && <span className="w-2 h-2 rounded-full" style={{ background: config.color }} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', flexShrink: 0 }}>
                    {new Date(alert.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.83rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{alert.description}</p>
                {!alert.read && (
                  <button onClick={() => markRead(alert.id)} className="mt-2 text-xs font-medium" style={{ color: config.color, background: 'none', border: 'none', cursor: 'pointer' }}>
                    Marcar como leída
                  </button>
                )}
              </div>
              <button onClick={() => dismiss(alert.id)} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Configure alerts */}
      <Card className="p-5">
        <h3 style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Configurar alertas automáticas</h3>
        <div className="space-y-4">
          {[
            { label: 'Próximos cobros', desc: 'Avísame con anticipación antes de cada cargo de suscripción', enabled: true },
            { label: 'Presupuesto al 80%', desc: 'Notificar cuando un presupuesto alcanza el 80% del límite', enabled: true },
            { label: 'Presupuesto excedido', desc: 'Alerta inmediata cuando supero el presupuesto de una categoría', enabled: true },
            { label: 'Gastos inusuales', desc: 'Detectar y notificar gastos fuera de mi patrón habitual', enabled: false },
            { label: 'Meta de ahorro alcanzada', desc: 'Celebrar cuando alcanzo un objetivo de ahorro', enabled: true },
          ].map(({ label, desc, enabled }) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1">
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--foreground)' }}>{label}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>{desc}</p>
              </div>
              <ToggleSwitch enabled={enabled} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ToggleSwitch({ enabled: initialEnabled }: { enabled: boolean }) {
  const [on, setOn] = useState(initialEnabled);
  return (
    <button
      onClick={() => setOn(!on)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: on ? 'var(--primary)' : 'var(--switch-background)', border: 'none', cursor: 'pointer' }}
    >
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }} />
    </button>
  );
}
