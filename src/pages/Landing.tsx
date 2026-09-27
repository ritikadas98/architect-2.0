import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo, ThemeToggle } from '../components/ui'
import { Icon } from '../components/Icon'
import { useStore } from '../lib/store'
import { SAMPLE_PROMPTS, GENERIC_TELLS } from '../data/demo'
import './landing.css'

export function stashPrompt(prompt: string) {
  try {
    sessionStorage.setItem('a2:pending-prompt', prompt)
  } catch {
    /* fine: user retypes */
  }
}

export default function Landing() {
  const { user } = useStore()
  const nav = useNavigate()
  const [prompt, setPrompt] = useState('')

  const start = (p = prompt) => {
    if (p.trim()) stashPrompt(p.trim())
    nav(user ? '/home' : '/login?next=/home')
  }

  return (
    <div className="grid-bg ln">
      <header className="ln-top">
        <Link to="/" aria-label="Architect home" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
        <nav className="ln-links">
          <a href="#how">How it works</a>
          <a href="#dev">For developers</a>
          <Link to="/architecture">Architecture</Link>
        </nav>
        <div className="row" style={{ gap: 6 }}>
          <ThemeToggle />
          {user ? (
            <Link to="/home" className="btn btn-primary btn-sm">
              Your projects <Icon name="arrow" size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link to="/login?next=/home" className="btn btn-primary btn-sm ln-hide-sm">
                Start building
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="ln-hero">
        <span className="label">Sheet 01 · Architect 2.0</span>
        <h1>
          Build the thing <br />
          <span className="ln-mark">you meant.</span>
        </h1>
        <p className="ln-sub">
          Most AI builders guess what you want. Architect asks first. Then it shows you what's missing, before a stranger
          finds it.
        </p>

        <form
          className="ln-prompt sheet-ink"
          onSubmit={(e) => {
            e.preventDefault()
            start()
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your app. Drop screenshots of things you like. Rough is fine."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) start()
            }}
            aria-label="Describe your app"
          />
          <div className="row between wrap" style={{ gap: 10 }}>
            <div className="row wrap" style={{ gap: 6 }}>
              <button type="button" className="btn btn-line btn-sm" onClick={() => start()}>
                <Icon name="image" size={14} /> Add screenshots
              </button>
              <button type="button" className="btn btn-line btn-sm" onClick={() => nav(user ? '/import' : '/login?next=/import')}>
                <Icon name="github" size={14} /> Import a repo
              </button>
            </div>
            <button className="btn btn-primary" type="submit">
              Start with a brief <Icon name="arrow" size={14} />
            </button>
          </div>
        </form>
        <div className="row wrap ln-samples">
          <span className="muted" style={{ fontSize: 12.5 }}>Or try:</span>
          {SAMPLE_PROMPTS.map((s) => (
            <button key={s.label} className="chip" onClick={() => setPrompt(s.prompt)}>
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* ---------------- The four habits ---------------- */}
      <section className="ln-section" id="how">
        <div className="ln-sec-head">
          <span className="label">How it works</span>
          <h2>Four habits the others skip.</h2>
        </div>

        <Habit
          n="01"
          title="It asks before it assumes."
          body="You drop a screenshot. It tells you what it saw and checks. Then five quick questions, each with “you decide”. No 40-screen build on a wrong guess."
          art={<ReadsArt />}
        />
        <Habit
          n="02"
          title="It won't look like every AI app."
          body="Three directions built from your references. The default AI look is on the page too, crossed out. Your taste gets saved as rules the build has to follow."
          art={<TasteArt />}
          flip
        />
        <Habit
          n="03"
          title="It tells you what you're missing."
          body="Before launch, it inspects your app the way a senior developer would. Who can see what. Where your keys live. What a bot could run up. In plain words, with a fix button."
          art={<InspectArt />}
        />
        <Habit
          n="04"
          title="It brings the right skills to you."
          body="You shouldn't need an Instagram reel to learn a skill exists. It suggests the add-ons your build needs, says why in one line, and installs them."
          art={<SkillsArt />}
          flip
        />
      </section>

      {/* ---------------- Money ---------------- */}
      <section className="ln-section ln-money">
        <div className="ln-receipt sheet-ink">
          <div className="row between">
            <span className="label">Build estimate</span>
            <span className="badge badge-ink">Before you start</span>
          </div>
          <div className="ln-receipt-big mono">
            140–190 <small>credits</small>
          </div>
          <div className="muted mono" style={{ fontSize: 12 }}>
            About 12–18 minutes
          </div>
          <hr className="divider" style={{ margin: '14px 0' }} />
          <Line k="Building your app" v="161" />
          <Line k="Chat didn't scroll. My bug." v="0" was="6" red />
          <Line k="Test run found a typo. My bug." v="0" was="3" red />
          <Line k="You asked for Hindi replies" v="14" />
          <hr className="divider" style={{ margin: '10px 0' }} />
          <Line k="You paid" v="175" bold />
        </div>
        <div className="col" style={{ gap: 14, maxWidth: 440 }}>
          <span className="label">The money rule</span>
          <h2>If I break it, fixing it is on me.</h2>
          <p className="ln-p">
            You see the cost before anything starts. When the AI makes a mistake and fixes it, you don't pay for either.
            Change your mind? That's a new build, and you'll see that estimate too.
          </p>
        </div>
      </section>

      {/* ---------------- Developers ---------------- */}
      <section className="ln-section" id="dev">
        <div className="ln-sec-head">
          <span className="label">One project, two views</span>
          <h2>The founder and the developer, on the same app.</h2>
          <p className="ln-p" style={{ maxWidth: 560 }}>
            Flip the switch and the same build shows code, diffs, a terminal and every agent's reasoning. Nobody starts
            again when a developer joins.
          </p>
        </div>
        <div className="ln-views">
          <div className="sheet ln-view">
            <div className="row between">
              <span className="badge">
                <Icon name="eye" size={11} /> Simple
              </span>
              <span className="label">Same step</span>
            </div>
            <p className="ln-view-line">Caught my own mistake: the chat didn't scroll to new messages. Fixed it.</p>
            <span className="badge badge-red">Free · 0 credits</span>
          </div>
          <div className="sheet ln-view ln-view-dev">
            <div className="row between">
              <span className="badge badge-ink">
                <Icon name="code" size={11} /> Developer
              </span>
              <span className="label">Same step</span>
            </div>
            <pre className="mono">{`console  TypeError: scrollIntoView of null
patch    components/ChatWindow.tsx:41
- ref.current.scrollIntoView()
+ ref.current?.scrollIntoView({ block: 'end' })
cost     0 credits (agent-caused)`}</pre>
          </div>
        </div>
        <div className="ln-devlist">
          {(
            [
              ['github', 'GitHub, both ways', 'Push from Cursor, it shows up here. Turn on PR mode for main.'],
              ['terminal', 'Your tools, not ours', 'npx architect link. Claude Code and Cursor talk to it over MCP.'],
              ['agent', 'Agents in any framework', 'Lyzr ADK, LangGraph, CrewAI, OpenAI Agents SDK. One contract.'],
              ['cpu', 'Any model, per task', 'Opus to plan, Haiku for one-liners, your own key if you want.'],
            ] as const
          ).map(([icon, t, d]) => (
            <div key={t} className="ln-dev">
              <Icon name={icon} size={18} />
              <div>
                <div style={{ fontWeight: 700 }}>{t}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Close ---------------- */}
      <section className="ln-section ln-close">
        <h2>Got a screenshot and a vague idea?</h2>
        <p className="ln-p">That's enough to start. It'll ask about the rest.</p>
        <button className="btn btn-primary btn-lg" onClick={() => start()}>
          Start with a brief <Icon name="arrow" size={16} />
        </button>
      </section>

      <footer className="ln-foot">
        <Logo size={18} />
        <span className="muted">
          A prototype by Ritika Das for Lyzr. Flows are scripted on one sample project.{' '}
          <Link to="/architecture">How it would really be built →</Link>
        </span>
      </footer>
    </div>
  )
}

function Line({ k, v, was, red, bold }: { k: string; v: string; was?: string; red?: boolean; bold?: boolean }) {
  return (
    <div className="row between" style={{ fontSize: 13, padding: '3px 0', fontWeight: bold ? 700 : 400, gap: 12 }}>
      <span style={{ color: red ? 'var(--red-text)' : undefined }}>{k}</span>
      <span className="mono" style={{ color: red ? 'var(--red-text)' : undefined, whiteSpace: 'nowrap' }}>
        {was && <s style={{ opacity: 0.55, marginRight: 6 }}>{was}</s>}
        {v}
      </span>
    </div>
  )
}

function Habit({ n, title, body, art, flip }: { n: string; title: string; body: string; art: React.ReactNode; flip?: boolean }) {
  return (
    <div className={'ln-habit' + (flip ? ' is-flip' : '')}>
      <div className="col" style={{ gap: 10 }}>
        <span className="ln-num mono">{n}</span>
        <h3>{title}</h3>
        <p className="ln-p">{body}</p>
      </div>
      <div className="ln-art">{art}</div>
    </div>
  )
}

/* ---------- Small illustrative mocks, drawn with the real UI pieces ---------- */

function ReadsArt() {
  const reads = [
    { t: 'Warm cream background', s: '#F4EDE2' },
    { t: 'Sage green buttons', s: '#7C8B6F' },
    { t: 'Serif headings', s: '' },
    { t: 'Dark, moody photos', s: '#2B2B2B', wrong: true },
    { t: 'Pill-shaped buttons', s: '' },
  ]
  return (
    <div className="sheet ln-mock">
      <div className="label" style={{ marginBottom: 10 }}>
        What I picked up from your screenshot
      </div>
      <div className="row wrap" style={{ gap: 6 }}>
        {reads.map((r) => (
          <span key={r.t} className="chip" style={r.wrong ? { borderColor: 'var(--red)', color: 'var(--red-text)' } : undefined}>
            {r.s && <span style={{ width: 10, height: 10, borderRadius: 2, background: r.s, border: '1px solid var(--rule)' }} />}
            {r.wrong ? <s>{r.t}</s> : r.t}
            <Icon name={r.wrong ? 'x' : 'check'} size={12} />
          </span>
        ))}
      </div>
      <p className="redline-note" style={{ marginTop: 14 }}>
        “Dark photos? No. Daylight, no people.” Got it. Fixed before building.
      </p>
    </div>
  )
}

function TasteArt() {
  return (
    <div className="ln-taste">
      <div className="ln-t" style={{ background: '#F4EDE2', color: '#2E2A24' }}>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 500 }}>Glow & Co.</div>
        <div style={{ fontSize: 10, opacity: 0.7 }}>Skin, slowly.</div>
        <span className="ln-t-btn" style={{ background: '#7C8B6F', borderRadius: 99 }}>
          Ask us anything
        </span>
      </div>
      <div className="ln-t" style={{ background: '#EFE6D6', color: '#3B2F22', border: '1px solid #3B2F22' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 19, fontWeight: 700, borderBottom: '1px solid', paddingBottom: 4 }}>
          GLOW & CO.
        </div>
        <div style={{ fontSize: 9, letterSpacing: '.12em' }}>No. 04 · APOTHECARY</div>
        <span className="ln-t-btn" style={{ background: '#A4553A' }}>
          ASK US
        </span>
      </div>
      <div className="ln-t ln-t-generic">
        <div style={{ fontSize: 15, fontWeight: 800 }}>✨ Revolutionize your skin</div>
        <div className="row" style={{ gap: 4 }}>
          {['🚀', '💡', '🔒'].map((e) => (
            <span key={e} style={{ background: 'rgba(255,255,255,.2)', borderRadius: 6, padding: '6px 8px', fontSize: 12 }}>
              {e}
            </span>
          ))}
        </div>
        <div className="ln-strike" />
        <span className="ln-t-note hand">won't do this unless you ask</span>
      </div>
      <div className="ln-t-caption">
        {GENERIC_TELLS.slice(0, 3).map((g) => (
          <s key={g}>{g}</s>
        ))}
      </div>
    </div>
  )
}

function InspectArt() {
  return (
    <div className="sheet ln-mock">
      <div className="row between" style={{ marginBottom: 12 }}>
        <span className="label">Inspection · Rev F</span>
        <span className="badge badge-red">2 must-fix</span>
      </div>
      <div className="ln-finding">
        <span className="badge badge-red">Customer data</span>
        <div style={{ fontWeight: 700, marginTop: 6 }}>Anyone with an order number could see that order.</div>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          Order numbers go up one at a time. A stranger could type 1041, 1042, 1043.
        </p>
        <div className="row wrap" style={{ marginTop: 10 }}>
          <span className="btn btn-sm btn-red">
            <Icon name="wand" size={13} /> Fix it for me
          </span>
          <span className="muted" style={{ fontSize: 12 }}>
            Free · adds an email check
          </span>
        </div>
      </div>
      <div className="ln-finding is-ok">
        <Icon name="shieldCheck" size={15} style={{ color: 'var(--green)' }} />
        <span>Your Shopify key never touches the app.</span>
      </div>
    </div>
  )
}

function SkillsArt() {
  const s = [
    ['Security review', 'Your app handles customer emails.'],
    ['Shopify orders', 'You said your orders live in Shopify.'],
    ['Hindi + Hinglish replies', 'You picked English + Hindi.'],
  ]
  return (
    <div className="sheet ln-mock">
      <div className="label" style={{ marginBottom: 10 }}>
        Skills I'll bring to this build
      </div>
      <div className="col" style={{ gap: 8 }}>
        {s.map(([n, w], i) => (
          <div key={n} className="row between ln-skill">
            <div className="col" style={{ gap: 2 }}>
              <span style={{ fontWeight: 700 }}>{n}</span>
              <span className="redline-note" style={{ fontSize: 13.5 }}>
                {w}
              </span>
            </div>
            <span className={'chip' + (i < 2 ? ' is-on' : '')}>
              <Icon name={i < 2 ? 'check' : 'plus'} size={12} />
              {i < 2 ? 'Added' : 'Add'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
