import { useState } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import { Modal } from '../../components/ui'
import { useStore, type Project } from '../../lib/store'
import type { AgentDef, FrameworkId } from './data'
import { FRAMEWORKS, TEMPLATES, codeFor, slug } from './data'

export function AddAgentModal({
  agents,
  onClose,
  onAdd,
}: {
  agents: AgentDef[]
  onClose: () => void
  onAdd: (a: { name: string; role: string; instructions: string; tools: string[]; from: string; edge: string }) => void
}) {
  const [tpl, setTpl] = useState('custom')
  const [what, setWhat] = useState('')
  const [name, setName] = useState('')
  const [from, setFrom] = useState('desk')
  const [edge, setEdge] = useState('')
  const t = TEMPLATES.find((x) => x.id === tpl)!
  const ready = what.trim().length > 3 || tpl !== 'custom'

  return (
    <Modal
      title="Add an agent"
      sub="Describe it like you’d describe a new hire. I’ll write the rest."
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!ready}
            onClick={() =>
              onAdd({
                name: name.trim() || (tpl === 'custom' ? 'New agent' : t.name),
                role: what.trim() || t.role,
                instructions: t.instructions || what.trim(),
                tools: t.tools,
                from,
                edge: edge.trim() || t.edge,
              })
            }
          >
            <Icon name="plus" size={14} /> Add to canvas
          </button>
        </>
      }
    >
      <div className="col" style={{ gap: 16 }}>
        <label className="field">
          <span>What should it do?</span>
          <textarea
            className="textarea"
            rows={3}
            autoFocus
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            placeholder="e.g. Answer questions about which products suit sensitive skin"
          />
        </label>
        <div className="field">
          <span>Start from</span>
          <div className="ag-tpls">
            {TEMPLATES.map((x) => (
              <button
                key={x.id}
                className={'ag-tpl' + (tpl === x.id ? ' is-on' : '')}
                aria-pressed={tpl === x.id}
                onClick={() => {
                  setTpl(x.id)
                  if (!name || TEMPLATES.some((y) => y.name === name)) setName(x.id === 'custom' ? '' : x.name)
                }}
              >
                <b>{x.name}</b>
                <span>{x.what}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="ag-2col">
          <label className="field">
            <span>Name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="New agent" />
          </label>
          <label className="field">
            <span>Who passes it work?</span>
            <select className="select" value={from} onChange={(e) => setFrom(e.target.value)}>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span>When?</span>
          <input className="input" value={edge} onChange={(e) => setEdge(e.target.value)} placeholder={t.edge} />
          <small className="muted">This becomes the label on the arrow.</small>
        </label>
      </div>
    </Modal>
  )
}

type ExportKind = 'download' | 'github' | 'api'

export function ExportModal({
  project,
  agent,
  agents,
  framework,
  limitInCode,
  onClose,
}: {
  project: Project
  agent: AgentDef
  agents: AgentDef[]
  framework: FrameworkId
  limitInCode: boolean
  onClose: () => void
}) {
  const { toast } = useStore()
  const [kind, setKind] = useState<ExportKind>('api')
  const [busy, setBusy] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [repo, setRepo] = useState(project.github?.repo || 'ritika/glow-support')
  const fw = FRAMEWORKS.find((f) => f.id === framework)!
  const s = slug(agent.name)
  const app = slug(project.name).replace(/_/g, '-').slice(0, 24)
  const url = `https://api.architect.app/v1/${app}/agents/${s}`
  const curl = `curl -X POST ${url}/invoke \\
  -H "Authorization: Bearer $ARCHITECT_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "mera order kab aayega? #1043", "session": "cust_81"}'`

  const opts: { id: ExportKind; icon: IconName; title: string; sub: string }[] = [
    { id: 'download', icon: 'download', title: 'Download as code', sub: `Every agent, written in ${fw.name}` },
    { id: 'github', icon: 'github', title: 'Push to GitHub', sub: 'Opens a pull request. Nothing merges on its own' },
    { id: 'api', icon: 'globe', title: 'Deploy as API endpoint', sub: 'Call it from any app you already have' },
  ]

  const copy = (text: string) => {
    try {
      navigator.clipboard.writeText(text)
      toast('Copied.')
    } catch {
      toast('Couldn’t copy. Select and copy it by hand.')
    }
  }

  const download = () => {
    const body = agents.map((a) => `# ---- ${a.name} ----\n${codeFor(framework, a, agents, limitInCode)}`).join('\n\n')
    const blob = new Blob([body], { type: 'text/plain' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `${app}-agents-${framework}.${framework === 'docker' ? 'txt' : 'py'}`
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 1000)
    toast('Downloaded. Every agent in one file.')
  }

  return (
    <Modal wide title="Export agents" sub={`${agents.length} agents · ${fw.name} · same contract whichever you pick`} onClose={onClose}>
      <div className="ag-export">
        <div className="col" style={{ gap: 6 }} role="radiogroup" aria-label="Export as">
          {opts.map((o) => (
            <button key={o.id} role="radio" aria-checked={kind === o.id} className={'ag-opt' + (kind === o.id ? ' is-on' : '')} onClick={() => setKind(o.id)}>
              <Icon name={o.icon} size={16} />
              <span className="col" style={{ gap: 1, alignItems: 'flex-start' }}>
                <b>{o.title}</b>
                <small className="muted">{o.sub}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="col" style={{ gap: 12, minWidth: 0 }}>
          {kind === 'download' && (
            <>
              <p>One file with all {agents.length} agents, plus the wiring between them.</p>
              <ul className="mono ag-files">
                {agents.map((a) => (
                  <li key={a.id}>{fw.file.replace('{slug}', slug(a.name))}</li>
                ))}
                <li>architect.json</li>
              </ul>
              <div>
                <button className="btn btn-primary" onClick={download}>
                  <Icon name="download" size={14} /> Download code
                </button>
              </div>
            </>
          )}
          {kind === 'github' && (
            <>
              <label className="field">
                <span>Repository</span>
                <input className="input mono" value={repo} onChange={(e) => setRepo(e.target.value)} />
              </label>
              <p className="muted" style={{ fontSize: 13 }}>
                Branch <span className="mono">agents/{framework}</span>. You review it like any other PR.
              </p>
              <div>
                <button
                  className="btn btn-primary"
                  disabled={busy || !repo.includes('/')}
                  onClick={() => {
                    setBusy(true)
                    setTimeout(() => {
                      setBusy(false)
                      toast(`Pull request #14 opened on ${repo}.`)
                    }, 1400)
                  }}
                >
                  {busy ? <span className="spinner" /> : <Icon name="pr" size={14} />}
                  {busy ? 'Pushing…' : 'Open pull request'}
                </button>
              </div>
            </>
          )}
          {kind === 'api' && (
            <>
              <div className="field">
                <span>Endpoint for {agent.name}</span>
                <div className="row">
                  <code className="ag-url grow">{url}</code>
                  <button className="btn btn-line btn-icon btn-sm" onClick={() => copy(url)} aria-label="Copy endpoint">
                    <Icon name="copy" size={13} />
                  </button>
                </div>
              </div>
              <div className="row wrap mono" style={{ gap: 6, fontSize: 11.5 }}>
                <span className="badge">POST /invoke</span>
                <span className="badge">POST /stream</span>
                <span className="badge">GET /health</span>
              </div>
              <div className="ag-code-wrap">
                <button className="btn btn-ghost btn-icon btn-sm ag-copy" onClick={() => copy(curl)} aria-label="Copy curl example">
                  <Icon name="copy" size={13} />
                </button>
                <pre className="ag-code">{curl}</pre>
              </div>
              <div className="row wrap" style={{ gap: 10 }}>
                <button
                  className="btn btn-primary"
                  disabled={busy || deployed}
                  onClick={() => {
                    setBusy(true)
                    setTimeout(() => {
                      setBusy(false)
                      setDeployed(true)
                      toast('Endpoint is live. Keys stay in the vault.')
                    }, 1600)
                  }}
                >
                  {busy ? <span className="spinner" /> : <Icon name="rocket" size={14} />}
                  {deployed ? 'Deployed' : busy ? 'Deploying…' : 'Deploy endpoint'}
                </button>
                {deployed && <span className="badge badge-green"><span className="dot" /> Live · ap-south-1</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
