import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { MODELS, ROUTING } from '../../data/demo'
import { useStore } from '../../lib/store'

const MODEL_NAMES = Array.from(new Set([...MODELS.filter((m) => m.id !== 'auto').map((m) => m.name), ...ROUTING.map((r) => r.model)]))

const AGENT_MODELS = [
  { name: 'GPT-5 mini', note: 'Cheap, fast, good at short support replies' },
  { name: 'Claude Sonnet 5', note: 'Better at long, careful answers' },
  { name: 'Claude Haiku 4.5', note: 'Cheapest. Fine for FAQs' },
  { name: 'Gemini 2.5 Pro', note: 'Reads long documents well' },
  { name: 'Llama 4 Maverick', note: 'Self-hosted. Data never leaves you' },
]

function radio(on: boolean, pick: () => void) {
  return {
    role: 'radio',
    'aria-checked': on,
    tabIndex: 0,
    onClick: pick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        pick()
      }
    },
  } as const
}

export function ModelsTab() {
  const { mode, toast } = useStore()
  const [pick, setPick] = useState<'auto' | 'custom'>('auto')
  const [custom, setCustom] = useState<Record<string, string>>(() => Object.fromEntries(ROUTING.map((r) => [r.task, r.model])))
  const [agentModel, setAgentModel] = useState('GPT-5 mini')
  const [priv, setPriv] = useState<'none' | 'llama' | 'endpoint'>('none')
  const [endpoint, setEndpoint] = useState('')
  const [testing, setTesting] = useState<'idle' | 'busy' | 'ok' | 'bad'>('idle')

  const testEndpoint = () => {
    if (!/^https?:\/\/\S+/.test(endpoint.trim())) {
      setTesting('bad')
      return
    }
    setTesting('busy')
    setTimeout(() => setTesting('ok'), 1300)
  }

  return (
    <>
      <header className="st-h">
        <span className="label">Models</span>
        <h1>Pick a model, or let me pick per task.</h1>
        <p>Switch any time. Your app, agents and history don’t change.</p>
      </header>

      <section className="st-sec">
        <h2>Architect’s own model</h2>
        <p className="st-sub">The model I use while I plan and build for you.</p>
        <div className={'st-opt' + (pick === 'auto' ? ' is-on' : '')} {...radio(pick === 'auto', () => setPick('auto'))}>
          <span className="st-radio" />
          <div className="col" style={{ gap: 12 }}>
            <div className="row wrap" style={{ gap: 8 }}>
              <strong style={{ fontSize: 17 }}>Auto</strong>
              <span className="badge badge-ink">Recommended</span>
            </div>
            <p className="muted" style={{ fontSize: 13.5 }}>I pick the cheapest model that does each task well. This is how most builds stay under estimate.</p>
            <div className="st-table">
              <div className="st-trow st-thead">
                <span className="label">Task</span>
                <span className="label">Model</span>
                <span className="label">Why</span>
              </div>
              {ROUTING.map((r) => (
                <div key={r.task} className="st-trow">
                  <span style={{ fontWeight: 600 }}>{r.task}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{r.model}</span>
                  <span className="muted">{r.why}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={'st-opt' + (pick === 'custom' ? ' is-on' : '')} {...radio(pick === 'custom', () => setPick('custom'))}>
          <span className="st-radio" />
          <div className="col" style={{ gap: 4 }}>
            <strong style={{ fontSize: 15 }}>Custom</strong>
            <p className="muted" style={{ fontSize: 13 }}>Choose the model for each task yourself.</p>
          </div>
        </div>
        {pick === 'custom' && (
          <div className="sheet rise">
            {ROUTING.map((r) => (
              <label key={r.task} className="st-krow" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,220px)' }}>
                <span className="col" style={{ gap: 0 }}>
                  <strong style={{ fontSize: 13.5 }}>{r.task}</strong>
                  {custom[r.task] !== r.model && <span className="muted" style={{ fontSize: 12 }}>Auto would use {r.model}</span>}
                </span>
                <select
                  className="select"
                  value={custom[r.task]}
                  onChange={(e) => {
                    setCustom((c) => ({ ...c, [r.task]: e.target.value }))
                    toast(`${r.task}: ${e.target.value}.`)
                  }}
                >
                  {MODEL_NAMES.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
      </section>

      <hr className="divider" />

      <section className="st-sec">
        <h2>Your app’s agents</h2>
        <p className="st-sub">The default model for agents inside the apps you build. Separate from mine.</p>
        <div className="sheet" style={{ padding: 6 }}>
          {AGENT_MODELS.map((m) => (
            <label key={m.name} className="row" style={{ padding: '10px 12px', gap: 12, cursor: 'pointer', borderRadius: 4, background: agentModel === m.name ? 'var(--sheet-2)' : undefined }}>
              <input
                type="radio"
                name="agent-model"
                checked={agentModel === m.name}
                onChange={() => {
                  setAgentModel(m.name)
                  toast(`New agents will use ${m.name}. Existing ones keep theirs.`)
                }}
                style={{ accentColor: 'var(--red)' }}
              />
              <span className="col grow" style={{ gap: 0 }}>
                <strong style={{ fontSize: 13.5 }}>{m.name}</strong>
                <span className="muted" style={{ fontSize: 12.5 }}>{m.note}</span>
              </span>
            </label>
          ))}
        </div>
        {mode === 'dev' && (
          <p className="mono muted" style={{ fontSize: 11.5 }}>
            architect.json → agents.defaultModel = "{agentModel.toLowerCase().replace(/\s+/g, '-')}" · override per agent in agents/*.py
          </p>
        )}
      </section>

      <hr className="divider" />

      <section className="st-sec">
        <h2>Open-source or private</h2>
        <p className="st-sub">For data that can’t leave your servers. Your app’s agents can run here.</p>
        <div className="seg" role="group" aria-label="Private model">
          {(
            [
              ['none', 'Off'],
              ['llama', 'Llama, self-hosted'],
              ['endpoint', 'Your own endpoint'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} className={priv === id ? 'is-on' : ''} onClick={() => { setPriv(id); setTesting('idle') }}>
              {label}
            </button>
          ))}
        </div>
        {priv === 'llama' && (
          <div className="card rise col" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 8 }}>
              <Icon name="cpu" size={16} />
              <strong>Llama 4 Maverick on your cloud</strong>
            </div>
            <p className="muted" style={{ fontSize: 13 }}>I give you a one-click deploy for AWS or GCP. You pay the cloud directly. I never see the traffic.</p>
            <div className="row wrap">
              <button className="btn btn-sm" onClick={() => toast('Demo: the deploy template would open in AWS.')}>Deploy to AWS</button>
              <button className="btn btn-sm btn-line" onClick={() => toast('Demo: the deploy template would open in GCP.')}>Deploy to GCP</button>
            </div>
          </div>
        )}
        {priv === 'endpoint' && (
          <div className="card rise col" style={{ gap: 12 }}>
            <label className="field">
              <span>OpenAI-compatible URL</span>
              <input
                className="input mono"
                style={{ fontSize: 13 }}
                placeholder="https://llm.yourcompany.com/v1"
                value={endpoint}
                onChange={(e) => { setEndpoint(e.target.value); setTesting('idle') }}
              />
            </label>
            <label className="field">
              <span>Key (optional)</span>
              <input className="input mono" type="password" style={{ fontSize: 13 }} placeholder="sk-…" autoComplete="off" />
            </label>
            <div className="row wrap">
              <button className="btn btn-sm" onClick={testEndpoint} disabled={!endpoint.trim() || testing === 'busy'}>
                {testing === 'busy' ? <span className="spinner" /> : <Icon name="bolt" size={13} />}
                {testing === 'busy' ? 'Testing' : 'Test it'}
              </button>
              {testing === 'ok' && <span className="badge badge-green"><Icon name="check" size={11} /> Works · 3 models found</span>}
              {testing === 'bad' && <span style={{ color: 'var(--red-text)', fontSize: 13 }}>That needs to be a full URL, starting with https://</span>}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
