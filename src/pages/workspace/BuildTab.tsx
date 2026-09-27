import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/ui'
import { useStore, uid } from '../../lib/store'
import { BLUEPRINT, BUILD_STEPS, type BuildStep } from '../../data/demo'
import { useWS, usePersist, type ChatMsg, type Step } from './wsState'
import { BUILD_TOTAL_MS, SIM_MINUTES, STEP_CREDITS, planFor } from './wsData'
import GeneratedApp from './GeneratedApp'

/* =================================================================== */
/*                               Chat                                  */
/* =================================================================== */

function StepRow({ s, state }: { s: BuildStep; state: 'todo' | 'now' | 'done' }) {
  const { mode } = useStore()
  const [open, setOpen] = useState(false)
  const main = mode === 'dev' ? s.dev : s.simple
  const other = mode === 'dev' ? s.simple : s.dev
  return (
    <li className={'ws-step is-' + state}>
      <span className="ws-step-mark" aria-hidden="true">
        {state === 'now' ? <span className="spinner" /> : state === 'done' ? <Icon name="check" size={13} stroke={2.2} /> : <span className="ws-step-dot" />}
      </span>
      <button
        type="button"
        className="ws-step-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title={mode === 'dev' ? 'Show the plain version' : 'Show what I actually ran'}
        disabled={state === 'todo'}
      >
        <span className={mode === 'dev' ? 'mono ws-step-dev' : ''}>{main}</span>
        {open && <span className={'ws-step-other ' + (mode === 'dev' ? '' : 'mono')}>{other}</span>}
      </button>
    </li>
  )
}

function ConnectShopify({ onClose }: { onClose: () => void }) {
  const { setShopify } = useWS()
  const { toast } = useStore()
  const [store, setStore] = useState('glow-and-co.myshopify.com')
  const [busy, setBusy] = useState(false)
  const valid = /^[a-z0-9-]+\.myshopify\.com$/i.test(store.trim())
  return (
    <Modal
      title="Connect Shopify"
      sub="Shopify will ask you to say yes. I only ever read."
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Not now</button>
          <button
            className="btn btn-primary"
            disabled={!valid || busy}
            onClick={() => {
              setBusy(true)
              window.setTimeout(() => {
                setShopify(true)
                toast('Shopify connected. Orders are real now.')
                onClose()
              }, 1100)
            }}
          >
            {busy ? <span className="spinner" /> : <Icon name="lock" size={14} />}
            {busy ? 'Waiting for Shopify…' : 'Allow read access'}
          </button>
        </>
      }
    >
      <div className="col" style={{ gap: 14 }}>
        <label className="field">
          <span>Your store address</span>
          <input className="input mono" value={store} onChange={(e) => setStore(e.target.value)} aria-invalid={!valid} />
          {!valid && <small style={{ color: 'var(--red-text)' }}>It ends in .myshopify.com. Find it in Shopify, under Settings.</small>}
        </label>
        <div className="sheet" style={{ padding: 14 }}>
          <div className="label" style={{ marginBottom: 8 }}>Architect is asking to</div>
          <ul className="ws-scopes">
            <li><Icon name="check" size={14} /> Read orders and shipping status</li>
            <li><Icon name="check" size={14} /> Read customer name and email, to verify them</li>
            <li className="is-no"><Icon name="x" size={14} /> Change orders, prices or products</li>
          </ul>
        </div>
        <p className="muted" style={{ fontSize: 12.5 }}>Your key goes to the vault. The app itself never sees it.</p>
      </div>
    </Modal>
  )
}

