import { BLUEPRINT } from '../../data/demo'
import { inr } from './shared'

/* Drawn like a technical sheet: ink boxes, thin rules, ticked dimension lines, red only where you step in. */

function Defs() {
  return (
    <defs>
      <marker id="bp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 1 9 5 0 9" fill="none" stroke="var(--ink)" strokeWidth="1.4" />
      </marker>
      <marker id="bp-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 1 9 5 0 9" fill="none" stroke="var(--red)" strokeWidth="1.4" />
      </marker>
      <marker id="bp-tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M5 0v10" stroke="var(--ink-3)" strokeWidth="1.2" />
      </marker>
    </defs>
  )
}

function Box({
  x,
  y,
  w,
  h,
  title,
  note,
  tone = 'ink',
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  note?: string
  tone?: 'ink' | 'red' | 'muted'
}) {
  const stroke = tone === 'red' ? 'var(--red)' : tone === 'muted' ? 'var(--rule-strong)' : 'var(--ink)'
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="3"
        fill={tone === 'red' ? 'var(--red-wash)' : 'var(--sheet)'}
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray={tone === 'red' ? '5 3' : undefined}
      />
      <text x={x + 12} y={y + (note ? 22 : h / 2 + 5)} className="bp-svg-title" fill={tone === 'red' ? 'var(--red-text)' : 'var(--ink)'}>
        {title}
      </text>
      {note && (
        <text x={x + 12} y={y + 39} className="bp-svg-note" fill="var(--ink-3)">
          {note}
        </text>
      )}
    </g>
  )
}

function Dim({ x1, y1, x2, y2, label, lx, ly, red }: { x1: number; y1: number; x2: number; y2: number; label: string; lx: number; ly: number; red?: boolean }) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={red ? 'var(--red)' : 'var(--ink)'}
        strokeWidth="1.2"
        strokeDasharray={red ? '4 3' : undefined}
        markerStart="url(#bp-tick)"
        markerEnd={red ? 'url(#bp-arrow-red)' : 'url(#bp-arrow)'}
      />
      <text x={lx} y={ly} textAnchor="middle" className="bp-svg-dim" fill={red ? 'var(--red-text)' : 'var(--ink-2)'}>
        {label}
      </text>
    </g>
  )
}

export function PagesDiagram({ limit, refundId }: { limit: number; refundId: string }) {
  const [chat, status, inbox, refunds, settings] = BLUEPRINT.pages
  const escalate = refundId === 'under' ? `refunds over ${inr(limit)}` : refundId === 'draft' ? 'every refund' : 'refund details'
  return (
    <svg viewBox="0 0 640 300" className="bp-svg" role="img" aria-label="Sitemap: customer pages on the left, your pages on the right">
      <Defs />
      <text x="20" y="22" className="bp-svg-label" fill="var(--ink-3)">CUSTOMER SIDE</text>
      <text x="380" y="22" className="bp-svg-label" fill="var(--ink-3)">YOUR SIDE · LOGIN REQUIRED</text>
      <line x1="320" y1="10" x2="320" y2="290" stroke="var(--rule-strong)" strokeDasharray="2 4" />

      <Box x={20} y={40} w={240} h={52} title={chat.name} note={chat.note} />
      <Box x={20} y={170} w={240} h={52} title={status.name} note={status.note} />
      <Box x={380} y={40} w={240} h={52} title={inbox.name} note={inbox.note} />
      <Box x={380} y={140} w={240} h={52} title={refunds.name} note={refunds.note} />
      <Box x={380} y={232} w={240} h={52} title={settings.name} note={settings.note} tone="muted" />

      {/* chat → order status */}
      <Dim x1={70} y1={92} x2={70} y2={170} label="" lx={0} ly={0} />
      <text x="80" y="136" className="bp-svg-dim" fill="var(--ink-2)">order no. + email</text>

      {/* chat → inbox */}
      <Dim x1={260} y1={66} x2={380} y2={66} label="every conversation" lx={320} ly={58} />

      {/* chat → refund approvals */}
      <path d="M200 92 V166 H380" fill="none" stroke="var(--red)" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#bp-arrow-red)" />
      <text x="290" y="158" textAnchor="middle" className="bp-svg-dim" fill="var(--red-text)">{escalate}</text>

      {/* inbox → refunds, settings */}
      <line x1="600" y1="92" x2="600" y2="140" stroke="var(--ink-3)" strokeWidth="1.2" markerEnd="url(#bp-arrow)" />
      <line x1="600" y1="192" x2="600" y2="232" stroke="var(--ink-3)" strokeWidth="1.2" markerEnd="url(#bp-arrow)" />
      <text x="20" y="252" className="bp-svg-note" fill="var(--ink-3)">Opens from a button on your store.</text>
      <text x="20" y="268" className="bp-svg-note" fill="var(--ink-3)">No login for customers.</text>
    </svg>
  )
}

