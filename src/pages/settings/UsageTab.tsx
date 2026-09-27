import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/ui'
import { useStore } from '../../lib/store'

const DEMO_FREE_FIXES = 23

// Scripted history for the demo: what I estimated before each build, and what it cost.
const BUILDS = [
  { name: 'First build: chat, orders, inbox', est: [140, 190] as const, used: 164 },
  { name: 'Hindi replies', est: [10, 20] as const, used: 14 },
  { name: 'Refund limit moved into code', est: [4, 8] as const, used: 6 },
  { name: 'Inbox filters and search', est: [30, 45] as const, used: 52, note: 'Went over. I asked before going past 45.' },
]

const PLANS = [
  { id: 'free', name: 'Free', price: '₹0', credits: '500 credits a month', note: 'Enough for one small app' },
  { id: 'starter', name: 'Starter', price: '₹1,599', credits: '2,500 credits a month', note: 'A few apps, live on your domain' },
  { id: 'pro', name: 'Pro', price: '₹4,999', credits: '10,000 credits a month', note: 'Teams, private models, priority builds' },
]

const PACKS = [
  { n: 250, price: '₹199' },
  { n: 1000, price: '₹699' },
  { n: 5000, price: '₹2,999' },
]

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export function UsageTab() {
  const { credits, projects, toast } = useStore()
  const [plan, setPlan] = useState('free')
  const [topUp, setTopUp] = useState(false)
  const [pack, setPack] = useState(1000)
  const [paying, setPaying] = useState(false)
  const freeFixes = credits.freeFixes + DEMO_FREE_FIXES

  const perProject = (projects.length ? projects : [{ id: 'demo', name: 'Glow & Co. support desk (sample)' }]).map((p) => ({
    id: p.id,
    name: p.name,
    used: p.id === 'demo' ? 236 : 40 + (hash(p.id) % 180),
  }))
  const maxUsed = Math.max(...perProject.map((p) => p.used), 1)
  const maxBuild = Math.max(...BUILDS.map((b) => Math.max(b.est[1], b.used)))

  return (
    <>
      <header className="st-h">
        <span className="label">Usage & credits</span>
        <h1>What you’ve spent, and what I owe you.</h1>
        <p>If I break it, fixing it is free. If you change your mind, that’s a new build.</p>
      </header>

      <div className="st-stats">
        <div className="sheet st-stat">
          <span className="label">Balance</span>
          <b className="mono">{credits.balance}</b>
          <span className="muted" style={{ fontSize: 12.5 }}>credits left this month</span>
        </div>
        <div className="sheet st-stat">
          <span className="label">Spent</span>
          <b className="mono">{credits.spent}</b>
          <span className="muted" style={{ fontSize: 12.5 }}>credits this month</span>
        </div>
        <div className="sheet-ink st-stat" style={{ borderColor: 'var(--green)', background: 'var(--green-wash)' }}>
          <span className="label" style={{ color: 'var(--green)' }}>Free fixes</span>
          <b className="mono" style={{ color: 'var(--green)' }}>{freeFixes}</b>
          <span style={{ fontSize: 13 }}>
            <strong>{freeFixes} credits you didn’t pay for.</strong> My mistakes, fixed on me.
          </span>
        </div>
      </div>

      <section className="st-sec">
        <h2>Estimate vs actual, per build</h2>
        <p className="st-sub">The light bar is what I told you before. The dark line is what it cost.</p>
        <div className="sheet" style={{ padding: '6px 16px' }}>
          {BUILDS.map((b) => {
            const over = b.used > b.est[1]
            return (
              <div key={b.name} style={{ padding: '12px 0', borderBottom: '1px solid var(--rule)' }} className="col">
                <div className="row between wrap" style={{ gap: 6 }}>
                  <strong style={{ fontSize: 13.5 }}>{b.name}</strong>
                  <span className="mono" style={{ fontSize: 12 }}>
                    est {b.est[0]}–{b.est[1]} · used <strong style={{ color: over ? 'var(--red-text)' : undefined }}>{b.used}</strong>
                  </span>
                </div>
                <svg width="100%" height="18" viewBox="0 0 100 18" preserveAspectRatio="none" role="img" aria-label={`Estimated ${b.est[0]} to ${b.est[1]}, used ${b.used}`}>
                  <rect x="0" y="6" width="100" height="6" fill="var(--paper-2)" />
                  <rect
                    x={(b.est[0] / maxBuild) * 100}
                    y="3"
                    width={((b.est[1] - b.est[0]) / maxBuild) * 100}
                    height="12"
                    fill="var(--blue-wash)"
                    stroke="var(--blue)"
                    strokeWidth="0.4"
                    vectorEffect="non-scaling-stroke"
                  />
                  <rect x="0" y="7.5" width={(b.used / maxBuild) * 100} height="3" fill={over ? 'var(--red)' : 'var(--ink)'} />
                  <rect x={(b.used / maxBuild) * 100 - 0.4} y="1" width="0.8" height="16" fill={over ? 'var(--red)' : 'var(--ink)'} />
                </svg>
                {b.note && <span style={{ color: 'var(--red-text)', fontSize: 12.5 }}>{b.note}</span>}
              </div>
            )
          })}
          <div className="row wrap" style={{ gap: 16, padding: '10px 0', fontSize: 12 }}>
            <span className="row" style={{ gap: 6 }}><i style={{ width: 14, height: 8, background: 'var(--blue-wash)', border: '1px solid var(--blue)' }} /> Estimate</span>
            <span className="row" style={{ gap: 6 }}><i style={{ width: 14, height: 3, background: 'var(--ink)' }} /> Used</span>
            <span className="row" style={{ gap: 6 }}><i style={{ width: 14, height: 3, background: 'var(--red)' }} /> Over estimate</span>
          </div>
        </div>
      </section>

      <section className="st-sec">
        <h2>By project</h2>
        <div className="sheet" style={{ padding: '6px 16px' }}>
          {perProject.map((p) => (
            <div key={p.id} className="row" style={{ gap: 12, padding: '10px 0', borderBottom: '1px solid var(--rule)' }}>
              <span className="grow" style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <svg width="120" height="8" viewBox="0 0 120 8" aria-hidden="true" style={{ flex: 'none' }}>
                <rect width="120" height="8" fill="var(--paper-2)" />
                <rect width={(p.used / maxUsed) * 120} height="8" fill="var(--ink)" />
              </svg>
              <span className="mono" style={{ fontSize: 12, width: 40, textAlign: 'right' }}>{p.used}</span>
            </div>
          ))}
          {!projects.length && (
            <p className="muted" style={{ fontSize: 12.5, padding: '10px 0' }}>
              Sample numbers. <Link to="/home">Start a project</Link> to see your own.
            </p>
          )}
        </div>
      </section>

      <section className="st-sec">
        <div className="row between wrap">
          <h2>Plan</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setTopUp(true)}>
            <Icon name="plus" size={13} /> Top up
          </button>
        </div>
        <div className="st-plans">
          {PLANS.map((p) => (
            <div key={p.id} className={p.id === plan ? 'sheet-ink' : 'sheet'} style={{ padding: 16, display: 'grid', gap: 6, alignContent: 'start' }}>
              <div className="row between">
                <strong style={{ fontSize: 15 }}>{p.name}</strong>
                {p.id === plan && <span className="badge badge-ink">Current</span>}
              </div>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{p.price}<span className="muted" style={{ fontSize: 12 }}> /mo</span></span>
              <span style={{ fontSize: 13 }}>{p.credits}</span>
              <span className="muted" style={{ fontSize: 12.5 }}>{p.note}</span>
              {p.id !== plan && (
                <button
                  className="btn btn-sm btn-line"
                  style={{ marginTop: 6, justifySelf: 'start' }}
                  onClick={() => {
                    setPlan(p.id)
                    toast(`Switched to ${p.name}. Demo, so no card charged.`)
                  }}
                >
                  Switch to {p.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {topUp && (
        <Modal
          title="Top up credits"
          sub="Credits never expire. Unused ones roll over."
          onClose={() => setTopUp(false)}
          foot={
            <>
              <button className="btn btn-ghost" onClick={() => setTopUp(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={paying}
                onClick={() => {
                  setPaying(true)
                  setTimeout(() => {
                    setPaying(false)
                    setTopUp(false)
                    toast(`Demo: ${pack} credits would be added. No card charged.`)
                  }, 1100)
                }}
              >
                {paying && <span className="spinner" />}
                Pay {PACKS.find((x) => x.n === pack)?.price}
              </button>
            </>
          }
        >
          <div className="col" style={{ gap: 8 }}>
            {PACKS.map((x) => (
              <label key={x.n} className={x.n === pack ? 'sheet-ink row' : 'sheet row'} style={{ padding: 14, gap: 12, cursor: 'pointer' }}>
                <input type="radio" name="pack" checked={x.n === pack} onChange={() => setPack(x.n)} style={{ accentColor: 'var(--red)' }} />
                <span className="grow mono" style={{ fontWeight: 700 }}>{x.n.toLocaleString('en-IN')} credits</span>
                <span className="mono">{x.price}</span>
              </label>
            ))}
            <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>
              A first build like the support desk costs 140–190. A small change costs 5–20.
            </p>
          </div>
        </Modal>
      )}
    </>
  )
}
