import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStore } from '../../lib/store'

/* A QR-looking code: seeded from the URL, with the three finder squares. Decorative. */
export function FakeQR({ text, size = 132 }: { text: string; size?: number }) {
  const n = 25
  let seed = 0
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)
  const cells: string[] = []
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) if (!inFinder(x, y) && rand() > 0.52) cells.push(`M${x} ${y}h1v1h-1z`)
  const finder = (x: number, y: number) =>
    `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} role="img" aria-label={`QR code for ${text}`} className="ln-qr">
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="var(--sheet)" />
      <path d={cells.join('')} fill="var(--ink)" />
      <path d={finder(0, 0) + finder(n - 7, 0) + finder(0, n - 7)} fill="var(--ink)" fillRule="evenodd" />
    </svg>
  )
}

/* ---------------- Secrets editor (Developer mode) ---------------- */

export type Secret = {
  key: string
  value: string
  source: 'vault' | 'managed' | 'you' | 'missing'
  preview: boolean
  prod: boolean
}

export function SecretsEditor({ secrets, setSecrets }: { secrets: Secret[]; setSecrets: (s: Secret[]) => void }) {
  const { toast } = useStore()
  const [k, setK] = useState('')
  const [v, setV] = useState('')
  const [shown, setShown] = useState<string[]>([])
  const keyOk = /^[A-Z][A-Z0-9_]{1,40}$/.test(k)
  const dupe = secrets.some((s) => s.key === k)

  const mask = (s: Secret) => {
    if (s.source === 'vault') return 'vault://shopify/glow-and-co'
    if (s.source === 'managed') return 'managed · rotates every 30 days'
    if (s.source === 'missing') return 'not set'
    return shown.includes(s.key) ? s.value : '•'.repeat(10) + s.value.slice(-4)
  }
  const toggle = (key: string, scope: 'preview' | 'prod') =>
    setSecrets(secrets.map((s) => (s.key === key ? { ...s, [scope]: !s[scope] } : s)))

  return (
    <div className="ln-secrets">
      <div className="ln-srow ln-shead label">
        <span>Key</span>
        <span>Value</span>
        <span>Preview</span>
        <span>Production</span>
        <span />
      </div>
      {secrets.map((s) => (
        <div key={s.key} className="ln-srow">
          <span className="mono ln-skey">{s.key}</span>
          <span className={'mono ln-sval' + (s.source === 'missing' ? ' is-missing' : '')}>{mask(s)}</span>
          <label className="ln-check">
            <input type="checkbox" checked={s.preview} onChange={() => toggle(s.key, 'preview')} aria-label={`${s.key} in preview`} />
          </label>
          <label className="ln-check">
            <input type="checkbox" checked={s.prod} onChange={() => toggle(s.key, 'prod')} aria-label={`${s.key} in production`} />
          </label>
          <span className="row" style={{ gap: 2, justifyContent: 'flex-end' }}>
            {s.source === 'you' && (
              <>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  aria-label={shown.includes(s.key) ? 'Hide value' : 'Show value'}
                  onClick={() => setShown(shown.includes(s.key) ? shown.filter((x) => x !== s.key) : [...shown, s.key])}
                >
                  <Icon name="eye" size={13} />
                </button>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  aria-label={'Delete ' + s.key}
                  onClick={() => {
                    setSecrets(secrets.filter((x) => x.key !== s.key))
                    toast(`${s.key} deleted.`)
                  }}
                >
                  <Icon name="x" size={13} />
                </button>
              </>
            )}
            {s.source !== 'you' && <Icon name="lock" size={13} />}
          </span>
        </div>
      ))}
      <form
        className="ln-srow ln-sadd"
        onSubmit={(e) => {
          e.preventDefault()
          if (!keyOk || dupe || !v) return
          setSecrets([...secrets, { key: k, value: v, source: 'you', preview: true, prod: true }])
          setK('')
          setV('')
          toast(`${k} saved to the vault.`)
        }}
      >
        <input className="input mono" placeholder="NEW_KEY" value={k} onChange={(e) => setK(e.target.value.toUpperCase())} aria-label="New key" />
        <input className="input mono" type="password" placeholder="value" value={v} onChange={(e) => setV(e.target.value)} aria-label="New value" />
        <button className="btn btn-line btn-sm" type="submit" disabled={!keyOk || dupe || !v}>
          <Icon name="plus" size={13} /> Add
        </button>
      </form>
      {k && !keyOk && <small className="ln-err">Keys are CAPITALS, numbers and underscores.</small>}
      {dupe && <small className="ln-err">{k} already exists.</small>}
    </div>
  )
}
