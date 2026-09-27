import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Icon, type IconName } from '../components/Icon'
import { Empty, Modal, Redline } from '../components/ui'
import { SKILLS, SUGGESTED_SKILL_IDS, type Skill } from '../data/demo'
import { useStore } from '../lib/store'
import { CATS, WHAT_CHANGES, skillMd } from './skills/skillCopy'
import { BringYourOwn } from './skills/BringYourOwn'

const CAT_ICON: Record<Skill['cat'], IconName> = {
  Design: 'palette',
  Planning: 'pencil',
  Security: 'shield',
  Data: 'database',
  Agents: 'agent',
  Language: 'chat',
  Launch: 'rocket',
}

export default function Skills() {
  const { projects, mode, toast } = useStore()
  const latest = projects[0]
  const [added, setAdded] = useState<Set<string>>(() => new Set(['interview', ...projects.flatMap((p) => p.skills)]))
  const [cat, setCat] = useState<Skill['cat'] | 'All'>('All')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Skill | null>(null)
  const [own, setOwn] = useState<{ name: string; kind: 'skill' | 'mcp' }[]>([])

  const toggle = (s: Skill) => {
    if (s.id === 'interview' && added.has(s.id)) {
      toast('This one stays on. It’s how I avoid guessing.')
      return
    }
    const next = new Set(added)
    if (next.has(s.id)) {
      next.delete(s.id)
      toast(`Removed ${s.name}.`)
    } else {
      next.add(s.id)
      toast('Added. I’ll use it on the next build.')
    }
    setAdded(next)
  }

  const suggested = SKILLS.filter((s) => SUGGESTED_SKILL_IDS.includes(s.id))
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return SKILLS.filter((s) => cat === 'All' || s.cat === cat).filter(
      (s) => !needle || (s.name + ' ' + s.what + ' ' + s.by + ' ' + s.cat).toLowerCase().includes(needle),
    )
  }, [q, cat])

  const usedIn = (s: Skill) => projects.filter((p) => s.id === 'interview' || p.skills.includes(s.id))

  return (
    <AppShell>
      <style>{css}</style>
      <div className="page col" style={{ gap: 36 }}>
        <header className="sk-head">
          <div className="col" style={{ gap: 8 }}>
            <span className="label">Library · {SKILLS.length} skills</span>
            <h1 style={{ fontSize: 40 }}>Skills</h1>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', maxWidth: 520 }}>
              Add-ons that teach Architect how to do one thing well. I suggest them while you build. You can also browse.
            </p>
          </div>
          <label className="sk-search">
            <Icon name="search" size={15} />
            <span className="sr-only">Search skills</span>
            <input className="input" placeholder="Search: Shopify, Hindi, privacy…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </header>

        {/* Suggested: bigger cards, each with the reason in the margin */}
        <section className="col" style={{ gap: 14 }}>
          <div className="row between wrap">
            <h2 style={{ fontSize: 20 }}>Suggested for your projects</h2>
            {latest && <span className="label">Based on {latest.name}</span>}
          </div>
          {latest ? (
            <div className="sk-sugg">
              {suggested.map((s) => (
                <article key={s.id} className="card sk-sugg-card">
                  <div className="row between" style={{ alignItems: 'flex-start' }}>
                    <span className="sk-ico">
                      <Icon name={CAT_ICON[s.cat]} size={18} />
                    </span>
                    <span className="badge">{s.cat}</span>
                  </div>
                  <button className="sk-name" onClick={() => setOpen(s)}>
                    <h3 style={{ fontSize: 18 }}>{s.name}</h3>
                  </button>
                  <p style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{s.what}</p>
                  {s.why && (
                    <div className="sk-why">
                      <Redline>{s.why}</Redline>
                      <span className="label" style={{ fontSize: 9.5 }}>for {latest.name}</span>
                    </div>
                  )}
                  <div className="row between" style={{ marginTop: 'auto', gap: 8 }}>
                    <span className="mono muted" style={{ fontSize: 11.5 }}>
                      {s.by} · {s.installs} · ★ {s.stars}
                    </span>
                    <AddBtn on={added.has(s.id)} onClick={() => toggle(s)} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty
              icon="skill"
              title="Nothing to suggest yet"
              sub="Start a project and I’ll suggest skills for it, with a reason for each. Until then, browse below."
              action={
                <Link to="/home" className="btn btn-sm">
                  Start a project <Icon name="arrow" size={13} />
                </Link>
              }
            />
          )}
        </section>

        {/* Browse: a dense index, not a wall of cards */}
        <section className="col" style={{ gap: 14 }}>
          <div className="row between wrap" style={{ gap: 12 }}>
            <h2 style={{ fontSize: 20 }}>Browse</h2>
            <div className="row wrap" style={{ gap: 6 }} role="group" aria-label="Filter by category">
              {(['All', ...CATS] as const).map((c) => (
                <button key={c} className={'chip' + (cat === c ? ' is-on' : '')} onClick={() => setCat(c)} aria-pressed={cat === c}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          {list.length === 0 ? (
            <Empty
              icon="search"
              title="No skill matches that"
              sub="Try another word. Or paste a GitHub link below and bring your own."
              action={
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setQ('')
                    setCat('All')
                  }}
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="sheet sk-list">
              {list.map((s) => (
                <div key={s.id} className="sk-row" onClick={() => setOpen(s)}>
                  <span className="sk-ico sk-ico-sm">
                    <Icon name={CAT_ICON[s.cat]} size={15} />
                  </span>
                  <div className="col grow" style={{ gap: 2 }}>
                    <div className="row wrap" style={{ gap: 8 }}>
                      <button
                        className="sk-name"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpen(s)
                        }}
                      >
                        <strong>{s.name}</strong>
                      </button>
                      <span className="badge">{s.cat}</span>
                    </div>
                    <p className="muted" style={{ fontSize: 13 }}>{s.what}</p>
                    <span className="mono muted" style={{ fontSize: 11 }}>
                      by {s.by} · {s.installs} installs · ★ {s.stars}
                    </span>
                  </div>
                  <AddBtn on={added.has(s.id)} onClick={() => toggle(s)} />
                </div>
              ))}
            </div>
          )}
        </section>

        {own.length > 0 && (
          <section className="col" style={{ gap: 10 }}>
            <h2 style={{ fontSize: 20 }}>Yours</h2>
            <div className="sheet sk-list">
              {own.map((o) => (
                <div key={o.name} className="sk-row" style={{ cursor: 'default' }}>
                  <span className="sk-ico sk-ico-sm">
                    <Icon name={o.kind === 'mcp' ? 'puzzle' : 'github'} size={15} />
                  </span>
                  <div className="col grow" style={{ gap: 2 }}>
                    <strong className="mono" style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{o.name}</strong>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      {o.kind === 'mcp' ? 'MCP server' : 'Skill'} · checked, no network access
                    </span>
                  </div>
                  <span className="badge badge-green">Added</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <BringYourOwn onAdd={(name, kind) => setOwn((o) => (o.some((x) => x.name === name) ? o : [...o, { name, kind }]))} />
      </div>

      {open && (
        <Modal
          title={open.name}
          sub={`by ${open.by} · ${open.cat}`}
          onClose={() => setOpen(null)}
          foot={
            <>
              <button className="btn btn-ghost" onClick={() => setOpen(null)}>
                Close
              </button>
              <button className={added.has(open.id) ? 'btn sk-added' : 'btn btn-primary'} onClick={() => toggle(open)}>
                <Icon name={added.has(open.id) ? 'check' : 'plus'} size={14} />
                {added.has(open.id) ? 'Added' : 'Add skill'}
              </button>
            </>
          }
        >
          <div className="col" style={{ gap: 18 }}>
            <div className="col" style={{ gap: 6 }}>
              <span className="label">What it does</span>
              <p style={{ fontSize: 14.5 }}>{open.what}</p>
              <span className="mono muted" style={{ fontSize: 11.5 }}>
                {open.installs} installs · ★ {open.stars}
              </span>
            </div>
            <div className="col" style={{ gap: 6 }}>
              <span className="label">What changes when it’s on</span>
              <ul className="sk-bullets">
                {WHAT_CHANGES[open.cat].map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div className="col" style={{ gap: 6 }}>
              <span className="label">Used in</span>
              {usedIn(open).length ? (
                <div className="row wrap">
                  {usedIn(open).map((p) => (
                    <Link key={p.id} to={`/p/${p.id}`} className="chip" style={{ textDecoration: 'none' }}>
                      <Icon name="folder" size={12} /> {p.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 13 }}>Not in any project yet. Add it and I’ll use it on your next build.</p>
              )}
            </div>
            {mode === 'dev' && (
              <div className="col" style={{ gap: 6 }}>
                <span className="label">Where it lives</span>
                <code style={{ fontSize: 12.5, overflowWrap: 'anywhere' }}>.architect/skills/{open.id}/SKILL.md</code>
                <pre className="sk-pre">{skillMd(open)}</pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AppShell>
  )
}

function AddBtn({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      className={'btn btn-sm ' + (on ? 'sk-added' : 'btn-line')}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-pressed={on}
    >
      <Icon name={on ? 'check' : 'plus'} size={13} />
      {on ? 'Added' : 'Add'}
    </button>
  )
}

const css = `
.sk-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
.sk-search { position: relative; width: min(340px, 100%); display: block; }
.sk-search > svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--ink-3); }
.sk-search .input { padding-left: 34px; }
.sk-sugg { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
.sk-sugg-card { display: flex; flex-direction: column; gap: 10px; grid-column: span 3; padding: 16px; }
.sk-sugg-card:nth-child(-n+2) { grid-column: span 6; padding: 22px; border: 1.5px solid var(--ink); }
.sk-sugg-card:nth-child(-n+2) h3 { font-size: 22px !important; }
.sk-ico { width: 34px; height: 34px; border: 1.5px solid var(--ink); border-radius: var(--r-sm); display: inline-grid; place-items: center; background: var(--sheet-2); flex: none; }
.sk-ico-sm { width: 30px; height: 30px; border-width: 1px; border-color: var(--rule-strong); }
.sk-name { border: 0; background: none; padding: 0; text-align: left; cursor: pointer; }
.sk-name:hover { text-decoration: underline; text-underline-offset: 3px; }
.sk-why { border-top: 1px dashed var(--red); padding-top: 8px; display: grid; gap: 2px; }
.sk-list { display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
.sk-row { display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-bottom: 1px solid var(--rule); cursor: pointer; min-width: 0; }
.sk-row:hover { background: var(--sheet-2); }
.sk-list .sk-row:nth-child(odd) { border-right: 1px solid var(--rule); }
.sk-added { background: var(--green-wash); border-color: var(--green); color: var(--green); }
.sk-added:hover { background: var(--green-wash); }
.sk-bullets { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.sk-bullets li { padding-left: 18px; position: relative; font-size: 13.5px; }
.sk-bullets li::before { content: ''; position: absolute; left: 2px; top: 9px; width: 8px; height: 1.5px; background: var(--red); }
.sk-pre { margin: 0; padding: 12px; background: var(--paper-2); border: 1px solid var(--rule); border-radius: var(--r-sm); font-family: var(--font-mono); font-size: 11.5px; line-height: 1.55; white-space: pre-wrap; overflow-x: auto; }
.sk-byo { padding: 20px; display: grid; gap: 12px; max-width: 720px; }
.sk-byo-form { gap: 8px; }
@media (max-width: 900px) {
  .sk-sugg-card, .sk-sugg-card:nth-child(-n+2) { grid-column: span 6; }
  .sk-list { grid-template-columns: 1fr; }
  .sk-list .sk-row:nth-child(odd) { border-right: 0; }
}
@media (max-width: 560px) {
  .sk-sugg-card, .sk-sugg-card:nth-child(-n+2) { grid-column: span 12; padding: 16px; }
  .sk-byo { padding: 16px; }
  .sk-byo-form { flex-wrap: wrap; }
  .sk-byo-form .btn { width: 100%; }
  .sk-head h1 { font-size: 32px !important; }
}
`
