import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo, ThemeToggle } from '../components/ui'
import { Icon } from '../components/Icon'
import diagramUrl from '../../docs/architecture.svg?url'

const REPO_DOC = 'https://github.com/ritikadas98/architect/blob/main/docs/ARCHITECTURE.md'

const STEPS: { title: string; body: string; tech: string }[] = [
  {
    title: 'Prompt in',
    body: 'Screenshots go to object storage. The prompt goes to the API, and the browser opens a live event stream.',
    tech: 'POST /v1/projects/{id}/turns · GET /events (SSE, Last-Event-ID replay)',
  },
  {
    title: 'Workflow starts',
    body: 'The gateway starts a durable workflow for this turn. A double-click can’t start two builds.',
    tech: 'Temporal BuildSession(projectId, turnId) · event turn.accepted',
  },
  {
    title: 'Brief, plan, estimate',
    body: 'A vision model says what it read from the references and asks questions. Then a plan, a time and credit range, and a wait for approval.',
    tech: 'brief.read · brief.question · skill.suggested · estimate.ready · signal approve',
  },
  {
    title: 'Sandbox claim',
    body: 'A pre-booted sandbox comes from the warm pool in the project’s home region. About a second.',
    tech: 'SandboxProvider.claim(template="next-agent", cell=home) · sandbox.ready',
  },
  {
    title: 'Preview route',
    body: 'The project gets its own preview address, on a domain kept apart from ours.',
    tech: 'Redis route 3000-a7f2.archpreview.app → {sandbox, port, cell, token}',
  },
  {
    title: 'Code',
    body: 'The coder edits files through a small daemon inside the sandbox. The agent itself runs outside it.',
    tech: 'search_replace · write_file · exec over mTLS tunnel · file.diff events',
  },
  {
    title: 'Installs and outbound calls',
    body: 'Everything leaving the sandbox goes through the egress proxy. Real keys are added there, never in the code.',
    tech: 'allowlist · package mirror · placeholder → vault secret swap',
  },
  {
    title: 'Live preview',
    body: 'The preview loads through the preview proxy. Every edit hot-reloads. Click any element to edit it.',
    tech: 'preview proxy → cell tunnel → dev server :3000 · HMR WebSocket',
  },
  {
    title: 'Verify and self-heal',
    body: 'The tester builds, clicks through flows and runs agent evals. It fixes its own mistakes, and those fixes are free.',
    tech: 'typecheck · Playwright · evals · fix.applied {billable:false}',
  },
  {
    title: 'Checkpoint',
    body: 'Each green turn is saved three ways, so undo really undoes.',
    tech: 'git commit (GitHub App) + sandbox snapshot + database branch',
  },
  {
    title: 'Inspect and deploy',
    body: 'A security review in plain language. Must-fix items block launch. Then an immutable deploy.',
    tech: 'Semgrep + LLM review + runtime probes · Workers + Cloud Run · domain',
  },
  {
    title: 'Running',
    body: 'Customers use the live app. Model calls are metered and capped. The builder sandbox goes to sleep.',
    tech: '/invoke · LiteLLM virtual key · OTel traces · hibernate after 10 min',
  },
]

