import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { useStore, type Mode } from '../lib/store'

export function Logo({ size = 22, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <span className="row" style={{ gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="4" fill="var(--ink)" />
        <path d="M8 24 16 7l8 17" fill="none" stroke="var(--paper)" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M11.2 18h9.6" stroke="var(--red)" strokeWidth="2.6" />
      </svg>
      {withWord && (
        <span style={{ fontWeight: 800, fontStretch: '118%', letterSpacing: '-0.01em', fontSize: 15 }}>
          Architect <span style={{ color: 'var(--red)' }}>2.0</span>
        </span>
      )}
    </span>
  )
}

export function Modal({
  title,
  sub,
  onClose,
  children,
  foot,
  wide,
}: {
  title: React.ReactNode
  sub?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  foot?: React.ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' modal-wide' : '')} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="col" style={{ gap: 4 }}>
            <h3 style={{ fontSize: 18 }}>{title}</h3>
            {sub && <p className="muted" style={{ fontSize: 13 }}>{sub}</p>}
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {foot && <div className="modal-foot">{foot}</div>}
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <Icon name="check" size={14} />
          {t.msg}
        </div>
      ))}
    </div>
  )
}

export function ModeToggle({ compact }: { compact?: boolean }) {
  const { mode, setMode } = useStore()
  const opts: { id: Mode; label: string; icon: IconName }[] = [
    { id: 'simple', label: 'Simple', icon: 'eye' },
    { id: 'dev', label: 'Developer', icon: 'code' },
  ]
  return (
    <div className="seg" role="group" aria-label="View">
      {opts.map((o) => (
        <button
          key={o.id}
          className={mode === o.id ? 'is-on' : ''}
          onClick={() => setMode(o.id)}
          title={o.id === 'simple' ? 'Plain language, no code' : 'Code, terminal, agent traces'}
        >
          <Icon name={o.icon} size={13} />
          {!compact && o.label}
        </button>
      ))}
    </div>
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useStore()
  return (
    <button
      className="btn btn-ghost btn-icon btn-sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={theme === 'light' ? 'Blueprint (dark) theme' : 'Paper (light) theme'}
      title={theme === 'light' ? 'Blueprint theme' : 'Paper theme'}
    >
      <Icon name={theme === 'light' ? 'moon' : 'sun'} />
    </button>
  )
}

export function CreditsPill() {
  const { credits } = useStore()
  return (
    <Link to="/settings/usage" className="chip" style={{ textDecoration: 'none' }} title="Credits left this month">
      <Icon name="coin" size={13} />
      <span className="mono" style={{ fontSize: 12 }}>{credits.balance}</span>
    </Link>
  )
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--red)',
        color: '#fff',
        display: 'inline-grid',
        placeItems: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        flex: 'none',
      }}
    >
      {initials || 'A'}
    </span>
  )
}

/** A handwritten margin note from the AI — used wherever it made a guess. */
export function Redline({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span className="redline-note row" style={{ gap: 6, alignItems: 'flex-start', ...style }}>
      <svg width="18" height="14" viewBox="0 0 18 14" style={{ flex: 'none', marginTop: 3 }} aria-hidden="true">
        <path d="M1 12c4-1 8-5 10-10M11 2l-3 .5M11 2l.6 3" fill="none" stroke="var(--red)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </span>
  )
}

export function Empty({ icon, title, sub, action }: { icon: IconName; title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="card dashed col" style={{ alignItems: 'center', textAlign: 'center', padding: 32, gap: 10 }}>
      <Icon name={icon} size={22} />
      <h4 style={{ fontSize: 15 }}>{title}</h4>
      <p className="muted" style={{ maxWidth: 360 }}>{sub}</p>
      {action}
    </div>
  )
}

export function Steps({ current }: { current: number }) {
  const steps = ['Brief', 'Blueprint', 'Build', 'Inspect', 'Launch']
  return (
    <ol className="row" style={{ listStyle: 'none', margin: 0, padding: 0, gap: 4 }} aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className="row" style={{ gap: 4 }}>
          <span
            className="mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 7px',
              borderRadius: 3,
              background: i === current ? 'var(--ink)' : 'transparent',
              color: i === current ? 'var(--on-ink)' : i < current ? 'var(--ink-2)' : 'var(--ink-4)',
              border: '1px solid ' + (i <= current ? 'var(--ink)' : 'var(--rule)'),
            }}
          >
            {i < current ? '✓ ' : ''}
            {s}
          </span>
          {i < steps.length - 1 && <span style={{ width: 10, height: 1, background: 'var(--rule-strong)' }} />}
        </li>
      ))}
    </ol>
  )
}
