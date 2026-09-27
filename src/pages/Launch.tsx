import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Empty, Logo, Modal, ModeToggle, Steps, ThemeToggle } from '../components/ui'
import { DEPLOYS, FINDINGS } from '../data/demo'
import { useStore, type Project } from '../lib/store'
import { FakeQR, SecretsEditor, type Secret } from './launch/parts'
import { revLetter, useFixes } from './launch/useFixes'
import './launch/launch.css'

const TAKEN = ['glow', 'support', 'admin', 'test', 'shop', 'help', 'app', 'glow-and-co']
const REGIONS = [
  { id: 'ap-south-1', name: 'Mumbai' },
  { id: 'ap-southeast-1', name: 'Singapore' },
  { id: 'eu-central-1', name: 'Frankfurt' },
  { id: 'us-east-1', name: 'N. Virginia' },
]

type Deploy = { id: string; when: string; rev: string; status: 'live' | 'previous' }

function defaultSub(p: Project) {
  if (/glow/i.test(p.name)) return 'glow-support'
  return (
    p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 24) || 'my-app'
  )
}

function TopBar({ project, current }: { project?: Project; current: number }) {
  return (
    <header className="ln-top">
      <Link to="/home" aria-label="Home" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>
      <div className="ln-steps">
        <Steps current={current} />
      </div>
      <div className="row" style={{ gap: 6 }}>
        <ModeToggle compact />
        <ThemeToggle />
        {project && (
          <Link to={`/p/${project.id}?tab=inspect`} className="btn btn-ghost btn-sm">
            <Icon name="back" size={13} /> <span className="ln-hide-sm">Workspace</span>
          </Link>
        )}
      </div>
    </header>
  )
}

export default function Launch() {
  const { id = '' } = useParams()
  const { getProject } = useStore()
  const project = getProject(id)
  if (!project)
    return (
      <div className="ln-page grid-bg">
        <TopBar current={4} />
        <div className="page" style={{ maxWidth: 560 }}>
          <Empty
            icon="search"
            title="I can’t find that project"
            sub="It may have been deleted, or the link is from another account."
            action={
              <Link to="/home" className="btn btn-primary">
                Back to your projects
              </Link>
            }
          />
        </div>
      </div>
    )
  return <LaunchFlow project={project} />
}

