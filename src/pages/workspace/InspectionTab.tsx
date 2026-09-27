import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { FINDINGS, type Finding } from '../../data/demo'
import { useStore, type Project } from '../../lib/store'
import { revLetter, useFixes } from '../launch/useFixes'
import '../launch/inspect.css'

type Group = { level: Finding['level']; title: string; sub: string; cls: string }

const GROUPS: Group[] = [
  { level: 'must', title: 'Must fix before launch', sub: 'A stranger could hurt your customers or your wallet.', cls: 'in-must' },
  { level: 'should', title: 'Should fix', sub: 'Won’t break on day one. Will bite you by week three.', cls: 'in-should' },
  { level: 'placeholder', title: 'Placeholders', sub: 'Pretend parts. Fine for a demo, wrong for customers.', cls: 'in-ph' },
]

function loadMuted(id: string): string[] {
  try {
    return JSON.parse(localStorage.getItem('a2:muted:' + id) || '[]') as string[]
  } catch {
    return []
  }
}

export default function InspectionTab({ project }: { project: Project }) {
  const { mode, toast } = useStore()
  const { fix, busy, isFixed, openMust } = useFixes(project)
  const [muted, setMutedState] = useState<string[]>(() => loadMuted(project.id))
  const [techOpen, setTechOpen] = useState<string[]>([])
  const [checking, setChecking] = useState(false)
  const [checkedAt, setCheckedAt] = useState('after your last build')
  const [bulk, setBulk] = useState(false)

  const setMuted = (next: string[]) => {
    setMutedState(next)
    try {
      localStorage.setItem('a2:muted:' + project.id, JSON.stringify(next))
    } catch {
      /* fine: mute lasts for this visit */
    }
  }

  const rev = revLetter(project)
  const open = (f: Finding) => f.level !== 'ok' && !isFixed(f)
  const active = FINDINGS.filter((f) => open(f) && !muted.includes(f.id))
  const count = (lvl: Finding['level']) => active.filter((f) => f.level === lvl).length
  const passed = FINDINGS.filter((f) => f.level === 'ok' || isFixed(f))
  const mutedList = FINDINGS.filter((f) => open(f) && muted.includes(f.id))
  const safe = active.filter((f) => f.fix && !busy.includes(f.id))

  const reinspect = () => {
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      setCheckedAt('just now')
      toast(active.length ? `Re-inspected. ${active.length} left, nothing new.` : 'Re-inspected. All clear.')
    }, 1200)
  }

  const fixAll = async () => {
    setBulk(true)
    const list = [...safe]
    for (const f of list) await fix(f.id, '', 900)
    setBulk(false)
    toast(`Fixed ${list.length} ${list.length === 1 ? 'thing' : 'things'}. Saved as new revisions.`)
  }

  const card = (f: Finding) => {
    const tech = mode === 'dev' || techOpen.includes(f.id)
    const working = busy.includes(f.id)
    return (
      <article key={f.id} className={'in-card ' + GROUPS.find((g) => g.level === f.level)!.cls}>
        <div className="row between wrap" style={{ gap: 8 }}>
          <span className="label">{f.area}</span>
          {mode === 'dev' && <span className="mono muted" style={{ fontSize: 11 }}>{f.id}</span>}
        </div>
        <h4 className="in-title">{f.title}</h4>
        <p className="in-text">{mode === 'dev' ? f.dev : f.plain}</p>
        {mode === 'simple' && (
          <>
            {tech && <p className="in-dev mono">{f.dev}</p>}
            <button
              className="in-link"
              aria-expanded={tech}
              onClick={() => setTechOpen((t) => (t.includes(f.id) ? t.filter((x) => x !== f.id) : [...t, f.id]))}
            >
              {tech ? 'Hide the technical version' : 'Show me the technical version'}
            </button>
          </>
        )}
        {mode === 'dev' && <p className="muted" style={{ fontSize: 12.5 }}>{f.plain}</p>}
        {f.fix && (
          <p className="in-fix">
            <Icon name="wand" size={13} /> <span><b>My fix:</b> {f.fix}.</span>
          </p>
        )}
        {f.needsYou && (
          <p className="in-fix">
            <Icon name="user" size={13} /> <span><b>Needs you:</b> only you can log in to your store.</span>
          </p>
        )}
        <div className="row wrap" style={{ gap: 8, marginTop: 4 }}>
          {f.fix && (
            <button className="btn btn-line btn-sm in-fixbtn" disabled={working || bulk} onClick={() => fix(f.id)}>
              {working ? <span className="spinner" /> : <Icon name="wand" size={13} />}
              {working ? 'Fixing…' : 'Fix it for me'}
            </button>
          )}
          {f.needsYou && (
            <button
              className="btn btn-line btn-sm"
              disabled={working}
              onClick={() => fix(f.id, 'Shopify connected. Real orders from now on.', 1600)}
            >
              {working ? <span className="spinner" /> : <Icon name="link" size={13} />}
              {working ? 'Waiting for Shopify…' : 'Connect Shopify'}
            </button>
          )}
          {f.level === 'must' ? (
            <span className="muted" style={{ fontSize: 12 }}>Can’t skip this one. It blocks launch.</span>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              disabled={working}
              onClick={() => {
                setMuted([...muted, f.id])
                toast('Muted. It’ll wait under “Not now”.')
              }}
            >
              Not now
            </button>
          )}
          {f.fix && !working && <span className="label" style={{ marginLeft: 'auto' }}>Free</span>}
        </div>
      </article>
    )
  }

  return (
    <div className="in-root">
      <div className="in-wrap">
        <header className="col" style={{ gap: 16 }}>
          <div className="titleblock in-tb" style={{ ['--cols' as string]: 4 }}>
            <div>
              <span className="label">Sheet</span>
              <b>Inspection · Rev {rev}</b>
            </div>
            <div>
              <span className="label">Project</span>
              <span>{project.name}</span>
            </div>
            <div>
              <span className="label">Inspector</span>
              <span>Architect</span>
            </div>
            <div>
              <span className="label">Checked</span>
              <span>{checking ? 'checking…' : checkedAt}</span>
            </div>
          </div>

          <div className="row between wrap" style={{ gap: 16, alignItems: 'flex-end' }}>
            <div className="col" style={{ gap: 8, maxWidth: 560 }}>
              <h1 style={{ fontSize: 30 }}>Inspection report</h1>
              <p style={{ fontSize: 15 }}>
                Things a developer would check before letting strangers use this. You don’t need to know them. I do.
              </p>
            </div>
            <div className="row wrap" style={{ gap: 8 }}>
              <button className="btn btn-line" onClick={reinspect} disabled={checking}>
                {checking ? <span className="spinner" /> : <Icon name="refresh" size={14} />}
                {checking ? 'Inspecting…' : 'Re-inspect'}
              </button>
              {safe.length > 0 && (
                <button className="btn btn-primary" onClick={fixAll} disabled={bulk || checking}>
                  {bulk ? <span className="spinner" /> : <Icon name="wand" size={14} />}
                  {bulk ? 'Fixing…' : `Fix everything that’s safe (${safe.length})`}
                </button>
              )}
            </div>
          </div>

          <dl className="in-counts" aria-label="Summary">
            <div className="in-c-must">
              <dt className="label">Must fix</dt>
              <dd className="mono">{count('must')}</dd>
            </div>
            <div className="in-c-should">
              <dt className="label">Should fix</dt>
              <dd className="mono">{count('should')}</dd>
            </div>
            <div className="in-c-ph">
              <dt className="label">Placeholder</dt>
              <dd className="mono">{count('placeholder')}</dd>
            </div>
            <div className="in-c-ok">
              <dt className="label">Passed</dt>
              <dd className="mono">{passed.length}</dd>
            </div>
          </dl>
          {safe.length > 0 && (
            <p className="muted" style={{ fontSize: 12.5 }}>
              “Safe” means I can fix it without asking you anything. Fixes for gaps I left are free.
            </p>
          )}
        </header>

        {checking ? (
          <div className="card row" style={{ gap: 10, marginTop: 24 }}>
            <span className="spinner" />
            <span>Checking who can see what, where keys live, and what a stranger could break…</span>
          </div>
        ) : (
          <>
            {GROUPS.map((g) => {
              const items = active.filter((f) => f.level === g.level)
              return (
                <section key={g.level} className="in-group">
                  <div className="in-ghead">
                    <h2>{g.title}</h2>
                    <span className="mono muted">{items.length}</span>
                  </div>
                  <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>{g.sub}</p>
                  {items.length === 0 ? (
                    <p className="in-none">
                      <Icon name="check" size={13} /> Nothing left here.
                    </p>
                  ) : (
                    <div className="col" style={{ gap: 10 }}>{items.map(card)}</div>
                  )}
                </section>
              )
            })}

            {mutedList.length > 0 && (
              <details className="in-group in-details">
                <summary>
                  <h2>Not now</h2>
                  <span className="mono muted">{mutedList.length}</span>
                </summary>
                <div className="col" style={{ gap: 6, marginTop: 10 }}>
                  {mutedList.map((f) => (
                    <div key={f.id} className="row between in-row">
                      <span>{f.title}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => setMuted(muted.filter((x) => x !== f.id))}>
                        Bring back
                      </button>
                    </div>
                  ))}
                </div>
              </details>
            )}

            <details className="in-group in-details">
              <summary>
                <h2>Passed</h2>
                <span className="mono muted">{passed.length}</span>
              </summary>
              <div className="col" style={{ gap: 6, marginTop: 10 }}>
                {passed.map((f) => (
                  <div key={f.id} className="in-pass">
                    <Icon name="shieldCheck" size={16} />
                    <div className="col grow" style={{ gap: 2 }}>
                      {f.level === 'ok' ? (
                        <>
                          <b>{f.title}</b>
                          <span className="muted" style={{ fontSize: 12.5 }}>{mode === 'dev' ? f.dev : f.plain}</span>
                        </>
                      ) : (
                        <>
                          <s className="muted">{f.title}</s>
                          <b>{f.fix || (f.needsYou ? 'Shopify connected. Real orders now.' : 'Fixed')}</b>
                        </>
                      )}
                    </div>
                    {f.level !== 'ok' && <span className="badge badge-green">Fixed</span>}
                  </div>
                ))}
              </div>
            </details>
          </>
        )}

        <footer className={'in-foot ' + (openMust.length ? 'redline' : 'sheet-ink')}>
          <div className="col" style={{ gap: 4 }}>
            <b>
              {openMust.length
                ? 'Launch is blocked until must-fix items are done.'
                : 'Nothing blocks launch.'}
            </b>
            <span className="muted" style={{ fontSize: 13 }}>
              {openMust.length
                ? `${openMust.length} left. ${openMust.length === 1 ? 'It’s' : 'Each is'} one click.`
                : active.length
                  ? 'What’s left can wait. I’ll remind you after launch.'
                  : 'Every finding is dealt with.'}
            </span>
          </div>
          <Link
            to={`/p/${project.id}/launch`}
            className={'btn ' + (openMust.length || safe.length ? 'btn-line' : 'btn-primary')}
          >
            <Icon name="rocket" size={14} /> {openMust.length ? 'See the launch checklist' : 'Go to launch'}
          </Link>
        </footer>
      </div>
    </div>
  )
}
