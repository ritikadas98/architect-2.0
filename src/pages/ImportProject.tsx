import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Icon, type IconName } from '../components/Icon'
import { Redline } from '../components/ui'
import { useStore } from '../lib/store'

/* ---------- Scripted repos and what the scan finds ---------- */

type Finding = { plain: string; dev: string; flag?: boolean }
type Repo = {
  full: string
  stack: string
  updated: string
  priv: boolean
  hasTests: boolean
  readme: string
  findings: Finding[]
}

const REPOS: Repo[] = [
  {
    full: 'ritika/glow-store',
    stack: 'Next.js',
    updated: '2 days ago',
    priv: true,
    hasTests: false,
    readme: 'Storefront for Glow & Co. Deployed on Vercel from main.',
    findings: [
      { plain: 'A website built with Next.js', dev: 'Next.js 15 app router · TypeScript · 42 files' },
      { plain: 'People log in with Supabase', dev: '@supabase/ssr · auth middleware on /account/*' },
      { plain: 'Two bits of server code', dev: 'app/api/checkout/route.ts · app/api/webhook/route.ts' },
      { plain: 'No tests yet', dev: 'no test runner in package.json · 0 *.test.* files', flag: true },
      { plain: 'main is probably live', dev: 'vercel.json present · README says: “Deployed on Vercel from main.”', flag: true },
    ],
  },
  {
    full: 'ritika/savio',
    stack: 'React + Supabase',
    updated: '3 weeks ago',
    priv: false,
    hasTests: true,
    readme: 'Savio: savings goals for first jobbers.',
    findings: [
      { plain: 'A web app built with React', dev: 'Vite 6 · React 19 · 118 files' },
      { plain: 'Saves data in Supabase', dev: '6 tables · row-level security on 4 of 6', flag: true },
      { plain: 'A few tests exist', dev: 'vitest · 3 test files · 11 tests' },
      { plain: 'One secret sits in the code', dev: 'src/lib/supabase.ts:4 hard-codes the anon key', flag: true },
    ],
  },
  {
    full: 'ritika/fitcheck',
    stack: 'Chrome extension',
    updated: '2 months ago',
    priv: false,
    hasTests: false,
    readme: 'FitCheck: size advice on any clothing site.',
    findings: [
      { plain: 'A Chrome extension', dev: 'Manifest V3 · 27 files · content script + popup' },
      { plain: 'No server of its own', dev: 'calls one external API from background.js' },
      { plain: 'No tests yet', dev: 'no test runner · 0 test files', flag: true },
    ],
  },
]

const zipRepo = (file: string): Repo => ({
  full: file.replace(/\.zip$/i, ''),
  stack: 'Uploaded',
  updated: 'just now',
  priv: true,
  hasTests: false,
  readme: 'No README found.',
  findings: [
    { plain: 'A React website', dev: 'React 18 · Vite · 36 files · package-lock.json' },
    { plain: 'No server or database found', dev: 'no api/ folder · no env vars referenced' },
    { plain: 'No tests yet', dev: 'no test runner in package.json', flag: true },
    { plain: 'Not linked to GitHub', dev: 'no .git folder in the zip. I’ll make a repo for it', flag: true },
  ],
})

type Q = { id: string; q: string; why: string; options: { id: string; label: string }[]; def: string }

