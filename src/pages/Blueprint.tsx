import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore, type Project } from '../lib/store'
import { Icon } from '../components/Icon'
import { Modal, Redline } from '../components/ui'
import { BLUEPRINT, FILE_TREE, MODELS, QUESTIONS, REFERENCE_READS } from '../data/demo'
import { FlowBar, MissingProject, guesses, inr, optionLabel, parseAnswer, refundLimit, tasteName } from './brief/shared'
import { AgentsDiagram, AgentsList, PagesDiagram, PagesList } from './brief/Diagrams'
import './brief/blueprint.css'

/** Rough credit cost relative to Auto. Cheaper models cost less, but I still pick per task. */
const MODEL_COST: Record<string, number> = {
  auto: 1,
  'claude-opus-5-5': 1.4,
  'claude-sonnet-5': 1.05,
  gpt: 1.15,
  gemini: 0.95,
  haiku: 0.6,
  llama: 0.75,
}

const ORDER_SOURCE: Record<string, string> = {
  shopify: 'Shopify',
  sheet: 'Google Sheets',
  woo: 'WooCommerce',
  unsure: 'your store',
}

export default function Blueprint() {
  const { id = '' } = useParams()
  const { getProject } = useStore()
  const project = getProject(id)
  if (!project) return <MissingProject />
  return <Sheet p={project} />
}

function revLabel(n: number) {
  return n === 0 ? 'A' : `A.${n}`
}

