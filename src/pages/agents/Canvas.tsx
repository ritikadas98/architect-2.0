import type { AgentDef } from './data'
import { modelName } from './data'

export type NodeId = string // agent id, or 'tool:shopify' | 'tool:kb' | 'tool:inbox' | 'owner'

type Box = { id: NodeId; x: number; y: number; w: number; h: number }

const AW = 160
const AH = 58

function clip(from: Box, to: Box) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const t = Math.min(from.w / 2 / Math.abs(dx || 1e-6), from.h / 2 / Math.abs(dy || 1e-6))
  return { x: from.x + dx * t, y: from.y + dy * t }
}

function Edge({ a, b, label, dashed, red }: { a: Box; b: Box; label?: string; dashed?: boolean; red?: boolean }) {
  const p = clip(a, b)
  const q = clip(b, a)
  const mx = (p.x + q.x) / 2
  const my = (p.y + q.y) / 2
  const w = label ? label.length * 6.1 + 12 : 0
  const stroke = red ? 'var(--red)' : dashed ? 'var(--ink-4)' : 'var(--ink-2)'
  return (
    <g>
      <line
        x1={p.x}
        y1={p.y}
        x2={q.x}
        y2={q.y}
        stroke={stroke}
        strokeWidth={dashed ? 1.2 : 1.5}
        strokeDasharray={dashed ? '4 4' : undefined}
        markerEnd={dashed ? undefined : red ? 'url(#ag-arrow-red)' : 'url(#ag-arrow)'}
      />
      {label && (
        <g>
          <rect x={mx - w / 2} y={my - 9} width={w} height={18} rx={3} fill="var(--paper)" stroke={red ? 'var(--red)' : 'var(--rule-strong)'} />
          <text x={mx} y={my + 3.5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10.5} fill={red ? 'var(--red-text)' : 'var(--ink-2)'}>
            {label}
          </text>
        </g>
      )}
    </g>
  )
}

