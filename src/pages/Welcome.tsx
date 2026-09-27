import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Logo } from '../components/ui'
import { Icon, type IconName } from '../components/Icon'
import { useStore, type Mode } from '../lib/store'

const WAYS: { id: string; mode: Mode; icon: IconName; title: string; body: string; shows: string }[] = [
  {
    id: 'describe',
    mode: 'simple',
    icon: 'chat',
    title: 'I describe what I want',
    body: 'No code on screen. Plain words, a live preview, and a heads-up when something needs you.',
    shows: 'Preview · plain-language progress · inspection',
  },
  {
    id: 'code',
    mode: 'dev',
    icon: 'code',
    title: 'I write code too',
    body: 'Everything in Simple, plus files, diffs, a terminal, agent traces and a CLI for your own editor.',
    shows: 'Code · terminal · traces · GitHub PRs · MCP',
  },
  {
    id: 'both',
    mode: 'simple',
    icon: 'layers',
    title: 'Depends on the day',
    body: 'Start simple. The switch sits in the top bar of every project.',
    shows: 'Simple now, one click to Developer',
  },
]

const FOR = ['My own business', 'A client', 'My team, internally', 'A side project', 'Just looking around']

export default function Welcome() {
  const { user, setMode } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [way, setWay] = useState('describe')
  const [forWhat, setFor] = useState<string | null>(null)
  const first = (user?.name || 'there').split(' ')[0]

  const go = () => {
    setMode(WAYS.find((w) => w.id === way)!.mode)
    nav(params.get('next') || '/home', { replace: true })
  }

  return (
    <div className="grid-bg" style={{ minHeight: '100%' }}>
      <style>{css}</style>
      <header style={{ padding: '14px 16px', maxWidth: 880, margin: '0 auto' }}>
        <Logo />
      </header>
      <main className="wc">
        <span className="label">One question, then you're in</span>
        <h1>Hi {first}. How do you like to work?</h1>
        <p className="muted" style={{ fontSize: 15 }}>
          This only sets where you start. Every project has a Simple / Developer switch.
        </p>

        <div className="wc-ways" role="radiogroup">
          {WAYS.map((w, i) => (
            <button
              key={w.id}
              role="radio"
              aria-checked={way === w.id}
              className={'wc-way' + (way === w.id ? ' is-on' : '')}
              onClick={() => setWay(w.id)}
            >
              <div className="row between">
                <span className="wc-ico">
                  <Icon name={w.icon} size={18} />
                </span>
                <span className="mono muted" style={{ fontSize: 11 }}>
                  {i + 1}
                </span>
              </div>
              <div style={{ fontWeight: 750, fontSize: 16, fontStretch: '110%' }}>{w.title}</div>
              <div className="muted" style={{ fontSize: 13.5 }}>
                {w.body}
              </div>
              <div className="label" style={{ marginTop: 'auto', paddingTop: 8 }}>
                {w.shows}
              </div>
            </button>
          ))}
        </div>

        <div className="col" style={{ gap: 10, marginTop: 8 }}>
          <span style={{ fontWeight: 650 }}>
            Who's it for? <span className="muted" style={{ fontWeight: 400 }}>Optional. Helps me suggest skills.</span>
          </span>
          <div className="row wrap" style={{ gap: 6 }}>
            {FOR.map((f) => (
              <button key={f} className={'chip' + (forWhat === f ? ' is-on' : '')} onClick={() => setFor(forWhat === f ? null : f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn btn-primary btn-lg" onClick={go}>
            Take me in <Icon name="arrow" size={15} />
          </button>
        </div>
      </main>
    </div>
  )
}

const css = `
.wc { max-width: 880px; margin: 0 auto; padding: 32px 16px 72px; display: grid; gap: 14px; }
.wc h1 { font-size: clamp(28px, 5vw, 42px); font-stretch: 120%; }
.wc-ways { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
.wc-way { text-align: left; display: flex; flex-direction: column; gap: 8px; padding: 16px; min-height: 220px; background: var(--sheet); border: 1.5px solid var(--rule); border-radius: var(--r-md); transition: border-color .15s, box-shadow .15s, transform .1s; }
.wc-way:hover { border-color: var(--ink-3); }
.wc-way.is-on { border-color: var(--ink); box-shadow: 3px 3px 0 var(--red); transform: translate(-1px, -1px); }
.wc-ico { width: 36px; height: 36px; display: grid; place-items: center; border: 1.5px solid var(--ink); border-radius: 4px; }
.wc-way.is-on .wc-ico { background: var(--ink); color: var(--on-ink); }
@media (max-width: 720px) { .wc-ways { grid-template-columns: 1fr; } .wc-way { min-height: 0; } }
`