const COMPONENTS: { name: string; choice: string; why: string }[] = [
  {
    name: 'Build orchestrator',
    choice: 'Temporal workflows. Child workflow per sub-agent.',
    why: 'A build is 10–30 minutes of work and human waits. It must survive crashes and deploys.',
  },
  {
    name: 'Agent harness',
    choice: 'Planner, coder, tester, inspector. Runs outside the sandbox.',
    why: 'If generated code crashes the sandbox, the agent survives to fix it. And it never holds secrets.',
  },
  {
    name: 'Model gateway',
    choice: 'LiteLLM proxy, called through the AI SDK.',
    why: 'One API for every provider. Budgets, fallbacks, caching, bring-your-own-key and metering in one place.',
  },
  {
    name: 'Sandboxes',
    choice: 'SandboxProvider interface. E2B and Modal first, GKE + gVisor warm pools at scale.',
    why: 'Two vendors from day one, so one outage isn’t ours. Own fleet once volume makes it cheaper.',
  },
  {
    name: 'Three proxies',
    choice: 'Preview proxy, LLM gateway, egress proxy with secret injection.',
    why: 'Previews are isolated. Model spend is controlled. Real keys never enter generated code.',
  },
  {
    name: 'GitHub',
    choice: 'GitHub App with 1-hour installation tokens. Branch or PR mode.',
    why: 'Per-repo access only. Two-way sync. We never force-push your branch.',
  },
  {
    name: 'Skills & MCP',
    choice: 'Registry with embedding match on the brief. MCP servers sandboxed.',
    why: 'The right add-ons find you. Only the ones you need load into the agent’s context.',
  },
  {
    name: 'Inspection',
    choice: 'Static analysis, LLM review and runtime probes.',
    why: 'Founders don’t know what they’re missing. Each finding is written twice: plain and exact.',
  },
  {
    name: 'Agents in any framework',
    choice: 'OCI image with /invoke, /stream, /health. Adapters per framework.',
    why: 'Lyzr ADK, LangGraph, CrewAI and OpenAI Agents SDK run, trace and deploy the same way.',
  },
  {
    name: 'Deploy',
    choice: 'Frontend at the edge, agents on Cloud Run. Immutable builds.',
    why: 'Rollback is a pointer move, in seconds. Live apps keep running if the builder is down.',
  },
  {
    name: 'Data',
    choice: 'Postgres, Redis Streams, object storage, pgvector, ClickHouse.',
    why: 'Each store does one job. The event log and metering stay out of the transactional database.',
  },
  {
    name: 'Scale',
    choice: 'Regional cells, warm pools, hibernation, admission control.',
    why: 'Model rate limits break first, not sandboxes. Tokens are over 95% of a build’s cost.',
  },
]

const NUMBERS = [
  { k: '5,000', v: 'concurrent sessions (assumed)' },
  { k: '~340', v: 'warm sandboxes to absorb claims' },
  { k: '420M', v: 'input tokens per minute at peak' },
  { k: '≈ $4.40', v: 'model + sandbox cost per build' },
]