function questionsFor(r: Repo, fromZip: boolean): Q[] {
  return [
    fromZip
      ? {
          id: 'repo',
          q: 'Where should I keep the code?',
          why: 'A zip has no history. Without a repo, undo only works inside Architect.',
          options: [
            { id: 'new', label: 'Make a private GitHub repo for it' },
            { id: 'here', label: 'Keep it in Architect only' },
          ],
          def: 'new',
        }
      : {
          id: 'branch',
          q: 'Is main live? Should I work on a branch?',
          why: 'If main deploys to your site, a mistake of mine goes straight to customers.',
          options: [
            { id: 'branch', label: 'Work on a branch, open PRs' },
            { id: 'main', label: 'Commit to main directly' },
          ],
          def: 'branch',
        },
    r.hasTests
      ? {
          id: 'tests',
          q: 'You have tests. Run them before every change?',
          why: 'Then I can prove I didn’t break what already works.',
          options: [
            { id: 'run', label: 'Yes, run them every time' },
            { id: 'skip', label: 'No, just build' },
          ],
          def: 'run',
        }
      : {
          id: 'tests',
          q: 'Your repo has no tests. Want me to add basic ones before changing code?',
          why: 'Without them I can’t prove I didn’t break what already works. About 20 credits.',
          options: [
            { id: 'add', label: 'Yes, add basic tests first' },
            { id: 'skip', label: 'No, I’ll check by hand' },
          ],
          def: 'add',
        },
    {
      id: 'design',
      q: 'Keep your design exactly, or can I tidy it?',
      why: 'I’ll read your current look either way. This decides if I’m allowed to change it.',
      options: [
        { id: 'keep', label: 'Keep it exactly' },
        { id: 'tidy', label: 'Tidy spacing and type, keep the look' },
        { id: 'you', label: 'You decide' },
      ],
      def: 'keep',
    },
  ]
}

/* ---------- Sources ---------- */

type Source = 'github' | 'zip' | 'builder' | 'figma'
const SOURCES: { id: Source; icon: IconName; title: string; sub: string }[] = [
  { id: 'github', icon: 'github', title: 'GitHub repo', sub: 'Pick a repo. I work on a branch and open PRs.' },
  { id: 'zip', icon: 'upload', title: 'Upload a .zip', sub: 'A folder of code from anywhere.' },
  { id: 'builder', icon: 'refresh', title: 'From another builder', sub: 'Lovable, Bolt, v0 or Replit.' },
  { id: 'figma', icon: 'figma', title: 'Figma file', sub: 'Design only. I use it as your look, then build.' },
]

const BUILDERS: Record<string, string[]> = {
  Lovable: ['Open your project in Lovable', 'Click GitHub in the top right, then Connect', 'Pick an account. Lovable makes the repo'],
  Bolt: ['Open the project in Bolt', 'Click the GitHub icon, then Push to GitHub', 'Name the repo and push'],
  v0: ['Open the chat in v0', 'Click the GitHub icon above the preview', 'Create a repo from the latest version'],
  Replit: ['Open the Repl', 'Go to Tools, then Git', 'Connect GitHub and push to a new repo'],
}

type Step = 'source' | Source | 'scan' | 'questions'

