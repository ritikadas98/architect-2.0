// Workspace-only scripted content: per-step credit costs, revision diffs, file snippets,
// and the tiny "understand the request" script behind the chat input.

import { BUILD_STEPS, CODE_SAMPLE } from '../../data/demo'

/** Credits each build step costs. Sums to 160, inside the blueprint's 140–190 estimate. */
export const STEP_CREDITS: Record<string, number> = {
  s1: 6, s2: 10, s3: 26, s4: 20, s5: 0, s6: 30, s7: 12, s8: 6, s9: 28, s10: 18, s11: 4,
}
export const BUILD_TOTAL_MS = BUILD_STEPS.reduce((a, s) => a + s.ms, 0)
/** The real build takes ~14 minutes. The prototype plays it in ~11 seconds. */
export const SIM_MINUTES = 14

/* ---------------- Revision diffs ---------------- */

export type RevDiff = { plain: string[]; dev: string[] }

export const REV_DIFFS: Record<string, RevDiff> = {
  A: {
    plain: ['The plan was approved. Nothing built yet.'],
    dev: ['+ architect.json', '+ design.md', '+ .architect/skills.json'],
  },
  B: {
    plain: ['Customers can chat with the desk', 'Customers can check an order with order no. + email'],
    dev: ['+ app/chat/page.tsx', '+ components/ChatWindow.tsx', '+ app/order/[id]/page.tsx', '+ lib/verify.ts'],
  },
  C: {
    plain: ['Three AI agents: front desk, order tracker, refund helper', 'Orders come from 24 sample orders until you connect Shopify'],
    dev: ['+ agents/desk.py', '+ agents/orders.py', '+ agents/refunds.py', '+ fixtures/orders.json (24 rows)', '+ egress allowlist *.myshopify.com'],
  },
  D: {
    plain: ['You got a team inbox', 'Refunds over ₹1,500 now wait for your approval'],
    dev: ['+ app/inbox/page.tsx', '+ app/refunds/page.tsx', '+ app/api/refund/route.ts', '~ agents/desk.py  handoff → refunds'],
  },
  E: {
    plain: ['The chat scrolls to the newest message again. My bug, so it was free.'],
    dev: CODE_SAMPLE.split('\n').filter((l) => l.startsWith('+') || l.startsWith('-')),
  },
  F: {
    plain: ['I used the app like a customer would. 14 of 14 things worked.', 'Agents answered 18 of 20 test questions right'],
    dev: ['playwright  14 flows · 14 passed', 'evals       18/20 · 2 failures in agents/refunds.py', 'no code changes'],
  },
}

/* ---------------- Files for the code viewer ---------------- */

export const FILE_SNIPPETS: Record<string, string> = {
  'components/ChatWindow.tsx': CODE_SAMPLE,
  'app/api/refund/route.ts': `import { NextRequest } from 'next/server'
import { refunds } from '@/lib/shopify'
import { requireVerifiedCustomer } from '@/lib/verify'

export async function POST(req: NextRequest) {
  const { orderId, amount, reason } = await req.json()
  await requireVerifiedCustomer(req, orderId)

  // ⚠ Inspection: the ₹1,500 limit only lives in the agent's prompt.
  // Nothing here stops a bigger refund. "Fix it for me" moves it into code.
  return refunds.create({ orderId, amount, reason })
}`,
  'agents/refunds.py': `from lyzr_adk import Agent, tool
from tools.shopify import get_order

refunds = Agent(
    name="Refund helper",
    model="auto",
    instructions="Approve refunds under 1500 INR. Escalate the rest.",
    # ⚠ Inspection: this limit is only a sentence in a prompt.
    tools=[get_order, tool("request_refund", "/api/refund")],
)`,
  'lib/verify.ts': `export async function requireVerifiedCustomer(req: Request, orderId: string) {
  const email = req.headers.get('x-customer-email')
  const order = await shopify.orders.get(orderId)
  if (!email || order.email.toLowerCase() !== email.toLowerCase()) {
    throw new Response('Not your order', { status: 403 })
  }
  return { orderId, email }
}`,
  'design.md': `# Glow & Co. design rules
Written from your two screenshots. I have to follow these.

- Background: cream #F4EDE2. Never pure white.
- Ink: #2E2A24. Buttons: sage #7C8B6F.
- Headings: Cormorant Garamond, 500, tall and thin.
- Buttons are pills. One per screen is filled.
- Tone: calm, first name, no exclamation marks.
- Banned: gradients, emoji icons, "Revolutionize".`,
  'architect.json': `{
  "name": "glow-support",
  "stage": "ready",
  "agents": ["desk", "orders", "refunds"],
  "data": { "orders": "shopify:read", "conversations": "postgres" },
  "limits": { "refundInr": 1500, "chatPerHour": null }
}`,
  '.architect/skills.json': `{
  "installed": ["interview", "taste", "security", "shopify", "hindi", "refund-guard"]
}`,
}

