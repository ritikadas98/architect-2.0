import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStore } from '../../lib/store'

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', hint: 'sk-ant-…', prefix: 'sk-ant-' },
  { id: 'openai', name: 'OpenAI', hint: 'sk-…', prefix: 'sk-' },
  { id: 'google', name: 'Google', hint: 'AIza…', prefix: 'AIza' },
  { id: 'openrouter', name: 'OpenRouter', hint: 'sk-or-…', prefix: 'sk-or-' },
]

type Status = 'idle' | 'busy' | 'ok' | 'bad'

function KeyRow({ p }: { p: (typeof PROVIDERS)[number] }) {
  const { toast } = useStore()
  const [val, setVal] = useState('')
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  const test = () => {
    setStatus('busy')
    setTimeout(() => {
      const ok = val.trim().startsWith(p.prefix) && val.trim().length > p.prefix.length + 8
      setStatus(ok ? 'ok' : 'bad')
      if (ok) toast(`${p.name} key saved to the vault.`)
    }, 1100)
  }

  return (
    <div className="st-krow">
      <div className="col" style={{ gap: 0 }}>
        <strong style={{ fontSize: 13.5 }}>{p.name}</strong>
        {status === 'ok' && <span className="badge badge-green" style={{ justifySelf: 'start', width: 'fit-content' }}><Icon name="check" size={11} /> Works</span>}
        {status === 'bad' && <span style={{ color: 'var(--red-text)', fontSize: 12 }}>Didn’t work. Check it starts with {p.prefix}</span>}
        {status === 'idle' && <span className="muted" style={{ fontSize: 12 }}>{val ? 'Not tested' : 'Using Architect’s'}</span>}
        {status === 'busy' && <span className="muted" style={{ fontSize: 12 }}>Testing…</span>}
      </div>
      <div className="st-inputwrap">
        <label className="sr-only" htmlFor={'key-' + p.id}>{p.name} API key</label>
        <input
          id={'key-' + p.id}
          className="input mono"
          style={{ fontSize: 13 }}
          type={show ? 'text' : 'password'}
          autoComplete="off"
          spellCheck={false}
          placeholder={p.hint}
          value={val}
          onChange={(e) => {
            setVal(e.target.value)
            setStatus('idle')
          }}
        />
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide key' : 'Show key'}>
          <Icon name={show ? 'lock' : 'eye'} size={14} />
        </button>
      </div>
      <button className="btn btn-sm" onClick={test} disabled={!val.trim() || status === 'busy'}>
        {status === 'busy' ? <span className="spinner" /> : <Icon name="bolt" size={13} />}
        Test
      </button>
    </div>
  )
}

export function KeysTab() {
  const { mode, toast } = useStore()
  const [pat, setPat] = useState<string | null>(null)
  const [patMade, setPatMade] = useState(false)

  const generate = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let s = 'arch_pat_'
    for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)]
    setPat(s)
    setPatMade(true)
  }

  return (
    <>
      <header className="st-h">
        <span className="label">API keys</span>
        <h1>Bring your own keys.</h1>
        <p>Optional. With your own key, model costs go on your bill, not your credits.</p>
      </header>

      <section className="st-sec">
        <div className="sheet">
          {PROVIDERS.map((p) => (
            <KeyRow key={p.id} p={p} />
          ))}
        </div>
        <div className="row" style={{ gap: 10, alignItems: 'flex-start', fontSize: 13 }}>
          <Icon name="lock" size={16} style={{ marginTop: 2, color: 'var(--blue)' }} />
          <p style={{ color: 'var(--ink-2)' }}>
            Keys are stored encrypted in the vault. The apps you build never see them. They get a stand-in, and the real key is added on the way out.
            {mode === 'dev' && <span className="mono muted" style={{ display: 'block', fontSize: 11.5, marginTop: 4 }}>AES-256 at rest · egress proxy injects Authorization · app env holds placeholder only</span>}
          </p>
        </div>
      </section>

      <hr className="divider" />

      <section className="st-sec">
        <h2>Personal access token for the CLI</h2>
        <p className="st-sub">For <code>architect</code> in your terminal, and for MCP clients like Claude Code or Cursor.</p>
        <div className="sheet" style={{ padding: 16, display: 'grid', gap: 12 }}>
          {pat ? (
            <>
              <div className="row" style={{ gap: 8 }}>
                <code className="grow" style={{ padding: '9px 11px', background: 'var(--paper-2)', borderRadius: 3, fontSize: 12.5, overflowWrap: 'anywhere' }}>{pat}</code>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(pat).catch(() => {})
                    toast('Copied. Paste it somewhere safe.')
                  }}
                >
                  <Icon name="copy" size={13} /> Copy
                </button>
              </div>
              <p style={{ color: 'var(--red-text)', fontSize: 13 }}>I’ll show this once. If you lose it, make a new one.</p>
              <button className="btn btn-sm btn-line" style={{ justifySelf: 'start' }} onClick={() => setPat(null)}>
                I’ve saved it
              </button>
            </>
          ) : (
            <div className="row between wrap" style={{ gap: 10 }}>
              <div className="col" style={{ gap: 0 }}>
                <strong style={{ fontSize: 13.5 }}>{patMade ? 'arch_pat_••••••••••••' : 'No token yet'}</strong>
                <span className="muted" style={{ fontSize: 12.5 }}>{patMade ? 'Created just now · never used' : 'Make one to use Architect from your terminal.'}</span>
              </div>
              <div className="row">
                {patMade && (
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      setPatMade(false)
                      toast('Token revoked. Anything using it stops working now.')
                    }}
                  >
                    Revoke
                  </button>
                )}
                <button className="btn btn-sm" onClick={generate}>
                  <Icon name="key" size={13} /> {patMade ? 'Make a new one' : 'Generate token'}
                </button>
              </div>
            </div>
          )}
          <pre className="mono muted" style={{ margin: 0, fontSize: 11.5, whiteSpace: 'pre-wrap' }}>
{`$ npm i -g @architect/cli
$ architect login --token arch_pat_…
$ architect pull glow-support`}
          </pre>
        </div>
      </section>
    </>
  )
}