export default function ImportProject() {
  const { mode, createProject, toast } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState<Step>('source')
  const [repo, setRepo] = useState<Repo | null>(null)
  const [fromZip, setFromZip] = useState(false)

  const pickRepo = (r: Repo, zip = false) => {
    setRepo(r)
    setFromZip(zip)
    setStep('scan')
  }

  const start = (answers: Record<string, string>) => {
    if (!repo) return
    const name = repo.full.split('/').pop() || repo.full
    const p = createProject(
      fromZip
        ? { prompt: `Imported from a zip: ${repo.full}.zip`, name, imported: { from: 'zip' }, stage: 'ready', answers }
        : {
            prompt: `Imported from GitHub: ${repo.full}`,
            name,
            imported: { from: 'github', repo: repo.full },
            stage: 'ready',
            answers,
            github: { repo: repo.full, branch: answers.branch === 'main' ? 'main' : 'architect/work', prs: answers.branch !== 'main' },
          },
    )
    toast(`${name} imported. Nothing changed yet.`)
    nav(`/p/${p.id}?tab=build`)
  }

  return (
    <AppShell>
      <style>{css}</style>
      <div className="page col" style={{ gap: 28, maxWidth: 880 }}>
        <header className="col" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            {step !== 'source' ? (
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: -10 }}
                onClick={() => setStep(step === 'scan' || step === 'questions' ? (fromZip ? 'zip' : 'github') : 'source')}
              >
                <Icon name="back" size={14} /> Back
              </button>
            ) : (
              <Link to="/home" className="btn btn-ghost btn-sm" style={{ marginLeft: -10 }}>
                <Icon name="back" size={14} /> Projects
              </Link>
            )}
          </div>
          <span className="label">Import</span>
          <h1 style={{ fontSize: 34 }}>Import an existing project and keep working.</h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>I read it first. I ask before I touch anything.</p>
        </header>

        <ol className="im-track" aria-label="Import steps">
          {['Source', 'Read', 'Questions', 'Work'].map((s, i) => {
            const cur = step === 'source' || step === 'github' || step === 'zip' || step === 'builder' || step === 'figma' ? 0 : step === 'scan' ? 1 : 2
            return (
              <li key={s} className={i === cur ? 'is-on' : i < cur ? 'is-done' : ''}>
                <span className="mono">{i < cur ? '✓' : i + 1}</span> {s}
              </li>
            )
          })}
        </ol>

        {step === 'source' && (
          <div className="im-sources">
            {SOURCES.map((s, i) => (
              <button key={s.id} className={'im-source' + (i === 0 ? ' im-main' : '')} onClick={() => setStep(s.id)}>
                <span className="im-ico">
                  <Icon name={s.icon} size={i === 0 ? 24 : 20} />
                </span>
                <span className="col" style={{ gap: 4, alignItems: 'flex-start' }}>
                  <strong style={{ fontSize: i === 0 ? 20 : 16, fontStretch: '112%' }}>{s.title}</strong>
                  <span className="muted" style={{ fontSize: 13 }}>{s.sub}</span>
                </span>
                <Icon name="arrow" size={16} style={{ marginLeft: 'auto', alignSelf: 'center' }} />
              </button>
            ))}
          </div>
        )}

        {step === 'github' && <RepoPicker onPick={(r) => pickRepo(r)} />}
        {step === 'zip' && <ZipDrop onFile={(f) => pickRepo(zipRepo(f), true)} />}
        {step === 'builder' && <BuilderSteps onDone={() => setStep('github')} />}
        {step === 'figma' && <FigmaStep />}
        {step === 'scan' && repo && <Scan repo={repo} dev={mode === 'dev'} onDone={() => setStep('questions')} />}
        {step === 'questions' && repo && <Questions qs={questionsFor(repo, fromZip)} repo={repo} onStart={start} />}
      </div>
    </AppShell>
  )
}

/* ---------- GitHub ---------- */

function RepoPicker({ onPick }: { onPick: (r: Repo) => void }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])
  const list = REPOS.filter((r) => (r.full + r.stack).toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <section className="sheet-ink rise" style={{ overflow: 'hidden' }}>
      <div className="row between wrap" style={{ padding: '14px 16px', borderBottom: '1px solid var(--rule)', gap: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <Icon name="github" size={16} />
          <strong>ritika</strong>
          <span className="badge badge-blue">Connected</span>
        </div>
        <label style={{ position: 'relative', width: 'min(260px, 100%)' }}>
          <span className="sr-only">Search repos</span>
          <Icon name="search" size={14} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--ink-3)' }} />
          <input className="input" style={{ paddingLeft: 30, fontSize: 13 }} placeholder="Search your repos" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      {loading ? (
        <div className="row" style={{ padding: 24, gap: 10 }}>
          <span className="spinner" /> <span className="muted">Loading your repos…</span>
        </div>
      ) : list.length === 0 ? (
        <p className="muted" style={{ padding: 24 }}>No repo matches “{q}”. Check the spelling, or that I have access to it.</p>
      ) : (
        list.map((r) => (
          <button key={r.full} className="im-repo" onClick={() => onPick(r)}>
            <span className="col grow" style={{ gap: 2, alignItems: 'flex-start', minWidth: 0 }}>
              <span className="row wrap" style={{ gap: 8 }}>
                <strong className="mono" style={{ fontSize: 13.5 }}>{r.full}</strong>
                {r.priv && <span className="badge">Private</span>}
              </span>
              <span className="muted" style={{ fontSize: 12.5 }}>
                {r.stack} · updated {r.updated}
              </span>
            </span>
            <span className="btn btn-sm btn-line">Pick</span>
          </button>
        ))
      )}
      <p className="muted" style={{ padding: '10px 16px', fontSize: 12, borderTop: '1px solid var(--rule)' }}>
        Don’t see it? I only see repos you’ve given the Architect GitHub app access to.
      </p>
    </section>
  )
}

/* ---------- Zip ---------- */

