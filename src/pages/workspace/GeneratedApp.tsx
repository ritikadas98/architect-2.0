// The app Architect built: "Glow & Co." in the Quiet spa direction.
// It has its own look (cream, ink, sage, Cormorant), so raw hex is allowed here only.

import { useEffect, useRef, useState } from 'react'
import { Redline } from '../../components/ui'
import { useStore } from '../../lib/store'
import { useWS } from './wsState'
import { short } from './wsData'

const C = { bg: '#F4EDE2', bg2: '#EBE2D3', ink: '#2E2A24', ink2: '#6B6358', rule: '#D9CEBB', sage: '#7C8B6F' }

type Ctl = { guesses: boolean; editing: boolean }

/* ---------- Guess: a dashed redline around something the AI assumed ---------- */
function Guess({ on, note, children, block, place = 'below' }: { on: boolean; note: string; children: React.ReactNode; block?: boolean; place?: 'below' | 'above' | 'left' }) {
  const Tag = block ? 'div' : 'span'
  return (
    <Tag className={'ga-guess' + (on ? ' redline is-on' : '')} style={{ display: block ? 'block' : 'inline-block' }}>
      {children}
      {on && (
        <span className={'ga-guess-note ga-note-' + place}>
          <Redline>{note}</Redline>
        </span>
      )}
    </Tag>
  )
}