function BuildLog({ upto, running }: { upto: number; running: boolean }) {
  const { shopify } = useWS()
  const [connect, setConnect] = useState(false)
  const shown = BUILD_STEPS.slice(0, Math.min(upto + 1, BUILD_STEPS.length))
  return (
    <>
      <ol className="ws-steps">
        {shown.map((s, i) => {
          const state = i < upto || !running ? 'done' : 'now'
          if (s.kind === 'fix' && state === 'done')
            return (
              <li key={s.id} className="ws-card ws-card-fix rise">
                <StepInline s={s} />
                <span className="badge badge-red">{s.note}</span>
              </li>
            )
          if (s.kind === 'flag' && state === 'done')
            return (
              <li key={s.id} className={'ws-card rise ' + (shopify ? 'ws-card-real' : 'ws-card-flag')}>
                <StepInline s={s} />
                {shopify ? (
                  <span className="row" style={{ gap: 6, color: 'var(--blue-text)', fontSize: 12.5, fontWeight: 600 }}>
                    <Icon name="check" size={13} /> Connected. Orders are real now.
                  </span>
                ) : (
                  <div className="row between wrap" style={{ gap: 8 }}>
                    <span className="badge badge-amber">Placeholder</span>
                    <button className="btn btn-sm" onClick={() => setConnect(true)}>
                      <Icon name="link" size={13} /> Connect Shopify
                    </button>
                  </div>
                )}
              </li>
            )
          return <StepRow key={s.id} s={s} state={state} />
        })}
      </ol>
      {connect && <ConnectShopify onClose={() => setConnect(false)} />}
    </>
  )
}

function StepInline({ s }: { s: BuildStep }) {
  const { mode } = useStore()
  const [open, setOpen] = useState(false)
  return (
    <button type="button" className="ws-step-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
      <span className={mode === 'dev' ? 'mono ws-step-dev' : ''} style={{ fontWeight: 600 }}>{mode === 'dev' ? s.dev : s.simple}</span>
      {open && <span className={'ws-step-other ' + (mode === 'dev' ? '' : 'mono')}>{mode === 'dev' ? s.simple : s.dev}</span>}
    </button>
  )
}

function Meter({ done }: { done: number }) {
  const used = BUILD_STEPS.slice(0, done).reduce((a, s) => a + (STEP_CREDITS[s.id] || 0), 0)
  const ms = BUILD_STEPS.slice(0, done).reduce((a, s) => a + s.ms, 0)
  const min = Math.round((ms / BUILD_TOTAL_MS) * SIM_MINUTES)
  const [lo, hi] = BLUEPRINT.estimate.credits
  return (
    <div className="ws-meter" aria-live="polite">
      <div className="row between" style={{ fontSize: 12 }}>
        <span>
          Used <strong className="mono">{used}</strong> of ~{lo}–{hi} credits · {min} min in
        </span>
        <span className="mono muted">{done}/{BUILD_STEPS.length}</span>
      </div>
      <div className="bar" style={{ marginTop: 6 }}>
        <i style={{ width: `${(used / hi) * 100}%` }} />
      </div>
    </div>
  )
}