function ZipDrop({ onFile }: { onFile: (name: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const take = (f?: File) => {
    if (!f) return
    if (!/\.zip$/i.test(f.name)) {
      setErr(`${f.name} isn’t a .zip. Zip the folder first, then drop it here.`)
      return
    }
    setErr('')
    setPicked(f.name)
    setTimeout(() => onFile(f.name), 700)
  }
  return (
    <section className="col rise" style={{ gap: 10 }}>
      <div
        className={'im-drop' + (over ? ' is-over' : '')}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          take(e.dataTransfer.files[0])
        }}
      >
        {picked ? (
          <div className="row" style={{ gap: 10 }}>
            <span className="spinner" />
            <span className="mono">{picked}</span>
            <span className="muted">Unpacking…</span>
          </div>
        ) : (
          <>
            <Icon name="upload" size={26} />
            <strong style={{ fontSize: 16 }}>Drop a .zip here</strong>
            <span className="muted" style={{ fontSize: 13 }}>Up to 200 MB. Leave out node_modules if you can.</span>
            <button className="btn" onClick={() => input.current?.click()}>
              <Icon name="folder" size={14} /> Choose a file
            </button>
          </>
        )}
        <input ref={input} type="file" accept=".zip,application/zip" hidden onChange={(e) => take(e.target.files?.[0])} />
      </div>
      {err && <p style={{ color: 'var(--red-text)', fontSize: 13 }}>{err}</p>}
    </section>
  )
}

/* ---------- Other builders ---------- */

function BuilderSteps({ onDone }: { onDone: () => void }) {
  const [b, setB] = useState('Lovable')
  return (
    <section className="sheet-ink rise" style={{ padding: 20, display: 'grid', gap: 16 }}>
      <div className="col" style={{ gap: 4 }}>
        <h2 style={{ fontSize: 18 }}>Export to GitHub there, then pick it here.</h2>
        <p className="muted" style={{ fontSize: 13 }}>Every builder can push to GitHub. It takes about a minute.</p>
      </div>
      <div className="seg" role="group" aria-label="Builder" style={{ justifySelf: 'start', flexWrap: 'wrap' }}>
        {Object.keys(BUILDERS).map((k) => (
          <button key={k} className={b === k ? 'is-on' : ''} onClick={() => setB(k)}>
            {k}
          </button>
        ))}
      </div>
      <ol className="im-steps">
        {BUILDERS[b].map((s) => (
          <li key={s}>{s}</li>
        ))}
        <li>Come back and pick the repo</li>
      </ol>
      <button className="btn btn-primary" style={{ justifySelf: 'start' }} onClick={onDone}>
        I’ve pushed it. Show my repos <Icon name="arrow" size={14} />
      </button>
    </section>
  )
}

/* ---------- Figma ---------- */

function FigmaStep() {
  const { createProject, toast } = useStore()
  const nav = useNavigate()
  const [url, setUrl] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'bad'>('idle')
  const go = () => {
    if (!/figma\.com\/(file|design)\//i.test(url)) return setState('bad')
    setState('busy')
    setTimeout(() => {
      const p = createProject({ prompt: `Design from Figma: ${url.trim()}`, imported: { from: 'figma' } })
      toast('Read 6 frames. Starting your brief.')
      nav(`/p/${p.id}/brief`)
    }, 1300)
  }
  return (
    <section className="sheet-ink rise" style={{ padding: 20, display: 'grid', gap: 14 }}>
      <div className="col" style={{ gap: 4 }}>
        <h2 style={{ fontSize: 18 }}>Paste a Figma link.</h2>
        <p className="muted" style={{ fontSize: 13 }}>Design only. I read colours, type and layout, and treat them as rules. Then we plan the app together.</p>
      </div>
      <form
        className="row wrap"
        style={{ gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault()
          go()
        }}
      >
        <label className="sr-only" htmlFor="figma-url">Figma link</label>
        <input
          id="figma-url"
          className="input mono grow"
          style={{ fontSize: 13, minWidth: 220 }}
          placeholder="https://www.figma.com/design/…"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setState('idle')
          }}
        />
        <button className="btn" type="submit" disabled={!url.trim() || state === 'busy'}>
          {state === 'busy' ? <span className="spinner" /> : <Icon name="figma" size={14} />}
          {state === 'busy' ? 'Reading frames' : 'Read it'}
        </button>
      </form>
      {state === 'bad' && <p style={{ color: 'var(--red-text)', fontSize: 13 }}>That isn’t a Figma file link. It should contain figma.com/design/.</p>}
      {state === 'idle' && !url && (
        <button className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} onClick={() => setUrl('https://www.figma.com/design/Gl0w/glow-support-desk')}>
          Try an example link
        </button>
      )}
    </section>
  )
}