function LaunchFlow({ project }: { project: Project }) {
  const { mode, toast, updateProject } = useStore()
  const { fix, busy, openMust, isFixed } = useFixes(project)
  const dev = mode === 'dev'
  const blocked = openMust.length > 0
  const rev = revLetter(project)

  // Secrets
  const [gmail, setGmail] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const shopify = isFixed('f5')
  const [secrets, setSecrets] = useState<Secret[]>([
    { key: 'SHOPIFY_TOKEN', value: '', source: 'vault', preview: true, prod: true },
    { key: 'LYZR_API_KEY', value: '', source: 'managed', preview: true, prod: true },
    { key: 'GMAIL_OAUTH', value: '', source: 'missing', preview: false, prod: false },
  ])
  useEffect(() => {
    if (gmail) setSecrets((s) => s.map((x) => (x.key === 'GMAIL_OAUTH' ? { ...x, source: 'vault', preview: true, prod: true } : x)))
  }, [gmail])

  // Address
  const [own, setOwn] = useState(false)
  const [sub, setSub] = useState(() => (project.liveUrl ? project.liveUrl.split('.')[0] : defaultSub(project)))
  const [subState, setSubState] = useState<'checking' | 'ok' | 'taken' | 'invalid'>('checking')
  const [domain, setDomain] = useState('help.glowandco.in')
  const [dns, setDns] = useState<'idle' | 'checking' | 'missing' | 'found'>('idle')
  const dnsTries = useRef(0)
  useEffect(() => {
    if (!/^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/.test(sub)) {
      setSubState('invalid')
      return
    }
    setSubState('checking')
    const t = setTimeout(() => setSubState(TAKEN.includes(sub) ? 'taken' : 'ok'), 600)
    return () => clearTimeout(t)
  }, [sub])
  const checkDns = () => {
    setDns('checking')
    setTimeout(() => {
      dnsTries.current += 1
      const found = dnsTries.current > 1
      setDns(found ? 'found' : 'missing')
      toast(found ? `Found it. ${domain} is ready.` : 'Not there yet. DNS can take up to an hour.')
    }, 1500)
  }
  const host = own && dns === 'found' ? domain : `${sub}.architect.app`
  const addressOk = own ? dns === 'found' : subState === 'ok'

  // Where it runs
  const [region, setRegion] = useState('ap-south-1')
  const [alwaysOn, setAlwaysOn] = useState(true)

  // Launch
  const initiallyLive = project.stage === 'live' && !!project.liveUrl
  const [phase, setPhase] = useState<'idle' | 'deploying' | 'live'>(initiallyLive ? 'live' : 'idle')
  const [lines, setLines] = useState<string[]>([])
  const [liveHost, setLiveHost] = useState(project.liveUrl || host)
  const [deploys, setDeploys] = useState<Deploy[]>(() =>
    initiallyLive ? DEPLOYS.map((d) => ({ id: d.id, when: d.when, rev: d.rev, status: d.status as Deploy['status'] })) : [],
  )
  const [openLogs, setOpenLogs] = useState<string[]>([])
  const [confirm, setConfirm] = useState<{ kind: 'rollback'; d: Deploy } | { kind: 'promote' } | null>(null)
  const [convos, setConvos] = useState(initiallyLive ? 3 : 0)
  const [notify, setNotify] = useState<'whatsapp' | 'email'>('whatsapp')
  const regionName = REGIONS.find((r) => r.id === region)!.name

  useEffect(() => {
    if (phase !== 'live') return
    const t = setInterval(() => setConvos((c) => (c < 40 ? c + 1 : c)), 9000)
    return () => clearInterval(t)
  }, [phase])

  const script = dev
    ? [
        `▲ build next@15.4 · 14 routes · 2.1 MB · rev ${rev}`,
        `✓ gate: inspection must-fix open = 0 · evals 20/20`,
        `● image agents:rev-${rev.toLowerCase()} → ${region} (lyzr-adk 0.9 · ${alwaysOn ? 'min=1' : 'min=0'})`,
        `● secrets: ${secrets.filter((s) => s.prod && s.source !== 'missing').length} bound at egress proxy · app env holds placeholders`,
        `● edge: ${host} → 42 PoPs · TLS cert issued (Let’s Encrypt)`,
        `✓ health POST /invoke 200 · POST /stream 200 · GET /health 200`,
      ]
    : [
        'Packing up your app',
        'Checking the must-fix list one more time. All clear.',
        `Putting your agents on a server in ${regionName}`,
        'Adding your keys on the way out. The app never sees them.',
        `Pointing ${host} at it`,
        'Sent 20 test chats. All 20 got the right answer.',
      ]

  const launch = () => {
    if (blocked || !addressOk) return
    setPhase('deploying')
    setLines([])
    script.forEach((l, i) => setTimeout(() => setLines((ls) => [...ls, l]), 650 * (i + 1)))
    setTimeout(() => {
      setPhase('live')
      setLiveHost(host)
      updateProject(project.id, { stage: 'live', liveUrl: host })
      setDeploys((ds) => [
        { id: 'd' + Date.now(), when: 'Just now', rev, status: 'live' },
        ...(ds.length ? ds : DEPLOYS.slice(1).map((d) => ({ id: d.id, when: d.when, rev: d.rev, status: 'previous' as const }))).map((d) => ({
          ...d,
          status: 'previous' as const,
          when: d.when === 'Just now' ? 'Earlier today' : d.when,
        })),
      ])
      toast('You’re live.')
    }, 650 * script.length + 700)
  }

  const copy = (text: string) => {
    try {
      navigator.clipboard.writeText(text)
      toast('Link copied.')
    } catch {
      toast('Couldn’t copy. Select it by hand.')
    }
  }

  const liveUrl = 'https://' + liveHost
  const wa = `https://wa.me/?text=${encodeURIComponent(`Need help with an order? Chat with us here: ${liveUrl}`)}`
  const costDay = alwaysOn ? 46 : 12
  const shouldLeft = FINDINGS.filter((f) => (f.level === 'should' || f.level === 'placeholder') && !isFixed(f)).length

  return (
    <div className="ln-page grid-bg">
      <TopBar project={project} current={blocked ? 3 : 4} />
      <main className="ln-wrap">
        <div className="ln-head">
          <div className="col" style={{ gap: 8 }}>
            <span className="label">Launch · {project.name}</span>
            <h1 style={{ fontSize: 34 }}>{phase === 'live' ? 'It’s out there.' : 'Put it in front of customers.'}</h1>
            <p className="muted" style={{ maxWidth: 520 }}>
              Six short checks, top to bottom. Nothing goes out until you press the button.
            </p>
          </div>
          <div className="titleblock" style={{ ['--cols' as string]: 3 }}>
            <div>
              <span className="label">Rev</span>
              <b className="mono">{rev}</b>
            </div>
            <div>
              <span className="label">Address</span>
              <span className="mono">{phase === 'live' ? liveHost : host}</span>
            </div>
            <div>
              <span className="label">Status</span>
              <span>{phase === 'live' ? 'Live' : blocked ? 'Blocked' : 'Ready'}</span>
            </div>
          </div>
        </div>

        <div className="ln-grid">
          <ol className="ln-steps-list">
            {/* 1. Pre-flight */}
            <li className={'ln-step ' + (blocked ? 'is-blocked' : 'is-done')}>
              <StepHead n={1} title="Pre-flight" state={blocked ? 'blocked' : 'done'} />
              {blocked ? (
                <div className="col" style={{ gap: 10 }}>
                  <p>
                    {openMust.length === 1 ? 'One thing' : `${openMust.length} things`} could hurt your customers or your wallet. I won’t
                    launch with {openMust.length === 1 ? 'it' : 'them'} open.
                  </p>
                  {openMust.map((f) => (
                    <div key={f.id} className="ln-must">
                      <div className="col grow" style={{ gap: 2 }}>
                        <b>{f.title}</b>
                        <span className="muted" style={{ fontSize: 13 }}>{dev ? f.dev : f.plain}</span>
                      </div>
                      <button className="btn btn-red btn-sm" disabled={busy.includes(f.id)} onClick={() => fix(f.id)}>
                        {busy.includes(f.id) ? <span className="spinner" /> : <Icon name="wand" size={13} />}
                        {busy.includes(f.id) ? 'Fixing…' : 'Fix it for me'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="col" style={{ gap: 6 }}>
                  <p className="row" style={{ gap: 8 }}>
                    <Icon name="shieldCheck" size={16} /> Nothing blocks launch.
                  </p>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {shouldLeft
                      ? `${shouldLeft} smaller ${shouldLeft === 1 ? 'item' : 'items'} can wait. `
                      : 'Every finding is fixed. '}
                    <Link to={`/p/${project.id}?tab=inspect`}>See the full inspection</Link>
                  </p>
                </div>
              )}
            </li>

            {/* 2. Secrets */}
            <li className="ln-step is-done">
              <StepHead n={2} title="Secrets" state="done" />
              <p style={{ marginBottom: 10 }}>Your app never sees these. They’re added on the way out.</p>
              {dev ? (
                <SecretsEditor secrets={secrets} setSecrets={setSecrets} />
              ) : (
                <div className="col" style={{ gap: 6 }}>
                  <div className="ln-secret">
                    <Icon name="key" size={14} />
                    <span className="grow">Shopify</span>
                    {shopify ? (
                      <span className="badge badge-blue">Connected</span>
                    ) : (
                      <span className="badge badge-amber">Sample orders</span>
                    )}
                  </div>
                  <div className="ln-secret">
                    <Icon name="key" size={14} />
                    <span className="grow">Lyzr agents</span>
                    <span className="badge badge-ink">Managed by Architect</span>
                  </div>
                  <div className="ln-secret">
                    <Icon name="mail" size={14} />
                    <span className="grow">
                      Gmail
                      {!gmail && <small className="muted ln-block">Not connected. Emails will be drafted only.</small>}
                    </span>
                    {gmail ? (
                      <span className="badge badge-blue">Connected</span>
                    ) : (
                      <button
                        className="btn btn-line btn-sm"
                        disabled={connecting}
                        onClick={() => {
                          setConnecting(true)
                          setTimeout(() => {
                            setConnecting(false)
                            setGmail(true)
                            toast('Gmail connected. Emails will send for real.')
                          }, 1400)
                        }}
                      >
                        {connecting ? <span className="spinner" /> : null}
                        {connecting ? 'Connecting…' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {!shopify && (
                <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
                  Shopify is still on sample orders. Customers would get made-up answers.{' '}
                  <Link to={`/p/${project.id}?tab=inspect`}>Connect it in Inspection</Link>
                </p>
              )}
            </li>

            {/* 3. Address */}
            <li className={'ln-step ' + (addressOk ? 'is-done' : '')}>
              <StepHead n={3} title="Address" state={addressOk ? 'done' : 'todo'} />
              <div className="seg" role="group" aria-label="Address type" style={{ marginBottom: 12 }}>
                <button className={!own ? 'is-on' : ''} onClick={() => setOwn(false)}>Free address</button>
                <button className={own ? 'is-on' : ''} onClick={() => setOwn(true)}>Use my own domain</button>
              </div>
              {!own ? (
                <div className="col" style={{ gap: 6 }}>
                  <div className="ln-addr">
                    <span className="mono muted">https://</span>
                    <input
                      className="mono"
                      value={sub}
                      onChange={(e) => setSub(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      aria-label="Subdomain"
                      spellCheck={false}
                    />
                    <span className="mono muted">.architect.app</span>
                  </div>
                  <p className={'ln-avail is-' + subState} aria-live="polite">
                    {subState === 'checking' && (
                      <>
                        <span className="spinner" /> Checking…
                      </>
                    )}
                    {subState === 'ok' && (
                      <>
                        <Icon name="check" size={13} /> {sub}.architect.app is yours.
                      </>
                    )}
                    {subState === 'taken' && (
                      <>
                        <Icon name="x" size={13} /> Taken.{' '}
                        <button className="ln-linkbtn" onClick={() => setSub(sub + '-desk')}>
                          Try {sub}-desk
                        </button>
                      </>
                    )}
                    {subState === 'invalid' && (
                      <>
                        <Icon name="warning" size={13} /> 3 to 32 letters, numbers or dashes. No dash at the ends.
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <div className="col" style={{ gap: 10 }}>
                  <label className="field">
                    <span>Your domain</span>
                    <input
                      className="input mono"
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value.trim().toLowerCase())
                        setDns('idle')
                        dnsTries.current = 0
                      }}
                    />
                  </label>
                  <p style={{ fontSize: 13 }}>Add this record where you bought the domain. GoDaddy, Hostinger, wherever.</p>
                  <div className="ln-dns mono">
                    <span className="label">Type</span>
                    <span className="label">Name</span>
                    <span className="label">Points to</span>
                    <span>CNAME</span>
                    <span>{domain.split('.')[0] || 'glow-support'}</span>
                    <span>cname.architect.app</span>
                  </div>
                  <div className="row wrap" style={{ gap: 10 }}>
                    <button className="btn btn-line btn-sm" onClick={checkDns} disabled={dns === 'checking' || !domain.includes('.')}>
                      {dns === 'checking' ? <span className="spinner" /> : <Icon name="search" size={13} />}
                      {dns === 'checking' ? 'Looking…' : 'Check DNS'}
                    </button>
                    {dns === 'missing' && <span className="badge badge-amber">Not found yet</span>}
                    {dns === 'found' && <span className="badge badge-green"><Icon name="check" size={11} /> Found</span>}
                  </div>
                  {dns === 'missing' && (
                    <p className="muted" style={{ fontSize: 12.5 }}>Changes can take up to an hour to show. Check again in a bit.</p>
                  )}
                </div>
              )}
            </li>

            {/* 4. Where it runs */}
            <li className="ln-step is-done">
              <StepHead n={4} title="Where it runs" state="done" />
              {!dev ? (
                <p>I’ll pick the right place. Change it later.</p>
              ) : (
                <div className="ln-infra">
                  <div className="ln-infra-box">
                    <span className="label">Frontend</span>
                    <b>Edge network</b>
                    <span className="muted mono" style={{ fontSize: 12 }}>static + edge functions · 42 PoPs</span>
                  </div>
                  <div className="ln-infra-box">
                    <span className="label">Agents</span>
                    <b>Container · 0.5 vCPU · 1 GB</b>
                    <label className="field" style={{ marginTop: 4 }}>
                      <span>Region</span>
                      <select className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
                        {REGIONS.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} · {r.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    {region !== 'ap-south-1' && (
                      <small className="muted">Your customers are in India. Mumbai answers about 90ms faster.</small>
                    )}
                  </div>
                  <div className="ln-infra-box ln-infra-wide">
                    <span className="label">When nobody’s chatting</span>
                    <div className="seg" role="group" aria-label="Scaling">
                      <button className={alwaysOn ? 'is-on' : ''} onClick={() => setAlwaysOn(true)}>Always on</button>
                      <button className={!alwaysOn ? 'is-on' : ''} onClick={() => setAlwaysOn(false)}>Sleep when idle (cheaper)</button>
                    </div>
                    <small className="muted">
                      {alwaysOn
                        ? 'min_instances=1 · first reply in under a second · about ₹46 a day'
                        : 'min_instances=0 · first reply after a quiet spell takes ~3s · about ₹12 a day'}
                    </small>
                  </div>
                </div>
              )}
            </li>

            {/* 5. Launch */}
            <li className={'ln-step ' + (phase === 'live' ? 'is-done' : '')}>
              <StepHead n={5} title="Launch" state={phase === 'live' ? 'done' : blocked || !addressOk ? 'blocked' : 'todo'} />
              {phase === 'idle' && (
                <div className="col" style={{ gap: 10 }}>
                  <button className="btn btn-primary btn-lg ln-go" onClick={launch} disabled={blocked || !addressOk}>
                    <Icon name="rocket" size={16} /> Launch {host}
                  </button>
                  {blocked && <p className="ln-why">Fix the must-fix items in step 1 first.</p>}
                  {!blocked && !addressOk && (
                    <p className="ln-why">{own ? 'Check your DNS first, or use the free address.' : 'Pick an address that’s free.'}</p>
                  )}
                  {!blocked && addressOk && <p className="muted" style={{ fontSize: 13 }}>Takes about 5 seconds. You can roll back any time.</p>}
                </div>
              )}
              {phase === 'deploying' && (
                <div className={'ln-log' + (dev ? ' mono' : '')} aria-live="polite">
                  {lines.map((l, i) => (
                    <div key={i} className="ln-logline rise">
                      {!dev && <Icon name="check" size={13} />}
                      <span>{l}</span>
                    </div>
                  ))}
                  <div className="row muted" style={{ gap: 8, fontSize: 13 }}>
                    <span className="spinner" /> {lines.length < script.length ? 'Working…' : 'Almost there…'}
                  </div>
                </div>
              )}
              {phase === 'live' && (
                <div className="ln-live">
                  <div className="col" style={{ gap: 12, minWidth: 0 }}>
                    <span className="stamp stamp-in ln-stamp">
                      Live
                      <small>Rev {rev}</small>
                    </span>
                    <div className="row" style={{ gap: 6, minWidth: 0 }}>
                      <code className="ln-url grow">{liveUrl}</code>
                      <button className="btn btn-line btn-sm" onClick={() => copy(liveUrl)}>
                        <Icon name="copy" size={13} /> Copy
                      </button>
                    </div>
                    <div className="row wrap" style={{ gap: 8 }}>
                      <a className="btn btn-line btn-sm" href={wa} target="_blank" rel="noreferrer">
                        <Icon name="send" size={13} /> Share on WhatsApp
                      </a>
                      <button className="btn btn-ghost btn-sm" onClick={() => setPhase('idle')}>
                        <Icon name="refresh" size={13} /> Launch again
                      </button>
                    </div>
                    <p className="muted" style={{ fontSize: 12.5 }}>Put the link on your Instagram bio, or the QR on your packaging.</p>
                  </div>
                  <FakeQR text={liveUrl} />
                </div>
              )}
            </li>

            {/* 6. History */}
            <li className="ln-step">
              <StepHead n={6} title="Deploy history" state="info" />
              {deploys.length === 0 ? (
                <p className="muted">Nothing launched yet. Your first launch shows up here.</p>
              ) : (
                <div className="col" style={{ gap: 6 }}>
                  {dev && (
                    <div className="ln-deploy ln-preview">
                      <span className="badge badge-amber">Preview</span>
                      <span className="grow">
                        <b>Rev {String.fromCharCode(rev.charCodeAt(0) + 1)}</b>{' '}
                        <span className="muted mono" style={{ fontSize: 12 }}>preview-a7f2.{liveHost}</span>
                      </span>
                      <button className="btn btn-line btn-sm" onClick={() => setConfirm({ kind: 'promote' })}>
                        <Icon name="up" size={13} /> Promote preview to production
                      </button>
                    </div>
                  )}
                  {deploys.map((d) => (
                    <div key={d.id} className="col" style={{ gap: 0 }}>
                      <div className="ln-deploy">
                        {d.status === 'live' ? (
                          <span className="badge badge-green"><span className="dot" /> Live</span>
                        ) : (
                          <span className="badge">Earlier</span>
                        )}
                        <span className="grow">
                          <b>Rev {d.rev}</b> <span className="muted" style={{ fontSize: 13 }}>· {d.when}</span>
                        </span>
                        {dev && (
                          <button
                            className="btn btn-ghost btn-sm"
                            aria-expanded={openLogs.includes(d.id)}
                            onClick={() => setOpenLogs((o) => (o.includes(d.id) ? o.filter((x) => x !== d.id) : [...o, d.id]))}
                          >
                            <Icon name="terminal" size={13} /> Logs
                          </button>
                        )}
                        {d.status !== 'live' && (
                          <button className="btn btn-line btn-sm" onClick={() => setConfirm({ kind: 'rollback', d })}>
                            <Icon name="undo" size={13} /> Roll back
                          </button>
                        )}
                      </div>
                      {dev && openLogs.includes(d.id) && (
                        <pre className="ln-logs">{`[${d.when}] deploy ${d.id} rev ${d.rev}
build ok · 14 routes · agents image sha256:${(d.id + 'a91c3f').slice(-7)}
region ${region} · health 200 · p50 1.4s · errors 0`}</pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
          </ol>

          <aside className="ln-aside">
            <div className="sheet-ink ln-after">
              <span className="label">What happens after launch</span>
              <div className="ln-after-row">
                <Icon name="eye" size={16} />
                <div className="col" style={{ gap: 6 }}>
                  <b>I keep watching</b>
                  <p style={{ fontSize: 13 }}>I’ll tell you if the chat breaks, in plain words, on WhatsApp or email.</p>
                  <div className="seg" role="group" aria-label="Alerts">
                    <button className={notify === 'whatsapp' ? 'is-on' : ''} onClick={() => setNotify('whatsapp')}>WhatsApp</button>
                    <button className={notify === 'email' ? 'is-on' : ''} onClick={() => setNotify('email')}>Email</button>
                  </div>
                </div>
              </div>
              <div className="ln-after-row">
                <Icon name="coin" size={16} />
                <div className="col" style={{ gap: 2 }}>
                  <b>
                    About <span className="mono">₹{costDay + 18}</span> a day
                  </b>
                  <p className="muted" style={{ fontSize: 12.5 }}>
                    {dev
                      ? `₹${costDay} compute + ~₹18 model tokens at 200 chats/day`
                      : 'At 200 chats a day. Quiet days cost less.'}
                  </p>
                </div>
              </div>
              <div className="ln-after-row">
                <Icon name="chat" size={16} />
                <div className="col" style={{ gap: 2 }}>
                  <b>
                    <span className="mono">{convos}</span> conversations
                  </b>
                  <p className="muted" style={{ fontSize: 12.5 }}>
                    {phase === 'live' ? 'Since launch. They land in your inbox.' : 'Counting starts when you launch.'}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {confirm && (
        <Modal
          title={confirm.kind === 'rollback' ? `Roll back to rev ${confirm.d.rev}?` : 'Promote preview to production?'}
          sub={
            confirm.kind === 'rollback'
              ? 'Customers see the older version in about 20 seconds. The current one stays saved.'
              : 'The preview becomes what customers see. The current live version stays in history.'
          }
          onClose={() => setConfirm(null)}
          foot={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (confirm.kind === 'rollback') {
                    const target = confirm.d
                    setDeploys((ds) => ds.map((d) => ({ ...d, status: d.id === target.id ? 'live' : 'previous' })))
                    toast(`Rolled back to rev ${target.rev}.`)
                  } else {
                    const next = String.fromCharCode(rev.charCodeAt(0) + 1)
                    setDeploys((ds) => [
                      { id: 'd' + Date.now(), when: 'Just now', rev: next, status: 'live' },
                      ...ds.map((d) => ({ ...d, status: 'previous' as const })),
                    ])
                    toast(`Rev ${next} is live.`)
                  }
                  setConfirm(null)
                }}
              >
                {confirm.kind === 'rollback' ? 'Roll back' : 'Promote'}
              </button>
            </>
          }
        >
          {confirm.kind === 'rollback' ? (
            <p style={{ fontSize: 14 }}>
              Anything you fixed after rev {confirm.d.rev} goes away for customers until you roll forward.
            </p>
          ) : (
            <p style={{ fontSize: 14 }}>Same checks as a launch: inspection gate, evals, health. If any fail, nothing changes.</p>
          )}
        </Modal>
      )}
    </div>
  )
}

function StepHead({ n, title, state }: { n: number; title: string; state: 'done' | 'blocked' | 'todo' | 'info' }) {
  return (
    <div className="ln-stephead">
      <span className="ln-num mono" aria-hidden="true">
        {state === 'done' ? <Icon name="check" size={13} /> : String(n).padStart(2, '0')}
      </span>
      <h2>{title}</h2>
      {state === 'blocked' && <span className="badge badge-red">Blocked</span>}
    </div>
  )
}