function Summary() {
  const { shopify, goTab, tryAsCustomer } = useWS()
  const { mode } = useStore()
  const placeholders = shopify ? BLUEPRINT.placeholder : ['Orders are 24 sample orders until you connect Shopify', ...BLUEPRINT.placeholder]
  return (
    <div className="ws-ai rise">
      <p>It’s built. Here’s what’s real and what isn’t.</p>
      <div className="ws-split">
        <div>
          <div className="label" style={{ color: 'var(--blue-text)' }}>Real</div>
          <ul>
            {BLUEPRINT.real.filter((r) => shopify || !r.includes('Shopify')).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="label" style={{ color: 'var(--amber)' }}>Placeholder</div>
          <ul>
            {placeholders.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
      {mode === 'dev' && <p className="mono muted" style={{ fontSize: 11.5 }}>160 credits · 4 refunded (s5) · 14/14 flows · evals 18/20</p>}
      <p>Next, I’d check it before anyone real uses it.</p>
      <div className="row wrap" style={{ gap: 6 }}>
        <button className="btn btn-sm btn-primary" onClick={() => goTab('inspect')}>
          <Icon name="shieldCheck" size={13} /> Run inspection
        </button>
        <button className="btn btn-sm btn-line" onClick={tryAsCustomer}>
          <Icon name="chat" size={13} /> Try it as a customer
        </button>
      </div>
    </div>
  )
}

function AiMsg({ m, onChoose, onDecide }: { m: ChatMsg; onChoose: (id: string, c: string) => void; onDecide: (id: string, go: boolean) => void }) {
  const { mode } = useStore()
  if (m.role === 'user')
    return (
      <div className="ws-user rise">
        {m.text}
        {m.file && (
          <span className="chip" style={{ marginTop: 6, height: 24 }}>
            <Icon name="image" size={12} /> {m.file}
          </span>
        )}
      </div>
    )
  if (m.kind === 'text') return <div className="ws-ai rise">{m.text}</div>
  if (m.kind === 'ask')
    return (
      <div className="ws-ai rise">
        <p>{m.text}</p>
        <div className="row wrap" style={{ gap: 6 }}>
          {m.options.map((o) => (
            <button key={o} className={'chip' + (m.chosen === o ? ' is-on' : '')} disabled={!!m.chosen} onClick={() => onChoose(m.id, o)}>
              {o}
            </button>
          ))}
          {!m.chosen && (
            <button className="chip" onClick={() => onChoose(m.id, m.options[0])} title="I’ll pick the safer one">
              You decide
            </button>
          )}
        </div>
      </div>
    )
  if (m.kind === 'plan')
    return (
      <div className="ws-ai rise">
        <p>Here’s the plan. Nothing changes until you say go.</p>
        <ol className="ws-plan">
          {m.steps.map((s) => (
            <li key={s.simple}>{mode === 'dev' ? <span className="mono">{s.dev}</span> : s.simple}</li>
          ))}
        </ol>
        <p className="muted" style={{ fontSize: 12 }}>About 6 credits.</p>
        {m.decided ? (
          <span className="badge">{m.decided === 'go' ? 'Approved' : 'Cancelled'}</span>
        ) : (
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-sm btn-primary" onClick={() => onDecide(m.id, true)}>Go ahead</button>
            <button className="btn btn-sm btn-ghost" onClick={() => onDecide(m.id, false)}>Not yet</button>
          </div>
        )}
      </div>
    )
  // work
  return (
    <div className="ws-ai rise">
      <ol className="ws-steps ws-steps-mini">
        {m.steps.map((s, i) => (
          <li key={s.simple} className={'ws-step ' + (i < m.done ? 'is-done' : i === m.done ? 'is-now' : 'is-todo')}>
            <span className="ws-step-mark">
              {i < m.done ? <Icon name="check" size={13} stroke={2.2} /> : i === m.done ? <span className="spinner" /> : <span className="ws-step-dot" />}
            </span>
            <span className={mode === 'dev' ? 'mono ws-step-dev' : ''}>{mode === 'dev' ? s.dev : s.simple}</span>
          </li>
        ))}
      </ol>
      {m.rev && (
        <p style={{ marginTop: 6 }}>
          Done. Saved as <span className="ws-revtag">Rev {m.rev}</span> · {m.credits} credits.
        </p>
      )}
    </div>
  )
}

function Composer({ onSend, disabled }: { onSend: (t: string, plan: boolean, file?: string) => void; disabled?: boolean }) {
  const [text, setText] = useState('')
  const [planFirst, setPlanFirst] = usePersist('planFirst', false)
  const [file, setFile] = useState<string | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)
  const submit = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim(), planFirst, file)
    setText('')
    setFile(undefined)
  }
  return (
    <form
      className="ws-composer"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      {file && (
        <span className="chip" style={{ alignSelf: 'flex-start', height: 24 }}>
          <Icon name="image" size={12} /> {file}
          <button type="button" className="ws-x" onClick={() => setFile(undefined)} aria-label="Remove attachment">
            <Icon name="x" size={11} />
          </button>
        </span>
      )}
      <textarea
        className="textarea"
        rows={2}
        value={text}
        placeholder={disabled ? 'I’m still building. You can type once I’m done.' : 'Ask for a change. “Make the buttons terracotta”'}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        disabled={disabled}
        aria-label="Message Architect"
      />
      <div className="row between">
        <div className="row" style={{ gap: 4 }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFile(f.name)
              e.target.value = ''
            }}
          />
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => fileRef.current?.click()} aria-label="Attach a screenshot" title="Attach a screenshot">
            <Icon name="image" size={15} />
          </button>
          <span className="ws-tip-wrap">
            <button type="button" className={'chip' + (planFirst ? ' is-on' : '')} onClick={() => setPlanFirst(!planFirst)} aria-pressed={planFirst} aria-describedby="plan-tip" style={{ height: 26 }}>
              <Icon name="layers" size={12} /> Plan first
            </button>
            <span role="tooltip" id="plan-tip" className="ws-tip">I’ll show you the plan before touching anything</span>
          </span>
        </div>
        <button type="submit" className="btn btn-sm btn-primary" disabled={!text.trim() || disabled} aria-label="Send">
          <Icon name="send" size={13} /> Send
        </button>
      </div>
    </form>
  )
}

