import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStore, uid, type Project } from '../../lib/store'
import { AgentCanvas, type NodeId } from '../agents/Canvas'
import { DEFAULT_AGENTS, EVAL_FIXES, FRAMEWORKS, SLOTS, codeFor, slug, type AgentDef, type FrameworkId } from '../agents/data'
import { EvalsPanel, GuardrailsPanel, NodeInfo, SetupPanel, TestPanel, type ChatMsg } from '../agents/Inspector'
import { AddAgentModal, ExportModal } from '../agents/Modals'
import { useFixes } from '../launch/useFixes'
import '../agents/agents.css'

type Saved = { agents: AgentDef[]; limit: number; framework: FrameworkId; evalFixed: string[] }
type Sub = 'setup' | 'guard' | 'test' | 'evals'

function loadSaved(id: string): Saved {
  const fallback: Saved = { agents: DEFAULT_AGENTS, limit: 1500, framework: 'lyzr', evalFixed: [] }
  try {
    const raw = localStorage.getItem('a2:agents:' + id)
    return raw ? { ...fallback, ...(JSON.parse(raw) as Saved) } : fallback
  } catch {
    return fallback
  }
}

export default function AgentsTab({ project }: { project: Project }) {
  const { mode, toast } = useStore()
  const { fix, busy, isFixed } = useFixes(project)
  const [saved, setSaved] = useState<Saved>(() => loadSaved(project.id))
  const [selected, setSelected] = useState<NodeId>('refunds')
  const [sub, setSub] = useState<Sub>('setup')
  const [adding, setAdding] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [logs, setLogs] = useState<Record<string, ChatMsg[]>>({})

  useEffect(() => {
    try {
      localStorage.setItem('a2:agents:' + project.id, JSON.stringify(saved))
    } catch {
      /* private mode: edits last until reload */
    }
  }, [saved, project.id])

  const { agents, framework } = saved
  const agent = agents.find((a) => a.id === selected)
  const limitInCode = isFixed('f2')
  const shopifyConnected = isFixed('f5')
  const fw = FRAMEWORKS.find((f) => f.id === framework)!

  const patchAgent = (id: string, patch: Partial<AgentDef>) =>
    setSaved((s) => ({ ...s, agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))

  const setFramework = (id: FrameworkId) => {
    setSaved((s) => ({ ...s, framework: id }))
    if (mode === 'simple') toast(`Now written in ${FRAMEWORKS.find((f) => f.id === id)!.name}. Same agent.`)
  }

  const addAgent = (a: { name: string; role: string; instructions: string; tools: string[]; from: string; edge: string }) => {
    const n = agents.filter((x) => x.custom).length
    const extra = n - SLOTS.length
    const slot = SLOTS[n] || { x: 130 + (extra % 3) * 250, y: 680 + Math.floor(extra / 3) * 110 }
    const id = 'a' + uid()
    const next: AgentDef = {
      id,
      name: a.name,
      role: a.role,
      instructions: a.instructions,
      model: 'auto',
      tools: a.tools,
      knowledge: [],
      memory: false,
      confidence: 0.7,
      pii: true,
      topics: ['Orders', 'Products'],
      x: slot.x,
      y: slot.y,
      from: a.from,
      edge: a.edge,
      custom: true,
    }
    setSaved((s) => ({ ...s, agents: [...s.agents, next] }))
    setSelected(id)
    setSub('setup')
    setAdding(false)
    toast('Agent added. Test it before you trust it.')
  }

  const removeAgent = (id: string) => {
    setSaved((s) => ({ ...s, agents: s.agents.filter((a) => a.id !== id && a.from !== id) }))
    setSelected('desk')
    toast('Agent removed.')
  }

  const teach = async () => {
    await new Promise((r) => setTimeout(r, 1800))
    setSaved((s) => ({
      ...s,
      evalFixed: Array.from(new Set([...s.evalFixed, ...Object.keys(EVAL_FIXES)])),
      agents: s.agents.map((a) => {
        const lines = Object.values(EVAL_FIXES).filter((f) => f.agent === a.id && !a.instructions.includes(f.line))
        return lines.length ? { ...a, instructions: a.instructions + '\n' + lines.map((l) => l.line).join('\n') } : a
      }),
    }))
    toast('20 of 20 passing. Saved as a new revision.')
  }

  const code = agent ? codeFor(framework, agent, agents, limitInCode) : ''
  const copyCode = () => {
    try {
      navigator.clipboard.writeText(code)
      toast('Code copied.')
    } catch {
      toast('Couldn’t copy. Select it by hand.')
    }
  }

  const subs: { id: Sub; label: string }[] = [
    { id: 'setup', label: 'Setup' },
    { id: 'guard', label: 'Guardrails' },
    { id: 'test', label: 'Test' },
    { id: 'evals', label: 'Evals' },
  ]

  return (
    <div className="ag-root">
      <header className="ag-top">
        <div className="col" style={{ gap: 6, minWidth: 0 }}>
          <div className="row wrap" style={{ gap: 10 }}>
            <span className="label">Framework</span>
            <div className="seg ag-fw" role="radiogroup" aria-label="Agent framework">
              {FRAMEWORKS.map((f) => (
                <button
                  key={f.id}
                  role="radio"
                  aria-checked={framework === f.id}
                  className={framework === f.id ? 'is-on' : ''}
                  onClick={() => setFramework(f.id)}
                >
                  {f.name}
                  {f.id === 'lyzr' && <span className="ag-default">default</span>}
                </button>
              ))}
            </div>
          </div>
          <p className="muted" style={{ fontSize: 12.5 }}>
            {mode === 'dev' ? (
              <>
                Every framework runs behind one contract: <span className="mono">POST /invoke · POST /stream · GET /health</span>. The
                app never knows which one is inside.
              </>
            ) : (
              'Same agent, written the way your developers already work. Switch any time.'
            )}
          </p>
        </div>
        {mode === 'dev' && (
          <button className="btn btn-line btn-sm" onClick={() => setExporting(true)} disabled={!agent} title={agent ? '' : 'Select an agent first'}>
            <Icon name="upload" size={13} /> Export
          </button>
        )}
      </header>

      <section className="ag-left">
        <div className="row between wrap" style={{ gap: 10 }}>
          <div className="col" style={{ gap: 2 }}>
            <h2 style={{ fontSize: 20 }}>Your agents</h2>
            <p className="muted" style={{ fontSize: 13 }}>
              {agents.length} agents, 3 tools, 1 human. Click anything to change it.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Icon name="plus" size={13} /> Add agent
          </button>
        </div>

        <div className="ag-canvas grid-bg">
          <AgentCanvas
            agents={agents}
            selected={selected}
            onSelect={setSelected}
            shopifyConnected={shopifyConnected}
            limit={saved.limit}
          />
        </div>
        <div className="row wrap ag-legend">
          <span className="row"><i className="ag-lg-solid" /> hands work to</span>
          <span className="row"><i className="ag-lg-dash" /> uses a tool</span>
          <span className="row"><i className="ag-lg-red" /> waits for you</span>
        </div>

        {mode === 'dev' && agent && (
          <div className="ag-codecard sheet">
            <div className="row between ag-codehead">
              <span className="mono" style={{ fontSize: 12 }}>
                {fw.file.replace('{slug}', slug(agent.name))} <span className="muted">· {fw.name}</span>
              </span>
              <button className="btn btn-ghost btn-sm" onClick={copyCode}>
                <Icon name="copy" size={13} /> Copy
              </button>
            </div>
            <pre className="ag-code" aria-label={`${agent.name} in ${fw.name}`}>{code}</pre>
          </div>
        )}
        {mode === 'dev' && !agent && (
          <p className="muted" style={{ fontSize: 13 }}>Select an agent to see its code in {fw.name}.</p>
        )}
      </section>

      <aside className="ag-right" aria-label="Inspector">
        {agent ? (
          <>
            <div className="ag-inspect-head">
              <span className="label">{agent.custom ? 'New agent' : 'Agent'}</span>
              <h3 style={{ fontSize: 20 }}>{agent.name || 'Untitled agent'}</h3>
              <p className="muted" style={{ fontSize: 13 }}>{agent.role || 'No job yet. Give it one in Setup.'}</p>
            </div>
            <div className="tabs ag-subtabs" role="tablist">
              {subs.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={sub === s.id}
                  className={sub === s.id ? 'is-on' : ''}
                  onClick={() => setSub(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {sub === 'setup' && (
              <SetupPanel
                agent={agent}
                onChange={(p) => patchAgent(agent.id, p)}
                onRemove={agent.custom ? () => removeAgent(agent.id) : undefined}
              />
            )}
            {sub === 'guard' && (
              <GuardrailsPanel
                agent={agent}
                onChange={(p) => patchAgent(agent.id, p)}
                limit={saved.limit}
                setLimit={(n) => setSaved((s) => ({ ...s, limit: n }))}
                limitInCode={limitInCode}
                moving={busy.includes('f2')}
                onMoveToCode={() => fix('f2', 'Limit moved into code. Saved as a new revision.')}
              />
            )}
            {sub === 'test' && (
              <TestPanel
                key={agent.id}
                agent={agent}
                log={logs[agent.id] || []}
                setLog={(fn) => setLogs((l) => ({ ...l, [agent.id]: fn(l[agent.id] || []) }))}
                limitInCode={limitInCode}
              />
            )}
            {sub === 'evals' && <EvalsPanel fixedEvals={saved.evalFixed} onTeach={teach} />}
          </>
        ) : (
          <NodeInfo
            id={selected}
            agents={agents}
            shopifyConnected={shopifyConnected}
            connecting={busy.includes('f5')}
            onConnectShopify={() => fix('f5', 'Shopify connected. Real orders from now on.', 1600)}
          />
        )}
      </aside>

      {adding && <AddAgentModal agents={agents} onClose={() => setAdding(false)} onAdd={addAgent} />}
      {exporting && agent && (
        <ExportModal
          project={project}
          agent={agent}
          agents={agents}
          framework={framework}
          limitInCode={limitInCode}
          onClose={() => setExporting(false)}
        />
      )}
    </div>
  )
}