/* ---------- Scan ---------- */

function Scan({ repo, dev, onDone }: { repo: Repo; dev: boolean; onDone: () => void }) {
  const [n, setN] = useState(0)
  const done = n >= repo.findings.length
  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setN((x) => x + 1), 650)
    return () => clearTimeout(t)
  }, [n, done])
  return (
    <section className="sheet-ink rise" style={{ overflow: 'hidden' }}>
      <div className="row between wrap" style={{ padding: '14px 16px', borderBottom: '1px solid var(--rule)', gap: 8 }}>
        <div className="row" style={{ gap: 10 }}>
          {done ? <Icon name="check" size={16} style={{ color: 'var(--green)' }} /> : <span className="spinner" />}
          <strong>{done ? 'Done reading. Here’s what I found.' : 'I’m reading your project…'}</strong>
        </div>
        <span className="mono muted" style={{ fontSize: 12 }}>{repo.full}</span>
      </div>
      <div className="bar" style={{ borderRadius: 0 }}>
        <i style={{ width: `${(n / repo.findings.length) * 100}%`, background: 'var(--red)' }} />
      </div>
      <ul className="im-found">
        {repo.findings.slice(0, n).map((f) => (
          <li key={f.plain} className="rise">
            <Icon name={f.flag ? 'flag' : 'check'} size={15} style={{ color: f.flag ? 'var(--red)' : 'var(--green)', marginTop: 2 }} />
            <span className="col" style={{ gap: 1 }}>
              <span style={{ fontWeight: 600 }}>{f.plain}</span>
              <span className="mono muted" style={{ fontSize: 11.5 }}>{f.dev}</span>
            </span>
          </li>
        ))}
        {!done && (
          <li className="muted" style={{ fontSize: 13 }}>
            <span style={{ width: 15 }} /> Reading {dev ? 'package.json, routes, env usage' : 'the next part'}…
          </li>
        )}
      </ul>
      {done && (
        <div className="row between wrap rise" style={{ padding: '14px 16px', borderTop: '1px solid var(--rule)', gap: 10 }}>
          <span className="muted" style={{ fontSize: 13 }}>README says: “{repo.readme}”</span>
          <button className="btn btn-primary" onClick={onDone}>
            Looks right <Icon name="arrow" size={14} />
          </button>
        </div>
      )}
    </section>
  )
}

/* ---------- Questions ---------- */

function Questions({ qs, repo, onStart }: { qs: Q[]; repo: Repo; onStart: (a: Record<string, string>) => void }) {
  const [a, setA] = useState<Record<string, string>>(() => Object.fromEntries(qs.map((q) => [q.id, q.def])))
  return (
    <section className="col rise" style={{ gap: 16 }}>
      <div className="col" style={{ gap: 4 }}>
        <h2 style={{ fontSize: 20 }}>3 questions before I touch anything.</h2>
        <p className="muted" style={{ fontSize: 13.5 }}>I picked a default for each. Change any you disagree with.</p>
      </div>
      {qs.map((q, i) => (
        <fieldset key={q.id} className="sheet im-q">
          <legend className="sr-only">{q.q}</legend>
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <span className="mono im-qn">{i + 1}</span>
            <div className="col grow" style={{ gap: 4 }}>
              <strong style={{ fontSize: 15 }}>{q.q}</strong>
              <span className="muted" style={{ fontSize: 13 }}>{q.why}</span>
            </div>
          </div>
          <div className="row wrap" style={{ gap: 8, paddingLeft: 34 }}>
            {q.options.map((o) => (
              <button
                key={o.id}
                type="button"
                className={'chip' + (a[q.id] === o.id ? ' is-on' : '')}
                aria-pressed={a[q.id] === o.id}
                onClick={() => setA((x) => ({ ...x, [q.id]: o.id }))}
                style={{ height: 'auto', minHeight: 30, whiteSpace: 'normal', textAlign: 'left', padding: '5px 12px' }}
              >
                {o.label}
              </button>
            ))}
          </div>
          {a[q.id] === q.def && (
            <div style={{ paddingLeft: 34 }}>
              <Redline style={{ fontSize: 13.5 }}>My pick. Change it if I’m wrong.</Redline>
            </div>
          )}
        </fieldset>
      ))}
      <div className="row between wrap sheet" style={{ padding: 16, gap: 12 }}>
        <span style={{ fontSize: 13.5 }}>
          {a.branch === 'main' ? 'I’ll commit to main.' : a.repo === 'here' ? 'I’ll keep the code in Architect.' : `I’ll work on a branch of ${repo.full} and open PRs.`}{' '}
          <span className="muted">Nothing changes until you ask.</span>
        </span>
        <button className="btn btn-primary btn-lg" onClick={() => onStart(a)}>
          Start working <Icon name="arrow" size={15} />
        </button>
      </div>
    </section>
  )
}