function Chat() {
  const { project, msgs, setMsgs, addRev, setEdits, buildIdx: idx, setBuildIdx: setIdx } = useWS()
  const { updateProject, spend, freeFix, toast } = useStore()
  const building = project.stage === 'building'
  const built = project.stage === 'ready' || project.stage === 'live'
  const fixed = useRef(false)
  const finished = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  // Play the build, one step at a time.
  useEffect(() => {
    if (!building) return
    if (idx >= BUILD_STEPS.length) {
      if (finished.current) return
      finished.current = true
      updateProject(project.id, { stage: 'ready' })
      toast('Built. 160 credits, and the fix was free.')
      return
    }
    const s = BUILD_STEPS[idx]
    const t = window.setTimeout(() => {
      spend(STEP_CREDITS[s.id] || 0)
      if (s.kind === 'fix' && !fixed.current) {
        fixed.current = true
        freeFix(4)
      }
      setIdx(idx + 1)
    }, s.ms)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building, idx])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [idx, msgs, project.stage])

  const patch = (id: string, fn: (m: ChatMsg) => ChatMsg) => setMsgs((ms) => ms.map((m) => (m.id === id ? fn(m) : m)))

  const runWork = (request: string, choice: string) => {
    const p = planFor(request)
    const steps: Step[] = p.steps(choice)
    const id = uid()
    setMsgs((ms) => [...ms, { id, role: 'ai', kind: 'work', steps, done: 0, credits: 6 }])
    steps.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          const last = i === steps.length - 1
          if (!last) {
            patch(id, (m) => (m.role === 'ai' && m.kind === 'work' ? { ...m, done: i + 1 } : m))
            return
          }
          spend(6)
          if (p.colour) {
            const c = p.colour
            setEdits((e) => ({ ...e, btnColor: c }))
          }
          const rev = addRev({ title: p.title(choice), by: 'Architect', credits: 6, plain: [p.title(choice)], dev: steps.map((s) => '~ ' + s.dev) })
          patch(id, (m) => (m.role === 'ai' && m.kind === 'work' ? { ...m, done: steps.length, rev: rev.rev } : m))
          toast(`Done. Saved as Rev ${rev.rev}. 6 credits.`)
        }, 700 * (i + 1)),
      )
    })
  }

  const onSend = (text: string, planFirstOn: boolean, file?: string) => {
    const p = planFor(text)
    const askId = uid()
    setMsgs((ms) => [...ms, { id: uid(), role: 'user', text, file }])
    timers.current.push(
      window.setTimeout(() => {
        setMsgs((ms) => [
          ...ms,
          { id: askId, role: 'ai', kind: 'ask', text: (file ? `I read ${file}. ` : '') + p.ask, options: p.options, request: text + (planFirstOn ? '\u0000plan' : '') },
        ])
      }, 550),
    )
  }

  const onChoose = (id: string, choice: string) => {
    const m = msgs.find((x) => x.id === id)
    if (!m || m.role !== 'ai' || m.kind !== 'ask') return
    patch(id, (x) => (x.role === 'ai' && x.kind === 'ask' ? { ...x, chosen: choice } : x))
    const [request, flag] = m.request.split('\u0000')
    if (flag === 'plan') {
      setMsgs((ms) => [...ms, { id: uid(), role: 'ai', kind: 'plan', request, choice, steps: planFor(request).steps(choice) }])
    } else runWork(request, choice)
  }

  const onDecide = (id: string, go: boolean) => {
    const m = msgs.find((x) => x.id === id)
    if (!m || m.role !== 'ai' || m.kind !== 'plan') return
    patch(id, (x) => (x.role === 'ai' && x.kind === 'plan' ? { ...x, decided: go ? 'go' : 'no' } : x))
    if (go) runWork(m.request, m.choice)
    else setMsgs((ms) => [...ms, { id: uid(), role: 'ai', kind: 'text', text: 'Fine. Nothing changed, nothing spent.' }])
  }

  const early = project.stage === 'brief' || project.stage === 'blueprint'

  return (
    <div className="ws-chat">
      <div className="ws-chat-scroll" ref={scroller}>
        {early ? (
          <div className="ws-ai">
            <p>Nothing’s built yet. I build after you approve the plan.</p>
            <Link to={`/p/${project.id}/${project.stage}`} className="btn btn-sm btn-primary" style={{ marginTop: 8 }}>
              Back to the {project.stage}
            </Link>
          </div>
        ) : (
          <>
            <div className="ws-user">{project.prompt}</div>
            <div className="ws-ai">
              <p>{building ? 'Building from your approved blueprint. You can watch, or wander off.' : 'Built from your approved blueprint.'}</p>
            </div>
            <BuildLog upto={building ? idx : BUILD_STEPS.length} running={building} />
            {building && <Meter done={idx} />}
            {built && <Summary />}
            {built && msgs.map((m) => <AiMsg key={m.id} m={m} onChoose={onChoose} onDecide={onDecide} />)}
          </>
        )}
      </div>
      <Composer onSend={onSend} disabled={!built} />
    </div>
  )
}