function Sheet({ p }: { p: Project }) {
  const { user, mode, credits, updateProject, toast } = useStore()
  const navigate = useNavigate()
  const [rev, setRev] = useState(0)
  const [changes, setChanges] = useState<string[]>([])
  const [changeOpen, setChangeOpen] = useState(false)
  const [stamping, setStamping] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const limit = refundLimit(p)
  const refundId = parseAnswer(p.answers.refund).id ?? 'under'
  const langId = parseAnswer(p.answers.lang).id ?? 'enhi'
  const ordersId = parseAnswer(p.answers.orders).id ?? 'shopify'
  const verifyId = parseAnswer(p.answers.verify).id ?? 'email'
  const source = ORDER_SOURCE[ordersId] ?? 'Shopify'
  const open = QUESTIONS.filter((q) => !p.answers[q.id]).length

  const summary = useMemo(() => {
    const lang =
      langId === 'en' ? 'in English' : langId === 'auto' ? 'in whatever language the customer writes' : 'in English or Hindi'
    const inbox =
      refundId === 'draft'
        ? 'an inbox where you approve every refund'
        : refundId === 'never'
          ? 'an inbox where you handle refunds yourself'
          : `an inbox where you approve refunds over ${inr(limit)}`
    return `A chat on your site that answers order questions ${lang}, and ${inbox}.`
  }, [langId, refundId, limit])

  const lists = useMemo(() => {
    const verify =
      verifyId === 'otp' ? 'a code sent to their phone' : verifyId === 'account' ? 'a login' : 'order number + email'
    const real = [
      BLUEPRINT.real[0],
      `Customers prove an order is theirs with ${verify}`,
      refundId === 'under'
        ? `Refunds over ${inr(limit)} always wait for you. Enforced in code.`
        : refundId === 'draft'
          ? 'Every refund waits for you. Enforced in code.'
          : 'The AI can’t issue refunds at all. Enforced in code.',
    ]
    const placeholder = [
      { text: `Orders are 24 sample orders until you connect ${source}`, action: `Connect ${source}` },
      { text: BLUEPRINT.placeholder[0], action: 'Connect courier tracking' },
      { text: BLUEPRINT.placeholder[1], action: 'Connect Gmail' },
    ]
    return { real, placeholder, notDoing: BLUEPRINT.notDoing }
  }, [verifyId, refundId, limit, source])

  const cost = MODEL_COST[p.model] ?? 1
  const [cLo, cHi] = BLUEPRINT.estimate.credits.map((c) => Math.round((c * cost) / 5) * 5)
  const [mLo, mHi] = BLUEPRINT.estimate.minutes
  const short = credits.balance < cHi
  const model = MODELS.find((m) => m.id === p.model) ?? MODELS[0]

  const guessed = guesses(p)
  const tasteGuessed = parseAnswer(p.answers.taste).guess || !p.taste
  const fixes = REFERENCE_READS.filter((r) => p.readsRejected.includes(r.id))

  const date = new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const approve = () => {
    if (stamping) return
    setStamping(true)
    timer.current = window.setTimeout(() => {
      updateProject(p.id, { stage: 'building' })
      navigate(`/p/${p.id}?tab=build`)
    }, 900)
  }

  const onChanged = (text: string) => {
    const next = rev + 1
    setChanges((c) => [...c, text])
    setRev(next)
    toast(`Blueprint updated: Rev ${revLabel(rev)} → Rev ${revLabel(next)}`)
  }

  return (
    <div className="grid-bg bp-root">
      <FlowBar step={1} name={p.name} />
      <div className="bp-wrap">
        {open > 0 && (
          <div className="bp-warn">
            <Icon name="warning" size={15} />
            <span className="grow">
              {open} question{open === 1 ? '' : 's'} still open on the brief. I’ve drawn this with my defaults.
            </span>
            <Link to={`/p/${p.id}/brief`} className="btn btn-sm btn-line">
              Answer them
            </Link>
          </div>
        )}

        <article className={'bp-sheet sheet-ink' + (stamping ? ' is-stamping' : '')} aria-label="Blueprint">
          <div className="bp-frame">
            {/* ---------- Head ---------- */}
            <header className="bp-head">
              <div className="col" style={{ gap: 10, minWidth: 0 }}>
                <span className="label">Sheet A-101 · Blueprint · For your approval</span>
                <p className="bp-summary">{summary}</p>
              </div>
              <div className="titleblock bp-tb" style={{ ['--cols' as string]: 5 }}>
                <div>
                  <span className="label">Project</span>
                  <b>{p.name}</b>
                </div>
                <div>
                  <span className="label">Drawn by</span>
                  <span>Architect</span>
                </div>
                <div>
                  <span className="label">Checked by</span>
                  <span>{user?.name ?? 'You'}</span>
                </div>
                <div>
                  <span className="label">Rev</span>
                  <b className="mono">{revLabel(rev)}</b>
                </div>
                <div>
                  <span className="label">Date</span>
                  <span className="mono">{date}</span>
                </div>
              </div>
            </header>
            {changes.length > 0 && (
              <ol className="bp-revs" aria-label="Revisions">
                {changes.map((c, i) => (
                  <li key={i}>
                    <span className="mono">Rev {revLabel(i + 1)}</span> {c}
                  </li>
                ))}
              </ol>
            )}

            {/* ---------- Pages ---------- */}
            <Block n="1" title="Pages" sub={`${BLUEPRINT.pages.length} screens. Two for customers, three for you.`}>
              <div className="bp-drawing">
                <PagesDiagram limit={limit} refundId={refundId} />
              </div>
              <PagesList limit={limit} refundId={refundId} />
            </Block>

            {/* ---------- Agents ---------- */}
            <Block n="2" title="Agents" sub="Three AI helpers. Each does one job and hands off.">
              <div className="bp-drawing">
                <AgentsDiagram limit={limit} refundId={refundId} source={source} />
              </div>
              <AgentsList limit={limit} refundId={refundId} source={source} />
              <ul className="bp-agents">
                {BLUEPRINT.agents.map((a) => (
                  <li key={a.id}>
                    <b>{a.name}</b>
                    <span className="muted">
                      {a.id === 'refunds' && refundId !== 'under'
                        ? refundId === 'draft'
                          ? 'Checks the policy and drafts every refund for you.'
                          : 'Collects the details and passes them to you.'
                        : a.job.replace('₹1,500', inr(limit)).replace('Shopify', source)}
                    </span>
                  </li>
                ))}
              </ul>
            </Block>

            {/* ---------- Data ---------- */}
            <Block n="3" title="Data" sub="Where each thing lives.">
              <ul className="bp-data">
                {BLUEPRINT.data.map((d) => {
                  const isOrders = d.name === 'Orders'
                  return (
                    <li key={d.name}>
                      <Icon name="database" size={15} />
                      <b>{d.name}</b>
                      <span className="grow muted">
                        {isOrders ? (ordersId === 'unsure' ? 'Sample orders, until you tell me' : `${source} (read only)`) : d.where}
                      </span>
                      {isOrders ? (
                        <span className="badge badge-amber">Sample for now</span>
                      ) : (
                        <span className="badge badge-blue">Real</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Block>

            {/* ---------- Honesty ---------- */}
            <Block n="4" title="What’s real, and what isn’t" sub="No surprises after launch.">
              <div className="bp-honest">
                <div className="bp-hcol">
                  <span className="label bp-hl-real">
                    <span className="dot" /> Real on day one
                  </span>
                  <ul>
                    {lists.real.map((t) => (
                      <li key={t}>
                        <Icon name="check" size={13} stroke={2} /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bp-hcol">
                  <span className="label bp-hl-ph">
                    <span className="dot" /> Placeholder until you connect it
                  </span>
                  <ul>
                    {lists.placeholder.map((t) => (
                      <li key={t.text} className="bp-ph">
                        <span>{t.text}</span>
                        <button
                          className="btn btn-sm btn-line"
                          onClick={() => toast(`${t.action}: I’ll ask after the build. It’s on your launch checklist.`)}
                        >
                          <Icon name="link" size={12} /> {t.action}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bp-hcol">
                  <span className="label">
                    <span className="dot" /> Not doing (yet)
                  </span>
                  <ul>
                    {lists.notDoing.map((t) => (
                      <li key={t} className="muted">
                        <Icon name="minus" size={13} /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Block>

            {/* ---------- Assumptions ---------- */}
            <Block n="5" title="My assumptions" sub="Where I guessed. Change any of them before I build.">
              {guessed.length === 0 && !tasteGuessed && fixes.length === 0 ? (
                <p className="bp-none">
                  <Icon name="check" size={14} /> No guesses. You answered everything yourself.
                </p>
              ) : (
                <ul className="bp-assume">
                  {guessed.map((q) => (
                    <li key={q.id} className="redline">
                      <span className="grow">
                        <span className="label">{q.q}</span>
                        <b>
                          {optionLabel(q, p.answers[q.id])}
                          {q.id === 'refund' && parseAnswer(p.answers.refund).id === 'under' ? ` (${inr(limit)})` : ''}
                        </b>
                      </span>
                      <Link to={`/p/${p.id}/brief?q=${q.id}`}>change</Link>
                    </li>
                  ))}
                  {tasteGuessed && (
                    <li className="redline">
                      <span className="grow">
                        <span className="label">The look</span>
                        <b>{tasteName(p) ?? 'Quiet spa'}</b>
                      </span>
                      <Link to={`/p/${p.id}/brief?q=taste`}>change</Link>
                    </li>
                  )}
                  {fixes.map((r) => {
                    const fix = p.answers['read:' + r.id]
                    return (
                      <li key={r.id} className="bp-fixed">
                        <span className="grow">
                          <span className="label">You corrected me</span>
                          <span>
                            <s>{r.text}</s>
                            {fix?.startsWith('fix:') ? <b> → {fix.slice(4)}</b> : <b> → dropped</b>}
                          </span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
              {(guessed.length > 0 || tasteGuessed) && (
                <Redline style={{ marginTop: 10 }}>These are mine, not yours. Worth a look before you sign.</Redline>
              )}
            </Block>

            {/* ---------- Estimate ---------- */}
            <Block n="6" title="The estimate" sub="Before you spend anything.">
              <div className="bp-est">
                <div className="bp-est-main">
                  <p className="bp-est-big">
                    About{' '}
                    <span className="mono">
                      {mLo}–{mHi}
                    </span>{' '}
                    minutes · <span className="mono">{cLo}–{cHi}</span> credits
                  </p>
                  <p className="bp-est-free">
                    <Icon name="shieldCheck" size={15} /> If I break something, fixing it is on me. <b className="mono">0 credits.</b>
                  </p>
                  <p className={short ? 'bp-short' : 'muted'} style={{ fontSize: 13 }}>
                    You have <b className="mono">{credits.balance}</b> credits.{' '}
                    {short ? (
                      <>
                        That might not cover it. <Link to="/settings/usage">Top up</Link>
                      </>
                    ) : (
                      <>
                        About <span className="mono">{credits.balance - cHi}–{credits.balance - cLo}</span> left after.
                      </>
                    )}
                  </p>
                </div>
                <label className="field bp-model">
                  <span>Model</span>
                  <select
                    className="select"
                    value={model.id}
                    onChange={(e) => updateProject(p.id, { model: e.target.value })}
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {m.by}
                        {m.tag ? ` (${m.tag})` : ''}
                      </option>
                    ))}
                  </select>
                  <small className="muted">{model.note}</small>
                </label>
              </div>
            </Block>

            {mode === 'dev' && <UnderTheHood p={p} limit={limit} source={source} rev={revLabel(rev)} />}

            {/* ---------- Actions ---------- */}
            <footer className="bp-actions">
              <Link to={`/p/${p.id}/brief`} className="btn btn-ghost">
                <Icon name="back" size={14} /> Back to brief
              </Link>
              <span className="grow" />
              <button className="btn btn-line" onClick={() => setChangeOpen(true)} disabled={stamping}>
                <Icon name="pencil" size={14} /> Change something
              </button>
              <button className="btn btn-primary btn-lg" onClick={approve} disabled={stamping}>
                {stamping ? (
                  <>
                    <span className="spinner" /> Starting the build
                  </>
                ) : (
                  <>
                    Approve and build <Icon name="arrow" size={15} />
                  </>
                )}
              </button>
            </footer>
          </div>

          {stamping && (
            <div className="bp-stamp-wrap" aria-live="assertive">
              <span className="stamp stamp-in bp-stamp">
                Approved
                <small>
                  Rev {revLabel(rev)} · {user?.name ?? 'You'} · {date}
                </small>
              </span>
            </div>
          )}
        </article>
      </div>

      {changeOpen && <ChangeModal onClose={() => setChangeOpen(false)} onDone={onChanged} />}
    </div>
  )
}

function Block({ n, title, sub, children }: { n: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="bp-block">
      <div className="bp-block-head">
        <span className="bp-num mono">{n}</span>
        <h3>{title}</h3>
        {sub && <span className="muted bp-block-sub">{sub}</span>}
      </div>
      {children}
    </section>
  )
}

function ChangeModal({ onClose, onDone }: { onClose: () => void; onDone: (text: string) => void }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const submit = () => {
    const t = text.trim()
    if (!t || busy) return
    setBusy(true)
    timer.current = window.setTimeout(() => {
      onDone(t)
      onClose()
    }, 1400)
  }
  const ideas = ['Add a WhatsApp button to the chat', 'Raise the refund limit', 'Drop the settings page']
  return (
    <Modal
      title="Tell me what to change"
      sub="Plain words are fine. I’ll redraw the sheet and bump the revision."
      onClose={busy ? () => {} : onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={submit} disabled={!text.trim() || busy}>
            {busy ? (
              <>
                <span className="spinner" /> Redrawing
              </>
            ) : (
              'Update the blueprint'
            )}
          </button>
        </>
      }
    >
      <div className="col" style={{ gap: 10 }}>
        <textarea
          autoFocus
          className="textarea"
          rows={4}
          value={text}
          disabled={busy}
          placeholder="e.g. Customers should also be able to change their delivery address"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
          }}
        />
        <div className="row wrap" style={{ gap: 6 }}>
          {ideas.map((i) => (
            <button key={i} className="chip" onClick={() => setText(i)} disabled={busy}>
              {i}
            </button>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 12 }}>
          Changes to the plan are free. Credits only start when you approve.
        </p>
      </div>
    </Modal>
  )
}

function UnderTheHood({ p, limit, source, rev }: { p: Project; limit: number; source: string; rev: string }) {
  const json = useMemo(
    () =>
      JSON.stringify(
        {
          name: p.name,
          revision: rev,
          stack: { web: 'next@15', agents: 'lyzr-adk (python 3.12)', db: 'postgres', egress: 'proxy' },
          model: p.model,
          taste: p.taste ?? 'calm',
          pages: ['/chat', '/order/[id]', '/inbox', '/refunds', '/settings'],
          agents: {
            desk: { routes: ['orders', 'refunds'] },
            orders: { tools: ['verify_customer', 'orders.get'], source: source.toLowerCase() },
            refunds: { tools: ['refunds.create'], limit_inr: limit, over_limit: 'queue_for_owner' },
          },
          data: { conversations: 'postgres', refund_requests: 'postgres', orders: `${source.toLowerCase()}:read_only` },
          placeholders: ['orders:fixtures', 'shipping:status_only', 'email:draft_only'],
          skills: p.skills,
          answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, p.answers[q.id] ?? null])),
        },
        null,
        2,
      ),
    [p, limit, source, rev],
  )
  return (
    <details className="bp-hood">
      <summary>
        <Icon name="code" size={14} /> Under the hood
        <span className="label">Developer view</span>
      </summary>
      <div className="bp-hood-body">
        <div className="bp-hood-col">
          <span className="label">Stack</span>
          <ul className="bp-stack">
            <li>
              <b>Next.js 15</b> <span className="muted">App Router. Chat, order page, inbox.</span>
            </li>
            <li>
              <b>Lyzr ADK agents</b> <span className="muted">Python 3.12. desk, orders, refunds.</span>
            </li>
            <li>
              <b>Postgres</b> <span className="muted">Per-app schema, RLS on.</span>
            </li>
            <li>
              <b>Egress proxy</b> <span className="muted">Allowlist. Injects the {source} key, so the app never holds it.</span>
            </li>
          </ul>
          <span className="label" style={{ marginTop: 14 }}>
            File plan
          </span>
          <ul className="bp-files mono">
            {FILE_TREE.map((f) => (
              <li key={f.path} style={{ paddingLeft: f.depth * 14 }}>
                <Icon name={f.dir ? 'folder' : 'file'} size={12} />
                {f.dir ? f.path + '/' : f.depth ? f.path.split('/').slice(1).join('/') : f.path}
              </li>
            ))}
          </ul>
        </div>
        <div className="bp-hood-col">
          <span className="label">architect.json</span>
          <pre className="bp-json">{json}</pre>
        </div>
      </div>
    </details>
  )
}