const css = `
.im-track { list-style: none; margin: 0; padding: 0; display: flex; gap: 6px; flex-wrap: wrap; }
.im-track li { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; color: var(--ink-4); padding: 4px 10px 4px 4px; border: 1px solid var(--rule); border-radius: 999px; }
.im-track li span { width: 20px; height: 20px; border-radius: 50%; display: inline-grid; place-items: center; font-size: 11px; background: var(--paper-2); }
.im-track li.is-on { color: var(--ink); border-color: var(--ink); }
.im-track li.is-on span { background: var(--ink); color: var(--on-ink); }
.im-track li.is-done { color: var(--ink-2); }
.im-sources { display: grid; grid-template-columns: 1.15fr 1fr; gap: 12px; }
.im-source { display: flex; gap: 14px; align-items: flex-start; text-align: left; padding: 18px; border: 1px solid var(--rule-strong); background: var(--sheet); border-radius: var(--r-md); transition: transform .08s, box-shadow .08s; }
.im-source:hover { border-color: var(--ink); box-shadow: var(--shadow-hard); transform: translate(-1px, -1px); }
.im-source.im-main { grid-row: span 3; flex-direction: column; justify-content: space-between; padding: 24px; border: 1.5px solid var(--ink); }
.im-source.im-main > svg:last-child { align-self: flex-start !important; margin-left: 0 !important; }
.im-ico { width: 44px; height: 44px; display: inline-grid; place-items: center; border: 1.5px solid var(--ink); border-radius: var(--r-sm); background: var(--sheet-2); flex: none; }
.im-repo { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 14px 16px; border: 0; border-bottom: 1px solid var(--rule); background: transparent; }
.im-repo:hover { background: var(--sheet-2); }
.im-drop { border: 1.5px dashed var(--rule-strong); border-radius: var(--r-md); background: var(--sheet); min-height: 220px; display: grid; place-items: center; align-content: center; gap: 8px; padding: 24px; text-align: center; transition: border-color .15s, background .15s; }
.im-drop.is-over { border-color: var(--red); background: var(--red-wash); }
.im-steps { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; }
.im-steps li::marker { font-family: var(--font-mono); color: var(--red-text); }
.im-found { list-style: none; margin: 0; padding: 8px 16px; display: grid; }
.im-found li { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px dashed var(--rule); }
.im-found li:last-child { border-bottom: 0; }
.im-q { padding: 16px; margin: 0; display: grid; gap: 12px; min-width: 0; }
.im-qn { width: 24px; height: 24px; flex: none; display: inline-grid; place-items: center; border: 1.5px solid var(--ink); border-radius: 50%; font-size: 11px; font-weight: 700; }
@media (max-width: 720px) {
  .im-sources { grid-template-columns: 1fr; }
  .im-source.im-main { grid-row: auto; padding: 18px; flex-direction: row; }
  .im-source.im-main > svg:last-child { align-self: center !important; margin-left: auto !important; }
}
@media (max-width: 480px) {
  .im-q .row[style] { padding-left: 0 !important; }
  .im-q > div[style] { padding-left: 0 !important; }
}
`