/* =================================================================== */
/*                              Preview                                */
/* =================================================================== */

const DEVICES = [
  { id: 'desktop', icon: 'desktop' as const, w: '100%', label: 'Desktop' },
  { id: 'tablet', icon: 'tablet' as const, w: '768px', label: 'Tablet' },
  { id: 'mobile', icon: 'mobile' as const, w: '390px', label: 'Mobile' },
]

function Skeleton({ step }: { step: number }) {
  return (
    <div className="ws-skel grid-bg" aria-busy="true">
      <div className="ws-skel-box" style={{ height: 44 }}><span className="label">Header</span></div>
      <div className="ws-skel-box" style={{ height: 150 }}><span className="label">Hero · type 56/64 Cormorant</span></div>
      <div className="row" style={{ gap: 12 }}>
        <div className="ws-skel-box grow" style={{ height: 90 }}><span className="label">Products</span></div>
        <div className="ws-skel-box" style={{ width: '32%', height: 90 }}><span className="label">Chat · 360w</span></div>
      </div>
      <div className="ws-skel-status">
        <span className="spinner" />
        <strong>Building…</strong>
        <span className="mono muted" style={{ fontSize: 11.5 }}>step {Math.min(step + 1, BUILD_STEPS.length)} of {BUILD_STEPS.length}</span>
      </div>
    </div>
  )
}