export function AgentCanvas({
  agents,
  selected,
  onSelect,
  shopifyConnected,
  limit,
}: {
  agents: AgentDef[]
  selected: NodeId
  onSelect: (id: NodeId) => void
  shopifyConnected: boolean
  limit: number
}) {
  const boxes: Record<string, Box> = {}
  agents.forEach((a) => (boxes[a.id] = { id: a.id, x: a.x, y: a.y, w: AW, h: AH }))
  const customer: Box = { id: 'customer', x: 380, y: 36, w: 150, h: 30 }
  const shopify: Box = { id: 'tool:shopify', x: 180, y: 420, w: 160, h: 50 }
  const kb: Box = { id: 'tool:kb', x: 420, y: 420, w: 170, h: 50 }
  const inbox: Box = { id: 'tool:inbox', x: 660, y: 130, w: 130, h: 50 }
  const owner: Box = { id: 'owner', x: 660, y: 420, w: 130, h: 50 }
  const height = Math.max(480, ...agents.map((a) => a.y + 60))

  const uses = (tool: string) => agents.filter((a) => a.tools.includes(tool))
  const allFiles = Array.from(new Set(agents.flatMap((a) => a.knowledge)))
  const desk = boxes['desk']
  const refunds = boxes['refunds']

  const node = (b: Box, body: React.ReactNode, label: string) => {
    const on = selected === b.id
    return (
      <g
        key={b.id}
        className="ag-node"
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={on}
        onClick={() => onSelect(b.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(b.id)
          }
        }}
      >
        {on && (
          <rect
            x={b.x - b.w / 2 - 5}
            y={b.y - b.h / 2 - 5}
            width={b.w + 10}
            height={b.h + 10}
            rx={6}
            fill="none"
            stroke="var(--red)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
        )}
        {body}
      </g>
    )
  }

  return (
    <svg viewBox={`0 0 760 ${height}`} className="ag-canvas-svg" role="group" aria-label="Agent canvas">
      <defs>
        <marker id="ag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--ink-2)" />
        </marker>
        <marker id="ag-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="var(--red)" />
        </marker>
      </defs>

      {/* Edges first, so nodes sit on top */}
      {desk && <Edge a={customer} b={desk} label="message" />}
      {agents
        .filter((a) => a.from && boxes[a.from])
        .map((a) => (
          <Edge key={'e' + a.id} a={boxes[a.from!]} b={boxes[a.id]} label={a.edge} />
        ))}
      {uses('get_order').concat(uses('refund')).filter((a, i, arr) => arr.indexOf(a) === i).map((a) => (
        <Edge key={'s' + a.id} a={boxes[a.id]} b={shopify} dashed />
      ))}
      {agents
        .filter((a) => a.tools.includes('kb') || a.knowledge.length)
        .filter((a) => a.id !== 'desk')
        .map((a) => (
          <Edge key={'k' + a.id} a={boxes[a.id]} b={kb} dashed />
        ))}
      {desk && <Edge a={desk} b={inbox} dashed />}
      <Edge a={inbox} b={owner} dashed />
      {refunds && <Edge a={refunds} b={owner} label={`refund > ₹${limit.toLocaleString('en-IN')}`} red />}

      {/* Customer entry */}
      <g>
        <rect x={customer.x - 75} y={customer.y - 15} width={150} height={30} rx={15} fill="var(--paper)" stroke="var(--ink-3)" strokeDasharray="3 3" />
        <text x={customer.x} y={customer.y + 4} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--ink-2)">
          Customer chat
        </text>
      </g>

      {agents.map((a) => {
        const b = boxes[a.id]
        return node(
          b,
          <>
            <rect x={b.x - AW / 2} y={b.y - AH / 2} width={AW} height={AH} rx={4} fill="var(--sheet)" stroke="var(--ink)" strokeWidth={1.5} />
            <rect x={b.x - AW / 2} y={b.y - AH / 2} width={4} height={AH} fill={a.custom ? 'var(--red)' : 'var(--ink)'} />
            <text x={b.x - AW / 2 + 14} y={b.y - 7} fontFamily="var(--font-mono)" fontSize={9} letterSpacing="0.08em" fill="var(--ink-3)">
              {(a.custom ? 'NEW · ' : '') + modelName(a.model).toUpperCase().slice(0, 20)}
            </text>
            <text x={b.x - AW / 2 + 14} y={b.y + 13} fontSize={14.5} fontWeight={750} fill="var(--ink)" style={{ fontStretch: '112%' }}>
              {a.name.length > 17 ? a.name.slice(0, 16) + '…' : a.name}
            </text>
          </>,
          `${a.name}, agent. Select to edit.`,
        )
      })}

      {node(
        shopify,
        <>
          <rect
            x={shopify.x - shopify.w / 2}
            y={shopify.y - shopify.h / 2}
            width={shopify.w}
            height={shopify.h}
            rx={25}
            fill="var(--paper-2)"
            stroke={shopifyConnected ? 'var(--blue)' : 'var(--amber)'}
            strokeWidth={1.3}
            strokeDasharray={shopifyConnected ? undefined : '4 3'}
          />
          <text x={shopify.x} y={shopify.y - 3} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)">
            Shopify
          </text>
          <text x={shopify.x} y={shopify.y + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill={shopifyConnected ? 'var(--blue-text)' : 'var(--amber)'}>
            {shopifyConnected ? 'CONNECTED · READ ONLY' : 'SAMPLE ORDERS'}
          </text>
        </>,
        'Shopify tool',
      )}
      {node(
        kb,
        <>
          <rect x={kb.x - kb.w / 2} y={kb.y - kb.h / 2} width={kb.w} height={kb.h} rx={25} fill="var(--paper-2)" stroke="var(--blue)" strokeWidth={1.3} />
          <text x={kb.x} y={kb.y - 3} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)">
            Knowledge
          </text>
          <text x={kb.x} y={kb.y + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9.5} fill="var(--blue-text)">
            {allFiles.includes('refund-policy.pdf') ? 'refund-policy.pdf' : allFiles[0] || 'no files yet'}
            {allFiles.length > 1 ? ` +${allFiles.length - 1}` : ''}
          </text>
        </>,
        'Knowledge files',
      )}
      {node(
        inbox,
        <>
          <rect x={inbox.x - inbox.w / 2} y={inbox.y - inbox.h / 2} width={inbox.w} height={inbox.h} rx={25} fill="var(--paper-2)" stroke="var(--blue)" strokeWidth={1.3} />
          <text x={inbox.x} y={inbox.y - 3} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)">
            Inbox
          </text>
          <text x={inbox.x} y={inbox.y + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill="var(--blue-text)">
            EVERY CHAT
          </text>
        </>,
        'Team inbox tool',
      )}
      {node(
        owner,
        <>
          <rect x={owner.x - owner.w / 2} y={owner.y - owner.h / 2} width={owner.w} height={owner.h} rx={4} fill="var(--ink)" stroke="var(--ink)" />
          <text x={owner.x} y={owner.y - 3} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--on-ink)">
            You (owner)
          </text>
          <text x={owner.x} y={owner.y + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill="var(--on-ink)" opacity={0.75}>
            HUMAN · APPROVES
          </text>
        </>,
        'You, the owner',
      )}
    </svg>
  )
}
