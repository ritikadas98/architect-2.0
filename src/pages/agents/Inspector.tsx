import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Redline } from '../../components/ui'
import { MODELS } from '../../data/demo'
import { useStore } from '../../lib/store'
import type { AgentDef, EvalCase, Reply } from './data'
import { EVALS, TEST_PROMPTS, TOOLS, TOPICS, modelSlug, replyTo } from './data'

/* ---------------- Setup ---------------- */

export function SetupPanel({
  agent,
  onChange,
  onRemove,
}: {
  agent: AgentDef
  onChange: (patch: Partial<AgentDef>) => void
  onRemove?: () => void
}) {
  const { mode, toast } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const model = MODELS.find((m) => m.id === agent.model)
  return (
    <div className="col ag-pad" style={{ gap: 18 }}>
      <label className="field">
        <span>Name</span>
        <input className="input" value={agent.name} onChange={(e) => onChange({ name: e.target.value })} />
      </label>
      <label className="field">
        <span>Its job, in one line</span>
        <input
          className="input"
          value={agent.role}
          placeholder="e.g. Answers questions about sensitive skin"
          onChange={(e) => onChange({ role: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Instructions</span>
        <textarea
          className="textarea"
          rows={6}
          value={agent.instructions}
          placeholder="Write it like a note to a new hire. One rule per line."
          onChange={(e) => onChange({ instructions: e.target.value })}
        />
        <small className="muted">One rule per line works best. Saved as you type.</small>
      </label>

      <div className="field">
        <span>Model</span>
        <select className="select" value={agent.model} onChange={(e) => onChange({ model: e.target.value })}>
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} · {m.by}
            </option>
          ))}
        </select>
        <small className="muted">
          {model?.note}. Each agent can use a different model.
          {mode === 'dev' && (
            <>
              {' '}
              <span className="mono">{modelSlug(agent.model)}</span>
            </>
          )}
        </small>
      </div>

      <div className="field">
        <span>Tools it can use</span>
        <div className="row wrap" style={{ gap: 6 }}>
          {TOOLS.map((t) => {
            const on = agent.tools.includes(t.id)
            return (
              <button
                key={t.id}
                className={'chip' + (on ? ' is-on' : '')}
                aria-pressed={on}
                onClick={() => onChange({ tools: on ? agent.tools.filter((x) => x !== t.id) : [...agent.tools, t.id] })}
                title={t.note || t.dev}
              >
                {on && <Icon name="check" size={12} />}
                {mode === 'dev' ? <span className="mono" style={{ fontSize: 11.5 }}>{t.dev}</span> : t.label}
              </button>
            )
          })}
        </div>
        {agent.tools.includes('gmail') && (
          <Redline style={{ fontSize: 14 }}>Gmail isn’t connected. It’ll draft emails, not send them.</Redline>
        )}
        {agent.tools.includes('refund') && (
          <small className="muted">
            <Icon name="coin" size={12} /> This one touches money. Check its guardrails.
          </small>
        )}
      </div>

      <div className="field">
        <span>Knowledge</span>
        {agent.knowledge.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>No files. It answers from its instructions only.</p>
        ) : (
          <div className="col" style={{ gap: 4 }}>
            {agent.knowledge.map((f) => (
              <div key={f} className="row ag-file">
                <Icon name="file" size={14} />
                <span className="mono grow" style={{ fontSize: 12.5 }}>{f}</span>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  aria-label={'Remove ' + f}
                  onClick={() => onChange({ knowledge: agent.knowledge.filter((x) => x !== f) })}
                >
                  <Icon name="x" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            onChange({ knowledge: Array.from(new Set([...agent.knowledge, f.name])) })
            toast(`Added ${f.name}. I’ll read it before answering.`)
            e.target.value = ''
          }}
        />
        <div>
          <button className="btn btn-line btn-sm" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={13} /> Add a file
          </button>
        </div>
      </div>

      <div className="field">
        <span>Memory</span>
        <div className="row wrap" style={{ gap: 10 }}>
          <div className="seg" role="group" aria-label="Memory">
            <button className={agent.memory ? 'is-on' : ''} onClick={() => onChange({ memory: true })}>On</button>
            <button className={!agent.memory ? 'is-on' : ''} onClick={() => onChange({ memory: false })}>Off</button>
          </div>
          <small className="muted grow">
            {agent.memory
              ? mode === 'dev'
                ? 'Session + 30-day customer memory (keyed by verified email).'
                : 'Remembers a customer for 30 days. No need to repeat themselves.'
              : 'Starts fresh every chat.'}
          </small>
        </div>
      </div>

      {onRemove && (
        <div style={{ paddingTop: 6, borderTop: '1px solid var(--rule)' }}>
          <button className="btn btn-ghost btn-sm" onClick={onRemove}>
            <Icon name="x" size={13} /> Remove this agent
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------------- Guardrails ---------------- */

export function GuardrailsPanel({
  agent,
  onChange,
  limit,
  setLimit,
  limitInCode,
  onMoveToCode,
  moving,
}: {
  agent: AgentDef
  onChange: (patch: Partial<AgentDef>) => void
  limit: number
  setLimit: (n: number) => void
  limitInCode: boolean
  onMoveToCode: () => void
  moving: boolean
}) {
  const { mode } = useStore()
  const pct = Math.round(agent.confidence * 100)
  const reach = Math.max(1, Math.round((pct - 50) * 0.55 + 1))
  const money = agent.tools.includes('refund')
  return (
    <div className="col ag-pad" style={{ gap: 14 }}>
      <div className={'ag-guard ' + (limitInCode ? 'sheet-ink' : 'redline')}>
        <div className="row between wrap" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <Icon name="coin" size={16} />
            <h4 style={{ fontSize: 14.5 }}>Refund limit</h4>
          </div>
          {limitInCode ? (
            <span className="badge badge-green"><Icon name="lock" size={11} /> Enforced in code, not in the prompt</span>
          ) : (
            <span className="badge badge-red">Prompt only</span>
          )}
        </div>
        <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
          <span className="muted" style={{ fontSize: 13 }}>Approve on its own up to</span>
          <div className="row ag-money">
            <span>₹</span>
            <input
              className="input mono"
              type="number"
              min={0}
              step={100}
              value={limit}
              onChange={(e) => setLimit(Math.max(0, Number(e.target.value) || 0))}
              aria-label="Refund limit in rupees"
            />
          </div>
          <span className="muted" style={{ fontSize: 13 }}>Above that, it waits for you.</span>
        </div>
        {limitInCode ? (
          <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
            {mode === 'dev' ? (
              <span className="mono">lib/limits.ts · needsOwner(amount) runs before refunds.create()</span>
            ) : (
              'The AI can ask. Only the code can approve. No amount of arguing changes that.'
            )}
          </p>
        ) : (
          <div className="col" style={{ gap: 8, marginTop: 10 }}>
            <Redline>This limit only lives in the instructions right now. A clever customer can argue past it.</Redline>
            <div>
              <button className="btn btn-red btn-sm" onClick={onMoveToCode} disabled={moving}>
                {moving ? <span className="spinner" /> : <Icon name="lock" size={13} />}
                {moving ? 'Moving it into code…' : 'Move it into code'}
              </button>
            </div>
          </div>
        )}
        {!money && (
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            {agent.name} can’t issue refunds itself. The limit still applies app-wide.
          </p>
        )}
      </div>

      <div className="card">
        <div className="row between" style={{ gap: 10 }}>
          <div className="col" style={{ gap: 2 }}>
            <h4 style={{ fontSize: 14 }}>Hide personal details</h4>
            <p className="muted" style={{ fontSize: 12.5 }}>
              {mode === 'dev'
                ? 'PII pass on input: emails, phones, addresses → [EMAIL_1] before the model call.'
                : 'Phone numbers, emails and addresses are hidden before the AI reads them.'}
            </p>
          </div>
          <Switch on={agent.pii} onChange={(v) => onChange({ pii: v })} label="Hide personal details" />
        </div>
      </div>

      <div className="card col" style={{ gap: 8 }}>
        <h4 style={{ fontSize: 14 }}>What it’s allowed to talk about</h4>
        <div className="row wrap" style={{ gap: 6 }}>
          {TOPICS.map((t) => {
            const on = agent.topics.includes(t)
            return (
              <button
                key={t}
                className={'chip' + (on ? ' is-on' : '')}
                aria-pressed={on}
                onClick={() => onChange({ topics: on ? agent.topics.filter((x) => x !== t) : [...agent.topics, t] })}
              >
                {on && <Icon name="check" size={12} />}
                {t}
              </button>
            )
          })}
        </div>
        <p className="muted" style={{ fontSize: 12.5 }}>Anything else gets a polite “I can’t help with that” and a human.</p>
        {agent.topics.includes('Skin advice') && (
          <Redline style={{ fontSize: 14 }}>Skin advice is risky. I’d leave that to a person.</Redline>
        )}
      </div>

      <div className="card col" style={{ gap: 8 }}>
        <div className="row between">
          <h4 style={{ fontSize: 14 }}>Escalate to a human when unsure</h4>
          <span className="mono" style={{ fontWeight: 700 }}>{pct}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={95}
          step={5}
          value={pct}
          onChange={(e) => onChange({ confidence: Number(e.target.value) / 100 })}
          className="ag-range"
          aria-label="Confidence needed before answering alone"
        />
        <div className="row between label" style={{ fontSize: 9.5 }}>
          <span>Answers more itself</span>
          <span>Asks you more</span>
        </div>
        <p style={{ fontSize: 13 }}>
          Below {pct}% sure, it hands the chat to you. That’s about <b>{reach} in 100 chats</b>.
        </p>
      </div>
    </div>
  )
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className={'ag-switch' + (on ? ' is-on' : '')} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
      <i />
    </button>
  )
}

/* ---------------- Test ---------------- */

export type ChatMsg = { id: number; from: 'you' | 'agent'; text: string; reply?: Reply }

export function TestPanel({
  agent,
  log,
  setLog,
  limitInCode,
}: {
  agent: AgentDef
  log: ChatMsg[]
  setLog: (fn: (l: ChatMsg[]) => ChatMsg[]) => void
  limitInCode: boolean
}) {
  const { mode } = useStore()
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [log.length, thinking])

  const send = (msg: string) => {
    const m = msg.trim()
    if (!m || thinking) return
    setText('')
    setLog((l) => [...l, { id: Date.now(), from: 'you', text: m }])
    setThinking(true)
    const r = replyTo(m, agent, limitInCode)
    setTimeout(() => {
      setLog((l) => [...l, { id: Date.now() + 1, from: 'agent', text: r.text, reply: r }])
      setThinking(false)
    }, Math.min(1400, r.ms * 0.7))
  }

  return (
    <div className="ag-pad col" style={{ gap: 12 }}>
      <p className="muted" style={{ fontSize: 13 }}>
        Talk to {agent.name} like a customer would. Nothing here reaches real customers or real refunds.
      </p>
      <div className="ag-chat">
        {log.length === 0 && (
          <div className="col" style={{ gap: 8, padding: 4 }}>
            <span className="label">Try one of these</span>
            {TEST_PROMPTS.map((p) => (
              <button key={p} className="ag-suggest" onClick={() => send(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
        {log.map((m) =>
          m.from === 'you' ? (
            <div key={m.id} className="ag-bubble ag-you">{m.text}</div>
          ) : (
            <div key={m.id} className="col" style={{ gap: 6, alignItems: 'flex-start' }}>
              <div className="ag-bubble ag-bot">{m.text}</div>
              {m.reply && <Trace r={m.reply} open={mode === 'dev'} />}
            </div>
          ),
        )}
        {thinking && (
          <div className="row muted" style={{ fontSize: 12.5 }}>
            <span className="spinner" /> {agent.name} is thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          send(text)
        }}
      >
        <input
          className="input grow"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a customer message…"
          aria-label="Test message"
        />
        <button className="btn btn-primary" type="submit" disabled={!text.trim() || thinking} aria-label="Send">
          <Icon name="send" size={14} />
        </button>
      </form>
      {log.length > 0 && (
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => setLog(() => [])}>
            <Icon name="refresh" size={13} /> Start over
          </button>
        </div>
      )}
    </div>
  )
}

function Trace({ r, open }: { r: Reply; open: boolean }) {
  return (
    <details className="ag-trace" open={open}>
      <summary>
        <span className="label" style={{ color: 'inherit' }}>How it got there</span>
        <span className="mono">
          {r.steps.length} steps · {(r.ms / 1000).toFixed(2)}s · {r.tokens.toLocaleString('en-IN')} tokens · ₹{r.cost.toFixed(2)}
        </span>
      </summary>
      <ol>
        {r.steps.map((s, i) => (
          <li key={i} className={'ag-step ag-step-' + s.kind}>
            <span className="mono ag-t">{s.t}</span>
            <span className="grow">
              <b>{s.who}</b> <span className="ag-what">{s.what}</span>
            </span>
            {s.tokens > 0 && <span className="mono ag-tok">{s.tokens}t</span>}
          </li>
        ))}
      </ol>
    </details>
  )
}

/* ---------------- Evals ---------------- */

export function EvalsPanel({
  fixedEvals,
  onTeach,
}: {
  fixedEvals: string[]
  onTeach: () => Promise<void>
}) {
  const { mode, toast } = useStore()
  const [running, setRunning] = useState(false)
  const [teaching, setTeaching] = useState(false)
  const [ranAt, setRanAt] = useState('Before your last build')
  const failing = EVALS.filter((e) => e.fail && !fixedEvals.includes(e.id))
  const passing = EVALS.length - failing.length

  const run = () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setRanAt('Just now')
      toast(failing.length ? `${passing} of 20 passing. Same ${failing.length === 1 ? 'one' : 'two'} to look at.` : 'All 20 passing.')
    }, 1800)
  }

  return (
    <div className="ag-pad col" style={{ gap: 14 }}>
      <div className="row between wrap" style={{ gap: 10 }}>
        <div className="col" style={{ gap: 2 }}>
          <span className="label">Test cases · all three agents</span>
          <div className="row" style={{ gap: 10, alignItems: 'baseline' }}>
            <span className="mono ag-score">{running ? '··/20' : `${passing}/20`}</span>
            <span className="muted" style={{ fontSize: 13 }}>{running ? 'Running…' : 'passing'}</span>
          </div>
          <span className="muted" style={{ fontSize: 12 }}>Last run: {ranAt}</span>
        </div>
        <button className="btn btn-line" onClick={run} disabled={running}>
          {running ? <span className="spinner" /> : <Icon name="play" size={13} />}
          {running ? 'Running 20 cases…' : 'Run again'}
        </button>
      </div>
      <div className="bar" aria-hidden="true">
        <i style={{ width: running ? '40%' : `${(passing / 20) * 100}%`, background: failing.length ? 'var(--ink)' : 'var(--green)' }} />
      </div>

      {failing.length > 0 ? (
        <div className="col" style={{ gap: 8 }}>
          <h4 style={{ fontSize: 14 }}>What went wrong</h4>
          {failing.map((e) => (
            <div key={e.id} className="card ag-fail">
              <div className="row between" style={{ gap: 8 }}>
                <span className="badge badge-red">Failed</span>
                <span className="label">{e.agent}</span>
              </div>
              <p style={{ marginTop: 6 }}>{e.fail}</p>
              <p className="muted mono" style={{ fontSize: 12, marginTop: 4 }}>
                “{e.q}” · expected: {e.expect}
              </p>
            </div>
          ))}
          <div>
            <button
              className="btn btn-primary btn-sm"
              disabled={teaching}
              onClick={async () => {
                setTeaching(true)
                await onTeach()
                setTeaching(false)
              }}
            >
              {teaching ? <span className="spinner" /> : <Icon name="wand" size={13} />}
              {teaching ? 'Adding a rule to each…' : 'Teach it these two'}
            </button>
          </div>
          <small className="muted">I’ll add one line to each agent’s instructions, then re-run all 20.</small>
        </div>
      ) : (
        <div className="card row" style={{ gap: 10, borderColor: 'var(--green)' }}>
          <Icon name="shieldCheck" size={18} />
          <p>All 20 pass. I’ll re-run them before every launch.</p>
        </div>
      )}

      <details className="ag-all">
        <summary>All 20 cases</summary>
        <ul>
          {EVALS.map((e: EvalCase) => {
            const ok = !e.fail || fixedEvals.includes(e.id)
            return (
              <li key={e.id} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: ok ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
                  <Icon name={ok ? 'check' : 'x'} size={13} />
                </span>
                <span className="grow">
                  <span className="mono" style={{ fontSize: 12 }}>“{e.q}”</span>
                  <br />
                  <span className="muted" style={{ fontSize: 12 }}>
                    {e.agent} · {e.expect}
                  </span>
                </span>
                {mode === 'dev' && <span className="mono muted" style={{ fontSize: 11 }}>{e.ms}ms</span>}
              </li>
            )
          })}
        </ul>
      </details>
    </div>
  )
}

/* ---------------- Non-agent nodes ---------------- */

export function NodeInfo({
  id,
  agents,
  shopifyConnected,
  onConnectShopify,
  connecting,
}: {
  id: string
  agents: AgentDef[]
  shopifyConnected: boolean
  onConnectShopify: () => void
  connecting: boolean
}) {
  const { mode } = useStore()
  const usedBy = (tools: string[]) =>
    agents.filter((a) => a.tools.some((t) => tools.includes(t))).map((a) => a.name).join(', ') || 'No agent yet'
  if (id === 'tool:shopify')
    return (
      <div className="ag-pad col" style={{ gap: 12 }}>
        <span className="label">Tool</span>
        <h3 style={{ fontSize: 20 }}>Shopify</h3>
        {shopifyConnected ? (
          <span className="badge badge-blue" style={{ alignSelf: 'flex-start' }}>Connected · read only</span>
        ) : (
          <span className="badge badge-amber" style={{ alignSelf: 'flex-start' }}>Sample orders</span>
        )}
        <p>{shopifyConnected ? 'Answers come from your real orders.' : 'Right now the agents answer from 24 made-up orders.'}</p>
        <p className="muted" style={{ fontSize: 13 }}>Used by: {usedBy(['get_order', 'refund'])}</p>
        {mode === 'dev' && (
          <p className="mono muted" style={{ fontSize: 12 }}>
            scopes: read_orders, write_refunds (gated by limits.ts) · key in vault, injected at egress
          </p>
        )}
        {!shopifyConnected && (
          <div>
            <button className="btn btn-primary" onClick={onConnectShopify} disabled={connecting}>
              {connecting ? <span className="spinner" /> : <Icon name="link" size={14} />}
              {connecting ? 'Waiting for Shopify…' : 'Connect Shopify'}
            </button>
          </div>
        )}
      </div>
    )
  if (id === 'tool:kb') {
    const files = agents.flatMap((a) => a.knowledge.map((f) => ({ f, a: a.name })))
    return (
      <div className="ag-pad col" style={{ gap: 12 }}>
        <span className="label">Knowledge</span>
        <h3 style={{ fontSize: 20 }}>Files the agents read</h3>
        {files.length === 0 && <p className="muted">No files yet. Add one from an agent’s Setup tab.</p>}
        {files.map((x) => (
          <div key={x.a + x.f} className="row ag-file">
            <Icon name="file" size={14} />
            <span className="mono grow" style={{ fontSize: 12.5 }}>{x.f}</span>
            <span className="label">{x.a}</span>
          </div>
        ))}
        <p className="muted" style={{ fontSize: 13 }}>
          {mode === 'dev' ? 'Chunked at 800 tokens · hybrid search · re-indexed on upload.' : 'I read these before answering. Update a file and the answers update too.'}
        </p>
      </div>
    )
  }
  if (id === 'tool:inbox')
    return (
      <div className="ag-pad col" style={{ gap: 12 }}>
        <span className="label">Tool</span>
        <h3 style={{ fontSize: 20 }}>Team inbox</h3>
        <p>Every chat lands here. So does anything an agent wasn’t sure about.</p>
        <p className="muted" style={{ fontSize: 13 }}>Used by: {usedBy(['escalate'])}</p>
      </div>
    )
  return (
    <div className="ag-pad col" style={{ gap: 12 }}>
      <span className="label">Human in the loop</span>
      <h3 style={{ fontSize: 20 }}>You (owner)</h3>
      <p>You approve refunds over the limit. One tap, from the inbox or WhatsApp.</p>
      <p>You also get any chat the agents weren’t sure about.</p>
      <p className="muted" style={{ fontSize: 13 }}>
        {mode === 'dev' ? 'queue: refund_approvals · notify: whatsapp, email · SLA 24h' : 'If you don’t answer in a day, I remind you once.'}
      </p>
    </div>
  )
}