export function snippetFor(path: string) {
  if (FILE_SNIPPETS[path]) return FILE_SNIPPETS[path]
  const name = path.split('/').pop() || path
  if (path.endsWith('.py'))
    return `from lyzr_adk import Agent\n\n# ${name}: one of your three agents.\n# Written in Rev C. The refund rule lives in agents/refunds.py.`
  return `// ${path}\n// Unchanged since Rev D.\n// The files with a badge are the ones that changed.\n\nexport default function Page() {\n  return <Screen />\n}`
}

/* ---------------- Chat script: understand, then ask ---------------- */

export type Plan = {
  ask: string
  options: [string, string]
  steps: (choice: string) => { simple: string; dev: string }[]
  title: (choice: string) => string
  colour?: string
}

const COLOURS: Record<string, string> = {
  sage: '#7C8B6F',
  green: '#5E7A55',
  black: '#2E2A24',
  ink: '#2E2A24',
  terracotta: '#B4654A',
  rust: '#B4654A',
  brown: '#7A5A40',
  pink: '#C9A19A',
  rose: '#C9A19A',
  blue: '#6F8BA0',
  navy: '#34455C',
  red: '#A8483A',
  gold: '#B8914A',
}

export function short(s: string, n = 34) {
  const t = s.trim().replace(/\s+/g, ' ')
  return t.length > n ? t.slice(0, n - 1) + '…' : t
}

export function planFor(text: string): Plan {
  const t = text.toLowerCase()
  const colourWord = Object.keys(COLOURS).find((c) => new RegExp('\\b' + c + '\\b').test(t))
  if (colourWord || /colou?r|button/.test(t)) {
    const name = colourWord || 'the new colour'
    return {
      ask: 'Change it everywhere or just on the chat page?',
      options: ['Everywhere', 'Just the chat page'],
      colour: colourWord ? COLOURS[colourWord] : undefined,
      steps: (c) => [
        { simple: 'Updating the colour rule in your design notes', dev: `design.md · tokens.css --btn-bg: ${colourWord ? COLOURS[colourWord] : '#…'}` },
        { simple: c === 'Everywhere' ? 'Repainting every button' : 'Repainting the chat buttons only', dev: c === 'Everywhere' ? '4 files · Button.tsx, ChatLauncher.tsx, Hero.tsx, Inbox.tsx' : 'components/ChatWindow.tsx · scoped override' },
        { simple: 'Checking the text is still easy to read', dev: 'axe: contrast 4.8:1 · pass' },
      ],
      title: (c) => `Buttons changed to ${name} (${c === 'Everywhere' ? 'everywhere' : 'chat page'})`,
    }
  }
  if (/refund|limit|₹|rupee/.test(t)) {
    const amt = (t.match(/\d[\d,]{2,}/) || [])[0]
    return {
      ask: 'Change the limit for every refund, or only requests from today?',
      options: ['Every refund', 'Only new ones'],
      steps: () => [
        { simple: 'Changing the limit in code, not just the AI’s instructions', dev: `lib/limits.ts REFUND_LIMIT_INR = ${amt ? amt.replace(/,/g, '') : '…'}` },
        { simple: 'Re-running the refund tests', dev: 'evals/refunds.yaml · 20/20 passed' },
      ],
      title: (c) => `Refund limit changed${amt ? ' to ₹' + amt : ''} (${c.toLowerCase()})`,
    }
  }
  if (/hindi|tamil|language|english|marathi|bengali/.test(t)) {
    return {
      ask: 'Add it for customers only, or your inbox too?',
      options: ['Customers only', 'Inbox too'],
      steps: () => [
        { simple: 'Teaching the front desk the new language', dev: 'agents/desk.py language += …' },
        { simple: 'Writing 12 test chats in it', dev: 'evals/lang.yaml · 12/12 passed' },
      ],
      title: (c) => `Language updated (${c.toLowerCase()})`,
    }
  }
  if (/hour|time|open|close|weekend/.test(t)) {
    return {
      ask: 'Show the new hours on the chat only, or everywhere they appear?',
      options: ['Chat only', 'Everywhere'],
      steps: () => [
        { simple: 'Updating your working hours', dev: 'architect.json hours.* · settings/page.tsx' },
        { simple: 'Telling the desk what to say after hours', dev: 'agents/desk.py after_hours_reply' },
      ],
      title: () => 'Working hours updated',
    }
  }
  return {
    ask: 'Quick check before I touch anything. Just this screen, or everywhere it applies?',
    options: ['Just this screen', 'Everywhere'],
    steps: () => [
      { simple: 'Reading what’s there now', dev: 'rg · 3 matches in app/' },
      { simple: 'Making the change', dev: '2 files changed · +14 −3' },
      { simple: 'Testing it like a customer would', dev: 'playwright: 14 flows · 14 passed' },
    ],
    title: () => short(text, 44),
  }
}