/* ---------- Editable text ---------- */
function T({ id, def, ctl, as = 'span', style, className }: { id: string; def: string; ctl: Ctl; as?: 'span' | 'h1' | 'h2' | 'p' | 'div'; style?: React.CSSProperties; className?: string }) {
  const { edits, setEdits, addRev } = useWS()
  const { toast } = useStore()
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  const value = edits.text[id] ?? def
  const Tag = as as 'span'

  useEffect(() => {
    if (active && ref.current) {
      ref.current.focus()
      const r = document.createRange()
      r.selectNodeContents(ref.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(r)
    }
  }, [active])

  const commit = () => {
    const el = ref.current
    setActive(false)
    if (!el) return
    const next = el.innerText.trim()
    if (!next || next === value) {
      el.innerText = value
      return
    }
    setEdits((e) => ({ ...e, text: { ...e.text, [id]: next } }))
    addRev({ title: `You changed “${short(value, 26)}” to “${short(next, 26)}”`, by: 'You (click-edit)', credits: 0, plain: [`Text changed to “${next}”`], dev: [`- ${value}`, `+ ${next}`] })
    toast('Changed. 0 credits. That one’s on the house.')
  }

  if (!ctl.editing) return <Tag className={className} style={style}>{value}</Tag>
  return (
    <Tag
      ref={ref as React.Ref<HTMLSpanElement>}
      className={(className || '') + ' ga-editable' + (active ? ' is-active' : '')}
      style={style}
      contentEditable={active}
      suppressContentEditableWarning
      tabIndex={0}
      role="textbox"
      aria-label={`Edit text: ${value}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setActive(true)
      }}
      onKeyDown={(e) => {
        if (!active && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          setActive(true)
        } else if (active && e.key === 'Enter') {
          e.preventDefault()
          ref.current?.blur()
        } else if (active && e.key === 'Escape') {
          if (ref.current) ref.current.innerText = value
          ref.current?.blur()
        }
      }}
      onBlur={() => active && commit()}
    >
      {value}
    </Tag>
  )
}

/* ---------- Pill button with click-to-style popover ---------- */
const SWATCHES = [
  { name: 'sage', hex: '#7C8B6F' },
  { name: 'ink', hex: '#2E2A24' },
  { name: 'terracotta', hex: '#B4654A' },
  { name: 'rose', hex: '#C9A19A' },
  { name: 'slate', hex: '#6F8BA0' },
]

function Pill({ label, ctl, onClick, filled = true, id, small }: { label: string; ctl: Ctl; onClick?: () => void; filled?: boolean; id: string; small?: boolean }) {
  const { edits, setEdits, addRev } = useWS()
  const { toast } = useStore()
  const [open, setOpen] = useState(false)
  const start = useRef(edits)
  const style: React.CSSProperties = {
    background: filled ? 'var(--ga-btn)' : 'transparent',
    color: filled ? '#FBF8F2' : C.ink,
    border: `1px solid ${filled ? 'var(--ga-btn)' : C.ink}`,
    borderRadius: edits.btnRadius,
    padding: small ? '7px 14px' : '10px 20px',
    fontSize: small ? 12.5 : 13.5,
  }
  const close = () => {
    setOpen(false)
    const s = start.current
    if (s.btnColor === edits.btnColor && s.btnRadius === edits.btnRadius) return
    const colour = SWATCHES.find((w) => w.hex === edits.btnColor)?.name || edits.btnColor
    const parts = []
    if (s.btnColor !== edits.btnColor) parts.push(`buttons to ${colour}`)
    if (s.btnRadius !== edits.btnRadius) parts.push(edits.btnRadius >= 28 ? 'corners to round' : `corners to ${edits.btnRadius}px`)
    addRev({ title: `You changed the ${parts.join(' and ')}`, by: 'You (click-edit)', credits: 0, plain: [`You changed the ${parts.join(' and ')}`], dev: [`- --btn-bg: ${s.btnColor}; --btn-r: ${s.btnRadius}px`, `+ --btn-bg: ${edits.btnColor}; --btn-r: ${edits.btnRadius}px`] })
    toast('Changed. 0 credits. That one’s on the house.')
  }
  const r = Math.min(edits.btnRadius, 28)
  return (
    <span className="ga-pill-wrap">
      <button
        type="button"
        className={'ga-pill' + (ctl.editing ? ' ga-editable' : '')}
        style={style}
        onClick={(e) => {
          if (ctl.editing) {
            e.stopPropagation()
            if (open) close()
            else {
              start.current = edits
              setOpen(true)
            }
          } else onClick?.()
        }}
        aria-haspopup={ctl.editing ? 'dialog' : undefined}
        data-id={id}
      >
        {label}
      </button>
      {open && ctl.editing && (
        <span className="ga-pop" role="dialog" aria-label="Button style" onClick={(e) => e.stopPropagation()}>
          <span className="label">Colour · all buttons</span>
          <span className="row" style={{ gap: 6 }}>
            {SWATCHES.map((w) => (
              <button
                key={w.hex}
                type="button"
                className={'ga-swatch' + (edits.btnColor === w.hex ? ' is-on' : '')}
                style={{ background: w.hex }}
                aria-label={w.name}
                title={w.name}
                onClick={() => setEdits((e) => ({ ...e, btnColor: w.hex }))}
              />
            ))}
          </span>
          <span className="label" style={{ marginTop: 6 }}>Corners · {r >= 28 ? 'round' : r + 'px'}</span>
          <input
            type="range"
            min={0}
            max={28}
            value={r}
            aria-label="Corner radius"
            onChange={(e) => {
              const v = Number(e.target.value)
              setEdits((x) => ({ ...x, btnRadius: v >= 28 ? 999 : v }))
            }}
          />
          <span className="row between" style={{ marginTop: 4 }}>
            <span className="muted" style={{ fontSize: 11 }}>0 credits</span>
            <button type="button" className="btn btn-sm" onClick={close}>Done</button>
          </span>
        </span>
      )}
    </span>
  )
}

/* ---------- Customer chat script ---------- */
type CMsg = { from: 'bot' | 'me'; text: string }
type Awaiting = null | 'order' | 'email' | 'refund'
export type Escalation = { id: string; name: string; order: string; amount: number; reason: string; status: 'pending' | 'approved' | 'rejected' }

function isHinglish(t: string) {
  return /\b(kab|mera|meri|kya|hai|kaha|aayega|paisa|wapas)\b/.test(t)
}

function reply(text: string, awaiting: Awaiting, ctx: { order?: string; hi?: boolean }): { out: string; next: Awaiting; order?: string; hi: boolean; escalate?: { amount: number; order: string } } {
  const t = text.toLowerCase()
  const hi = isHinglish(t) || !!ctx.hi
  const r = reply2(t, hi, awaiting, ctx)
  return { ...r, hi }
}

function reply2(t: string, hi: boolean, awaiting: Awaiting, ctx: { order?: string }): { out: string; next: Awaiting; order?: string; escalate?: { amount: number; order: string } } {
  const orderNo = (t.match(/#?\b(1\d{3})\b/) || [])[1]
  const hasEmail = /\S+@\S+\.\S+/.test(t)
  const num = (s: string) => Number(s.replace(/,/g, ''))
  const rupee = t.replace(/\S+@\S+/g, '').match(/(?:₹|rs\.?|inr)\s*(\d[\d,]*)/)
  let amount = rupee ? num(rupee[1]) : NaN
  if (isNaN(amount)) {
    const nums = (t.replace(/\S+@\S+/g, '').match(/\d[\d,]*/g) || []).filter((n) => n.replace(/,/g, '') !== orderNo).map(num).filter((n) => n >= 50)
    amount = nums.length ? nums[nums.length - 1] : NaN
  }

  if (awaiting === 'refund' || (/refund|return|money back|paisa|wapas/.test(t) && !isNaN(amount))) {
    if (isNaN(amount)) return { out: 'How much should the refund be? A rough number is fine.', next: 'refund' }
    const order = orderNo || ctx.order || '1043'
    if (amount > 1500) return { out: 'I’ve sent this to the team. You’ll hear back within a day.', next: null, escalate: { amount, order } }
    return { out: `Done. ₹${amount.toLocaleString('en-IN')} is on its way back to your card. Allow 5–7 days.`, next: null }
  }
  if (/refund|return|money back|paisa|wapas|broken|leak/.test(t)) {
    return { out: hi ? 'Sorry about that. Kaunsa order, aur kitna refund chahiye?' : 'Sorry about that. Which order is it, and how much should the refund be?', next: 'refund', order: orderNo }
  }
  if (awaiting === 'order' || awaiting === 'email' || /order|where|track|kab|aayega|deliver|ship/.test(t)) {
    const order = orderNo || ctx.order
    if (order && hasEmail) {
      return {
        out: hi ? `Mil gaya. #${order} Delhivery se ship ho gaya hai, Thursday tak pahunch jayega.` : `Found it. #${order} shipped with Delhivery, arriving Thursday.`,
        next: null,
        order,
      }
    }
    if (order) return { out: 'Thanks. And the email you used for it? It keeps your order private.', next: 'email', order }
    return { out: hi ? 'Zaroor. Order number aur jo email use kiya tha, bata dijiye.' : 'Happy to check. What’s your order number, and the email you used?', next: 'order' }
  }
  if (/hi|hello|hey|namaste/.test(t)) return { out: 'Hello. I can find an order or start a refund.', next: awaiting }
  return { out: 'I can help with orders and refunds. For anything else, I’ll pass you to the team.', next: awaiting }
}