function Preview() {
  const { project, previewRev, setPreviewRev, customerTick, buildIdx: idx } = useWS()
  const { toast } = useStore()
  const [device, setDevice] = usePersist('device', 'desktop')
  const [guesses, setGuesses] = useState(false)
  const [editing, setEditing] = useState(false)
  const [view, setView] = useState<'store' | 'inbox'>('store')
  const [reloadKey, setReloadKey] = useState(0)
  const ready = project.stage === 'ready' || project.stage === 'live'
  const d = DEVICES.find((x) => x.id === device) || DEVICES[0]

  useEffect(() => {
    if (customerTick) setView('store')
  }, [customerTick])

  return (
    <div className="ws-preview">
      <div className="ws-ptools">
        <div className="row wrap" style={{ gap: 6 }}>
          <button className={'chip' + (guesses ? ' is-on' : '')} onClick={() => setGuesses(!guesses)} aria-pressed={guesses} disabled={!ready} title="Everything I assumed, circled in red">
            <Icon name="eye" size={13} /> Show my guesses
          </button>
          <button
            className={'chip' + (editing ? ' is-on' : '')}
            onClick={() => {
              setEditing(!editing)
              if (!editing) toast('Click any text or button. Changes are free.')
            }}
            aria-pressed={editing}
            disabled={!ready || !!previewRev}
            title="Not everything needs a prompt"
          >
            <Icon name="cursor" size={13} /> Edit directly
          </button>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <div className="seg" role="group" aria-label="Which side of the app">
            <button className={view === 'store' ? 'is-on' : ''} onClick={() => setView('store')} disabled={!ready}>
              <Icon name="globe" size={12} /> Store
            </button>
            <button className={view === 'inbox' ? 'is-on' : ''} onClick={() => setView('inbox')} disabled={!ready}>
              <Icon name="inbox" size={12} /> Inbox
            </button>
          </div>
        </div>
      </div>

      <div className="ws-browser">
        <div className="ws-chrome">
          <button className="btn btn-ghost btn-icon btn-sm" aria-label="Refresh preview" title="Refresh" onClick={() => { setReloadKey((k) => k + 1); toast('Reloaded. Fresh chat, same app.') }}>
            <Icon name="refresh" size={14} />
          </button>
          <div className="ws-url mono">
            <Icon name="lock" size={11} /> glow-support.archpreview.app{view === 'inbox' ? '/inbox' : ''}
          </div>
          <div className="seg ws-devices" role="group" aria-label="Device width">
            {DEVICES.map((x) => (
              <button key={x.id} className={device === x.id ? 'is-on' : ''} onClick={() => setDevice(x.id)} aria-label={x.label} title={x.label}>
                <Icon name={x.icon} size={13} />
              </button>
            ))}
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" aria-label="Open in new tab" title="Open in new tab" onClick={() => toast('Opened glow-support.archpreview.app in a new tab.')}>
            <Icon name="external" size={14} />
          </button>
        </div>
        {previewRev && (
          <div className="ws-revbanner">
            <span>
              Looking at <span className="ws-revtag">Rev {previewRev}</span>. Read only.
            </span>
            <button className="btn btn-sm btn-line" onClick={() => setPreviewRev(null)}>Back to latest</button>
          </div>
        )}
        {editing && !previewRev && <div className="ws-editbar">Editing directly. Click text to retype it. Click a button to restyle it. 0 credits.</div>}
        <div className="ws-stage">
          <div className="ws-device" style={{ width: d.w }} data-device={d.id}>
            {!ready ? (
              <Skeleton step={idx} />
            ) : previewRev === 'A' ? (
              <div className="ws-skel grid-bg"><div className="ws-skel-status"><strong>Rev A was only the plan.</strong><span className="muted">Nothing to show yet.</span></div></div>
            ) : (
              <GeneratedApp key={reloadKey} guesses={guesses} editing={editing} view={view} openChatTick={customerTick} frozenRev={previewRev} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BuildTab() {
  const { mobilePane, setMobilePane } = useWS()
  return (
    <div className="ws-build" data-pane={mobilePane}>
      <div className="ws-mobile-switch">
        <div className="seg" role="group" aria-label="Show">
          <button className={mobilePane === 'chat' ? 'is-on' : ''} onClick={() => setMobilePane('chat')}>
            <Icon name="chat" size={13} /> Chat
          </button>
          <button className={mobilePane === 'preview' ? 'is-on' : ''} onClick={() => setMobilePane('preview')}>
            <Icon name="eye" size={13} /> Preview
          </button>
        </div>
      </div>
      <Chat />
      <Preview />
    </div>
  )
}