export function AgentsDiagram({ limit, refundId, source }: { limit: number; refundId: string; source: string }) {
  const under = refundId === 'under'
  return (
    <svg viewBox="0 0 640 240" className="bp-svg" role="img" aria-label="Agent flow: front desk hands off to order tracker or refund helper, which escalates to you">
      <Defs />
      {/* customer */}
      <circle cx="44" cy="120" r="30" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="44" y="124" textAnchor="middle" className="bp-svg-note" fill="var(--ink)">Customer</text>

      <Box x={110} y={96} w={120} h={48} title="Front desk" />
      <Dim x1={74} y1={120} x2={110} y2={120} label="" lx={0} ly={0} />

      <Box x={290} y={24} w={150} h={52} title="Order tracker" note={`reads ${source}`} />
      <Box x={290} y={164} w={150} h={52} title="Refund helper" note="checks the policy" />
      <path d="M230 110 C260 110 260 50 290 50" fill="none" stroke="var(--ink)" strokeWidth="1.2" markerEnd="url(#bp-arrow)" />
      <path d="M230 130 C260 130 260 190 290 190" fill="none" stroke="var(--ink)" strokeWidth="1.2" markerEnd="url(#bp-arrow)" />
      <text x="236" y="84" textAnchor="end" className="bp-svg-dim" fill="var(--ink-2)">where’s my order</text>
      <text x="236" y="164" textAnchor="end" className="bp-svg-dim" fill="var(--ink-2)">refund</text>

      {under ? (
        <>
          <Box x={500} y={120} w={120} h={40} title="Refund issued" tone="muted" />
          <Box x={500} y={186} w={120} h={40} title="You" tone="red" />
          <path d="M440 182 C470 182 470 140 500 140" fill="none" stroke="var(--ink)" strokeWidth="1.2" markerEnd="url(#bp-arrow)" />
          <path d="M440 198 C470 198 470 206 500 206" fill="none" stroke="var(--red)" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#bp-arrow-red)" />
          <text x="455" y="124" textAnchor="middle" className="bp-svg-dim" fill="var(--ink-2)">up to {inr(limit)}</text>
          <text x="470" y="232" textAnchor="middle" className="bp-svg-dim" fill="var(--red-text)">over {inr(limit)}</text>
        </>
      ) : (
        <>
          <Box x={500} y={170} w={120} h={40} title="You" tone="red" />
          <line x1="440" y1="190" x2="500" y2="190" stroke="var(--red)" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#bp-arrow-red)" />
          <text x="470" y="226" textAnchor="middle" className="bp-svg-dim" fill="var(--red-text)">
            {refundId === 'draft' ? 'every refund' : 'details only'}
          </text>
        </>
      )}
      <Box x={500} y={30} w={120} h={40} title="Reply sent" tone="muted" />
      <line x1="440" y1="50" x2="500" y2="50" stroke="var(--ink)" strokeWidth="1.2" markerEnd="url(#bp-arrow)" />
    </svg>
  )
}

/* Phone width: the same drawings as stacked lists, so nothing needs sideways scrolling. */

export function PagesList({ limit, refundId }: { limit: number; refundId: string }) {
  const escalate = refundId === 'under' ? `Refunds over ${inr(limit)} land here` : refundId === 'draft' ? 'Every refund lands here' : 'Refund details land here'
  const groups = [
    { side: 'Customer side', pages: BLUEPRINT.pages.filter((p) => p.who === 'Customers') },
    { side: 'Your side · login required', pages: BLUEPRINT.pages.filter((p) => p.who !== 'Customers') },
  ]
  return (
    <div className="bp-mlist">
      {groups.map((g) => (
        <div key={g.side} className="bp-mgroup">
          <span className="label">{g.side}</span>
          {g.pages.map((p) => (
            <div key={p.name} className={'bp-mbox' + (p.name === 'Refund approvals' ? ' is-red' : '')}>
              <b>{p.name}</b>
              <small>{p.name === 'Refund approvals' ? escalate : p.note}</small>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function AgentsList({ limit, refundId, source }: { limit: number; refundId: string; source: string }) {
  const end = refundId === 'under' ? `Up to ${inr(limit)}: refund issued. Over: goes to you.` : refundId === 'draft' ? 'Every refund goes to you.' : 'Details only. Goes to you.'
  return (
    <ol className="bp-mflow">
      <li><span className="label">Customer asks</span></li>
      <li className="bp-mbox"><b>Front desk</b><small>Works out what they want</small></li>
      <li className="bp-mbranch">
        <div className="bp-mbox"><b>Order tracker</b><small>Reads {source}. Replies.</small></div>
        <div className="bp-mbox"><b>Refund helper</b><small>Checks the policy</small></div>
      </li>
      <li className="bp-mbox is-red"><b>You</b><small>{end}</small></li>
    </ol>
  )
}