export default function Architecture() {
  const [zoom, setZoom] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!zoom) return
    closeRef.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(false)
    window.addEventListener('keydown', k)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', k)
      document.body.style.overflow = prev
    }
  }, [zoom])

  return (
    <div className="grid-bg" style={{ minHeight: '100%' }}>
      <style>{CSS}</style>
      <header className="ar-top">
        <Link to="/" aria-label="Architect home" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Logo />
        </Link>
        <nav className="row" style={{ gap: 4 }}>
          <Link to="/" className="btn btn-ghost btn-sm ar-hide-sm">Home page</Link>
          <Link to="/home" className="btn btn-line btn-sm">Your projects</Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="page col" style={{ gap: 40 }}>
        <section className="col" style={{ gap: 12 }}>
          <span className="label">Drawing 01 · System architecture · Rev A</span>
          <h1 className="ar-h1">How a prompt becomes a live app.</h1>
          <p className="ar-lede">
            A control plane plans and writes the code. A sandbox per project runs it. Three proxies sit between them,
            and one of them keeps real keys out of generated code. Every vendor sits behind an interface.
          </p>
          <p className="muted" style={{ fontSize: 13 }}>
            Full write-up:{' '}
            <a href={REPO_DOC} target="_blank" rel="noreferrer" className="ar-link">
              ARCHITECTURE.md in the GitHub repo <Icon name="external" size={12} />
            </a>
          </p>
        </section>

        <section className="col" style={{ gap: 10 }}>
          <button className="ar-figure" onClick={() => setZoom(true)} aria-label="Open the diagram full screen">
            <img
              src={diagramUrl}
              alt="Architect 2.0 system architecture: clients, edge, control plane, data plane cell, model gateway, user app hosting and data stores, with the prompt-to-live path numbered 1 to 12."
            />
            <span className="ar-zoomhint chip">
              <Icon name="search" size={13} /> Click to zoom
            </span>
          </button>
          <p className="label">Red arrows are the critical path. Numbers match the steps below.</p>
        </section>

        <section className="ar-numbers">
          {NUMBERS.map((n) => (
            <div key={n.v} className="ar-num">
              <span className="mono ar-num-k">{n.k}</span>
              <span className="muted" style={{ fontSize: 12.5 }}>{n.v}</span>
            </div>
          ))}
        </section>

        <section className="col" style={{ gap: 16 }}>
          <div className="col" style={{ gap: 4 }}>
            <span className="label">Critical path</span>
            <h2 style={{ fontSize: 24 }}>Prompt → live, in twelve steps</h2>
          </div>
          <ol className="ar-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="ar-step">
                <span className="ar-badge" aria-hidden="true">{i + 1}</span>
                <div className="col" style={{ gap: 4, minWidth: 0 }}>
                  <h3 style={{ fontSize: 15 }}>{s.title}</h3>
                  <p style={{ color: 'var(--ink-2)' }}>{s.body}</p>
                  <code className="ar-tech">{s.tech}</code>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="col" style={{ gap: 16 }}>
          <div className="col" style={{ gap: 4 }}>
            <span className="label">Components</span>
            <h2 style={{ fontSize: 24 }}>What we picked, and why</h2>
          </div>
          <div className="ar-table" role="table" aria-label="Component choices">
            <div className="ar-row ar-head" role="row">
              <span role="columnheader" className="label">Part</span>
              <span role="columnheader" className="label">Choice</span>
              <span role="columnheader" className="label">Why</span>
            </div>
            {COMPONENTS.map((c) => (
              <div key={c.name} className="ar-row" role="row">
                <strong role="cell">{c.name}</strong>
                <span role="cell">{c.choice}</span>
                <span role="cell" className="muted">{c.why}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="sheet-ink ar-proto">
          <div className="col" style={{ gap: 6 }}>
            <span className="badge badge-amber" style={{ alignSelf: 'flex-start' }}>Honest note</span>
            <h3 style={{ fontSize: 17 }}>What this prototype is</h3>
            <p style={{ color: 'var(--ink-2)', maxWidth: 640 }}>
              A front-end with scripted flows, hosted on GitHub Pages. Sign-in and a projects table can use Supabase.
              Everything else on this page is designed, not built. The write-up says which is which.
            </p>
          </div>
          <a href={REPO_DOC} target="_blank" rel="noreferrer" className="btn btn-primary">
            Read ARCHITECTURE.md <Icon name="external" size={14} />
          </a>
        </section>
      </main>

      {zoom && (
        <div
          className="ar-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Architecture diagram, full screen"
          onMouseDown={(e) => e.target === e.currentTarget && setZoom(false)}
        >
          <div className="ar-modal-bar">
            <span className="label" style={{ color: '#F3F0E8' }}>System architecture · scroll to pan</span>
            <div className="row" style={{ gap: 6 }}>
              <a href={diagramUrl} target="_blank" rel="noreferrer" className="btn btn-sm ar-modal-btn">
                Open SVG <Icon name="external" size={12} />
              </a>
              <button ref={closeRef} className="btn btn-sm ar-modal-btn" onClick={() => setZoom(false)} aria-label="Close">
                <Icon name="x" size={14} /> Close
              </button>
            </div>
          </div>
          <div className="ar-modal-scroll">
            <img src={diagramUrl} alt="Architect 2.0 system architecture, full size" />
          </div>
        </div>
      )}
    </div>
  )
}

const CSS = `
.ar-top {
  position: sticky; top: 0; z-index: 10;
  height: var(--topbar-h);
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 0 24px;
  background: var(--paper);
  border-bottom: 1px solid var(--rule);
}
@media (max-width: 640px) { .ar-top { padding: 0 16px; } }
@media (max-width: 480px) { .ar-hide-sm { display: none; } }
.ar-figure, .ar-numbers, .ar-steps, .ar-table { min-width: 0; max-width: 100%; }
.ar-h1 { font-size: clamp(28px, 5vw, 44px); font-stretch: 118%; max-width: 760px; }
.ar-lede { font-size: 16px; color: var(--ink-2); max-width: 680px; }
.ar-link { color: var(--red-text); display: inline-flex; align-items: center; gap: 4px; }
.ar-figure {
  position: relative; display: block; width: 100%; padding: 0;
  border: 1.5px solid var(--ink); border-radius: var(--r-md);
  background: #F3F0E8; cursor: zoom-in; overflow: hidden;
}
.ar-figure img { display: block; width: 100%; height: auto; }
.ar-zoomhint { position: absolute; right: 12px; bottom: 12px; background: var(--sheet); }
.ar-figure:hover .ar-zoomhint { border-color: var(--ink); }
.ar-numbers {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--rule-strong); background: var(--sheet);
}
.ar-num { display: flex; flex-direction: column; gap: 2px; padding: 14px 16px; border-left: 1px solid var(--rule); }
.ar-num:first-child { border-left: 0; }
.ar-num-k { font-size: 22px; font-weight: 700; color: var(--ink); }
@media (max-width: 760px) {
  .ar-numbers { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ar-num:nth-child(3) { border-left: 0; }
  .ar-num:nth-child(n+3) { border-top: 1px solid var(--rule); }
}
.ar-steps {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;
}
@media (max-width: 760px) { .ar-steps { grid-template-columns: 1fr; } }
.ar-step {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 14px; background: var(--sheet); border: 1px solid var(--rule);
  border-radius: var(--r-sm);
}
.ar-badge {
  flex: none; width: 24px; height: 24px; border-radius: 50%;
  display: inline-grid; place-items: center;
  background: var(--red); color: #fff; font-weight: 800; font-size: 12px;
}
.ar-tech {
  font-size: 11.5px; color: var(--ink-3); overflow-wrap: anywhere;
  border-top: 1px dashed var(--rule); padding-top: 6px; margin-top: 2px;
}
.ar-table { border: 1px solid var(--rule-strong); background: var(--sheet); }
.ar-row {
  display: grid; grid-template-columns: 180px 1fr 1.2fr; gap: 16px;
  padding: 12px 16px; border-top: 1px solid var(--rule);
}
.ar-row:first-child { border-top: 0; }
.ar-head { background: var(--sheet-2); padding-top: 8px; padding-bottom: 8px; }
@media (max-width: 760px) {
  .ar-row { grid-template-columns: 1fr; gap: 4px; }
  .ar-head { display: none; }
  .ar-row:nth-child(2) { border-top: 0; }
}
.ar-proto {
  display: flex; gap: 20px; align-items: center; justify-content: space-between; flex-wrap: wrap;
  padding: 20px; background: var(--sheet);
}
.ar-modal {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(12, 12, 10, 0.88);
  display: flex; flex-direction: column;
}
.ar-modal-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 16px; background: #16150F;
}
.ar-modal-btn { background: transparent; color: #F3F0E8; border-color: rgba(243,240,232,0.4); box-shadow: none; }
.ar-modal-btn:hover { border-color: #F3F0E8; }
.ar-modal-scroll { flex: 1; overflow: auto; padding: 16px; }
.ar-modal-scroll img { display: block; width: 1800px; max-width: none; height: auto; margin: 0 auto; background: #F3F0E8; }
@media (min-width: 1900px) { .ar-modal-scroll img { width: 100%; max-width: 2400px; } }
`