function CustomerChat({ ctl, onClose, onEscalate }: { ctl: Ctl; onClose: () => void; onEscalate: (e: Escalation) => void }) {
  const [msgs, setMsgs] = useState<CMsg[]>([{ from: 'bot', text: 'Hi, I’m the Glow & Co. desk. Ask about an order or a refund.' }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [awaiting, setAwaiting] = useState<Awaiting>(null)
  const [order, setOrder] = useState<string | undefined>()
  const [hi, setHi] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const p = end.current?.parentElement
    if (p) p.scrollTop = p.scrollHeight
  }, [msgs, typing])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const send = (text: string) => {
    const t = text.trim()
    if (!t || typing) return
    setMsgs((m) => [...m, { from: 'me', text: t }])
    setInput('')
    setTyping(true)
    const r = reply(t, awaiting, { order, hi })
    timer.current = window.setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { from: 'bot', text: r.out }])
      setAwaiting(r.next)
      if (r.order) setOrder(r.order)
      setHi(r.hi)
      if (r.escalate) onEscalate({ id: String(Date.now()), name: 'You (testing)', order: r.escalate.order, amount: r.escalate.amount, reason: t, status: 'pending' })
    }, 750)
  }

  return (
    <div className="ga-chat" role="dialog" aria-label="Customer chat">
      <div className="ga-chat-head">
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 19, fontWeight: 600 }}>Glow & Co. desk</div>
          <Guess on={ctl.guesses} note="Guessed: 2 min. I haven’t measured it yet.">
            <span style={{ fontSize: 11.5, color: C.ink2 }}>Usually replies in 2 min</span>
          </Guess>
        </div>
        <button type="button" className="ga-x" onClick={onClose} aria-label="Close chat">×</button>
      </div>
      <div className="ga-chat-body">
        {msgs.map((m, i) => (
          <div key={i} className={'ga-bub ' + (m.from === 'me' ? 'is-me' : '')}>{m.text}</div>
        ))}
        {typing && (
          <div className="ga-bub ga-typing" aria-label="Typing">
            <i />
            <i />
            <i />
          </div>
        )}
        {msgs.length === 1 && !typing && (
          <div className="row wrap" style={{ gap: 6, marginTop: 4 }}>
            {['Where’s my order?', 'I want a refund', 'mera order kab aayega?'].map((s) => (
              <button key={s} type="button" className="ga-quick" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        <div ref={end} />
      </div>
      <form
        className="ga-chat-input"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={awaiting === 'order' ? 'e.g. 1043, priya@gmail.com' : awaiting === 'refund' ? 'e.g. ₹2,400, it arrived leaking' : 'Type a message'}
          aria-label="Message"
        />
        <button type="submit" style={{ background: C.ink }} aria-label="Send">→</button>
      </form>
    </div>
  )
}

/* ---------- Owner inbox ---------- */
const SEED_CONVOS = [
  { id: 'c1', name: 'Priya S.', last: 'Where is #1043?', who: 'Order tracker', state: 'Resolved', lang: 'EN' },
  { id: 'c2', name: 'Ananya K.', last: 'kya COD available hai?', who: 'Front desk', state: 'Resolved', lang: 'HI' },
  { id: 'c4', name: 'Meera J.', last: '₹640 refund for a wrong shade', who: 'Refund helper', state: 'Auto-refunded', lang: 'EN' },
]

function Inbox({ ctl, escalations, setEscalations }: { ctl: Ctl; escalations: Escalation[]; setEscalations: (fn: (e: Escalation[]) => Escalation[]) => void }) {
  const { toast } = useStore()
  const convos = [
    ...escalations.map((e) => ({ id: e.id, name: e.name, last: short(e.reason, 30), who: 'Refund helper', state: e.status === 'pending' ? 'Needs you' : e.status === 'approved' ? 'Approved' : 'Rejected', lang: 'EN' })),
    ...SEED_CONVOS,
  ]
  const pending = escalations.filter((e) => e.status === 'pending')
  const decide = (id: string, status: 'approved' | 'rejected') => {
    setEscalations((es) => es.map((e) => (e.id === id ? { ...e, status } : e)))
    toast(status === 'approved' ? 'Refund approved. The customer gets an email.' : 'Rejected. I’ll draft a kind reply for you to check.')
  }
  return (
    <div className="ga-inbox">
      <div className="ga-inbox-list">
        <div className="ga-inbox-h">
          <T id="inbox.title" def="Inbox" ctl={ctl} as="h2" className="ga-h2" />
          <span style={{ fontSize: 12, color: C.ink2 }}>{pending.length} waiting on you</span>
        </div>
        {convos.map((c) => (
          <div key={c.id} className="ga-convo">
            <div className="row between" style={{ gap: 8 }}>
              <strong style={{ fontSize: 13.5 }}>{c.name}</strong>
              <span className={'ga-tag' + (c.state === 'Needs you' ? ' is-hot' : '')}>{c.state}</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.ink2 }}>{c.last}</div>
            <div style={{ fontSize: 11, color: C.ink2, opacity: 0.8 }}>{c.who} · {c.lang}</div>
          </div>
        ))}
      </div>
      <div className="ga-inbox-main">
        <T id="inbox.refunds" def="Refunds waiting for you" ctl={ctl} as="h2" className="ga-h2" />
        <Guess on={ctl.guesses} note="Guessed: 24h reply promise. Change it in Settings." block>
          <p style={{ fontSize: 12.5, color: C.ink2, margin: '2px 0 12px' }}>Over your ₹1,500 limit. Customers were told you’ll reply within a day.</p>
        </Guess>
        {pending.length === 0 && <div className="ga-empty">Nothing waiting. Ask for a refund over ₹1,500 in the store chat to see one land here.</div>}
        {escalations.map((e) => (
          <div key={e.id} className="ga-refund">
            <div className="row between wrap" style={{ gap: 8 }}>
              <strong>{e.name} · #{e.order}</strong>
              <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 24, fontWeight: 600 }}>₹{e.amount.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ fontSize: 13, margin: '4px 0 10px', color: C.ink2 }}>“{e.reason}”</p>
            {e.status === 'pending' ? (
              <div className="row" style={{ gap: 8 }}>
                <Pill id="approve" label="Approve" ctl={ctl} small onClick={() => decide(e.id, 'approved')} />
                <Pill id="reject" label="Reject" ctl={ctl} small filled={false} onClick={() => decide(e.id, 'rejected')} />
              </div>
            ) : (
              <span className="ga-tag">{e.status === 'approved' ? 'Approved by you' : 'Rejected by you'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- The app ---------- */
export default function GeneratedApp({
  guesses,
  editing,
  view,
  openChatTick,
  frozenRev,
}: {
  guesses: boolean
  editing: boolean
  view: 'store' | 'inbox'
  openChatTick: number
  frozenRev?: string | null
}) {
  const { edits } = useWS()
  const [chatOpen, setChatOpen] = useState(false)
  const [escalations, setEscalations] = useState<Escalation[]>([
    { id: 'seed', name: 'Rahul M.', order: '1038', amount: 2400, reason: 'The serum arrived leaking. Photo attached.', status: 'pending' },
  ])
  const ctl: Ctl = { guesses, editing: editing && !frozenRev }
  const first = useRef(openChatTick)

  useEffect(() => {
    if (openChatTick !== first.current) setChatOpen(true)
  }, [openChatTick])

  // Older revisions: before Rev D the button was ink.
  const old = false // the sage buttons came from the Taste step, so every revision has them
  const vars = { '--ga-btn': old ? C.ink : edits.btnColor } as React.CSSProperties

  return (
    <div className="ga-root" style={vars}>
      <div className="ga-scroll">
        {view === 'store' ? (
          <>
            <header className="ga-head">
              <T id="brand" def="Glow & Co." ctl={ctl} className="ga-brand" />
              <nav className="ga-nav">
                <span>Shop</span>
                <span>Rituals</span>
                <span>About</span>
              </nav>
              <Guess on={ctl.guesses && !edits.text.hours} note="Guessed: working hours 10–7" place="left">
                <T id="hours" def="Open 10–7, Mon–Sat" ctl={ctl} className="ga-hours" />
              </Guess>
            </header>
            <section className="ga-hero">
              <T id="eyebrow" def="Small-batch skincare, Jaipur" ctl={ctl} className="ga-eyebrow" />
              <Guess on={ctl.guesses && !edits.text.headline} note="Guessed: headline. Yours will be better." block place="above">
                <T id="headline" def="Skin that feels rested." ctl={ctl} as="h1" className="ga-h1" />
              </Guess>
              <T id="sub" def="Gentle formulas. Daylight packaging. Nothing you can’t pronounce." ctl={ctl} as="p" className="ga-sub" />
              <div className="ga-ctas">
                <Pill id="shop" label="Shop the ritual" ctl={ctl} onClick={() => undefined} />
                <Pill id="track" label="Track an order" ctl={ctl} filled={false} onClick={() => setChatOpen(true)} />
              </div>
            </section>
            <section className="ga-list">
              <div className="ga-eyebrow" style={{ marginBottom: 8 }}>Bestsellers</div>
              {[
                ['Rose water toner', '₹680'],
                ['Saffron night serum', '₹1,450'],
                ['Oat & honey cleanser', '₹520'],
              ].map(([n, p]) => (
                <div key={n} className="ga-li">
                  <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 20 }}>{n}</span>
                  <span style={{ fontSize: 13 }}>{p}</span>
                </div>
              ))}
            </section>
            <footer className="ga-foot">Glow & Co. · Returns within 14 days · hello@glowandco.in</footer>
          </>
        ) : (
          <Inbox ctl={ctl} escalations={escalations} setEscalations={setEscalations} />
        )}
      </div>

      {view === 'store' && !chatOpen && (
        <div className="ga-launch">
          <Guess on={ctl.guesses && edits.btnColor === '#7C8B6F'} note="Guessed: sage for buttons, from your screenshot" place="above">
            <Pill id="launcher" label="Ask us" ctl={ctl} onClick={() => setChatOpen(true)} />
          </Guess>
        </div>
      )}
      {view === 'store' && chatOpen && (
        <CustomerChat ctl={ctl} onClose={() => setChatOpen(false)} onEscalate={(e) => setEscalations((es) => [e, ...es])} />
      )}
    </div>
  )
}
