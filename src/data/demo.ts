// Scripted content for the prototype. Every project walks through this one sample build
// (a support desk for a small skincare brand) so each step of the flow has real substance.

export const SAMPLE_PROMPT =
  'A support desk for my skincare brand. Customers ask where their order is, and ask for refunds. An AI should answer, and send tricky refunds to me.'

export const SAMPLE_PROMPTS = [
  { label: 'Support desk for my brand', prompt: SAMPLE_PROMPT },
  {
    label: 'Lead qualifier for my agency',
    prompt: 'An agent that reads inbound leads from my website form, researches the company and scores them before I call.',
  },
  {
    label: 'Internal expense checker',
    prompt: 'Employees upload receipts, an AI checks them against our travel policy and flags anything odd for finance.',
  },
]

/* ---------------- Brief: what the AI read from references ---------------- */

export type ReadItem = { id: string; kind: 'colour' | 'type' | 'layout' | 'tone' | 'shape'; text: string; swatch?: string }

export const REFERENCE_FILES = [
  { name: 'spa-homepage.png', kind: 'image' as const },
  { name: 'our-instagram.png', kind: 'image' as const },
]

export const REFERENCE_READS: ReadItem[] = [
  { id: 'r1', kind: 'colour', text: 'Warm cream background', swatch: '#F4EDE2' },
  { id: 'r2', kind: 'colour', text: 'Muted sage green for buttons', swatch: '#7C8B6F' },
  { id: 'r3', kind: 'type', text: 'Serif headings, thin and tall' },
  { id: 'r4', kind: 'type', text: 'Small, plain sans-serif body text' },
  { id: 'r5', kind: 'shape', text: 'Fully rounded pill buttons' },
  { id: 'r6', kind: 'layout', text: 'Lots of empty space, one idea per screen' },
  { id: 'r7', kind: 'tone', text: 'Calm, first-name, no exclamation marks' },
  { id: 'r8', kind: 'layout', text: 'Product photos in soft daylight, no people', swatch: undefined },
]

/* ---------------- Brief: questions ---------------- */

export type Question = {
  id: string
  q: string
  why: string
  options: { id: string; label: string; hint?: string }[]
  recommended: string
}

export const QUESTIONS: Question[] = [
  {
    id: 'who',
    q: 'Who will use this?',
    why: 'Decides whether I build one app or two: a chat for customers, and an inbox for you.',
    options: [
      { id: 'both', label: 'Customers, plus me and my team', hint: 'Customer chat + team inbox' },
      { id: 'cust', label: 'Only customers', hint: 'Just the chat' },
      { id: 'team', label: 'Only my team', hint: 'Just the inbox' },
    ],
    recommended: 'both',
  },
  {
    id: 'orders',
    q: 'Where do your orders live today?',
    why: 'If I can’t reach real orders, the AI can only pretend. I’ll tell you if it’s pretending.',
    options: [
      { id: 'shopify', label: 'Shopify' },
      { id: 'sheet', label: 'A Google Sheet' },
      { id: 'woo', label: 'WooCommerce' },
      { id: 'unsure', label: 'Not sure yet', hint: 'I’ll use sample orders and flag it' },
    ],
    recommended: 'shopify',
  },
  {
    id: 'refund',
    q: 'When a customer asks for a refund, what can the AI do on its own?',
    why: 'This is the one decision that costs you money if I guess wrong.',
    options: [
      { id: 'draft', label: 'Draft it, I approve every one', hint: 'Safest' },
      { id: 'under', label: 'Approve small ones, send big ones to me', hint: 'You pick the limit' },
      { id: 'never', label: 'Never touch refunds, just collect details' },
    ],
    recommended: 'under',
  },
  {
    id: 'verify',
    q: 'How should a customer prove an order is theirs?',
    why: 'Without this, anyone who guesses an order number sees someone’s address.',
    options: [
      { id: 'email', label: 'Order number + the email they used', hint: 'Recommended' },
      { id: 'otp', label: 'A code sent to their phone' },
      { id: 'account', label: 'They log in to an account' },
    ],
    recommended: 'email',
  },
  {
    id: 'lang',
    q: 'Which languages?',
    why: 'Changes which model I pick for the chat and how I write the replies.',
    options: [
      { id: 'en', label: 'English' },
      { id: 'enhi', label: 'English + Hindi' },
      { id: 'auto', label: 'Whatever the customer writes in' },
    ],
    recommended: 'enhi',
  },
]

/* ---------------- Taste ---------------- */

export type Direction = {
  id: string
  name: string
  note: string
  from: string
  bg: string
  ink: string
  accent: string
  display: string
  body: string
  radius: number
}

export const DIRECTIONS: Direction[] = [
  {
    id: 'calm',
    name: 'Quiet spa',
    note: 'Straight from your screenshots. Cream, sage, a thin serif.',
    from: 'Your references',
    bg: '#F4EDE2',
    ink: '#2E2A24',
    accent: '#7C8B6F',
    display: '"Cormorant Garamond", Georgia, serif',
    body: '"Archivo", system-ui, sans-serif',
    radius: 999,
  },
  {
    id: 'apothecary',
    name: 'Apothecary label',
    note: 'Your palette, pushed. Labels, rules and small caps, like a glass bottle.',
    from: 'Your references, bolder',
    bg: '#EFE6D6',
    ink: '#3B2F22',
    accent: '#A4553A',
    display: '"Playfair Display", Georgia, serif',
    body: '"Archivo", system-ui, sans-serif',
    radius: 2,
  },
  {
    id: 'clinic',
    name: 'Clean clinic',
    note: 'A deliberate contrast, for comparison. White, blue, clinical.',
    from: 'The opposite, to compare',
    bg: '#FFFFFF',
    ink: '#11203A',
    accent: '#2F6BFF',
    display: '"Archivo", system-ui, sans-serif',
    body: '"Archivo", system-ui, sans-serif',
    radius: 10,
  },
]

export const GENERIC_TELLS = [
  'Purple-to-blue gradient hero',
  'Inter, everywhere, at one weight',
  'Three feature cards with emoji icons',
  '“Revolutionize your workflow”',
  'Glassy cards floating on a dark blur',
]

/* ---------------- Skills ---------------- */

export type Skill = {
  id: string
  name: string
  by: string
  cat: 'Design' | 'Planning' | 'Security' | 'Data' | 'Agents' | 'Language' | 'Launch'
  what: string
  why?: string
  installs: string
  stars: string
}

export const SKILLS: Skill[] = [
  {
    id: 'interview',
    name: 'Interview me',
    by: 'architect',
    cat: 'Planning',
    what: 'Asks you short questions before building, instead of guessing.',
    why: 'Always on. You’re using it right now.',
    installs: '41k',
    stars: '4.9',
  },
  {
    id: 'taste',
    name: 'Taste from references',
    by: 'architect',
    cat: 'Design',
    what: 'Reads your screenshots and turns them into colours, fonts and spacing it must follow.',
    why: 'You attached 2 screenshots.',
    installs: '28k',
    stars: '4.8',
  },
  {
    id: 'security',
    name: 'Security review',
    by: 'architect',
    cat: 'Security',
    what: 'Checks who can see what, where keys live, and what a stranger could break.',
    why: 'Your app handles customer emails and addresses.',
    installs: '33k',
    stars: '4.9',
  },
  {
    id: 'shopify',
    name: 'Shopify orders',
    by: 'shopify-community',
    cat: 'Data',
    what: 'Lets the AI look up real orders, shipping status and refunds.',
    why: 'You said your orders live in Shopify.',
    installs: '12k',
    stars: '4.6',
  },
  {
    id: 'hindi',
    name: 'Hindi + Hinglish replies',
    by: 'indic-nlp',
    cat: 'Language',
    what: 'Replies naturally in Hindi, English or a mix, matching the customer.',
    why: 'You picked English + Hindi.',
    installs: '6.2k',
    stars: '4.7',
  },
  {
    id: 'refund-guard',
    name: 'Money guardrails',
    by: 'architect',
    cat: 'Agents',
    what: 'Hard limits on what an agent can spend or refund, enforced outside the AI.',
    why: 'Your agent can issue refunds.',
    installs: '9.8k',
    stars: '4.8',
  },
  {
    id: 'anti-slop',
    name: 'Not-another-AI-app',
    by: 'design-crew',
    cat: 'Design',
    what: 'Blocks the default AI look: gradients, emoji icons, filler copy.',
    installs: '19k',
    stars: '4.7',
  },
  {
    id: 'a11y',
    name: 'Accessibility pass',
    by: 'a11y-project',
    cat: 'Design',
    what: 'Checks contrast, keyboard use and screen readers before launch.',
    installs: '15k',
    stars: '4.8',
  },
  {
    id: 'privacy',
    name: 'Privacy page writer',
    by: 'architect',
    cat: 'Launch',
    what: 'Writes a plain privacy policy from what your app actually collects.',
    installs: '11k',
    stars: '4.5',
  },
  {
    id: 'evals',
    name: 'Agent test cases',
    by: 'lyzr',
    cat: 'Agents',
    what: 'Writes 20 test questions for each agent and runs them before every launch.',
    installs: '7.4k',
    stars: '4.7',
  },
  {
    id: 'seo',
    name: 'Search & sharing basics',
    by: 'web-basics',
    cat: 'Launch',
    what: 'Titles, previews for WhatsApp and LinkedIn, and a sitemap.',
    installs: '22k',
    stars: '4.6',
  },
  {
    id: 'stripe',
    name: 'Stripe payments',
    by: 'stripe',
    cat: 'Data',
    what: 'Checkout, subscriptions and receipts, with keys kept in the vault.',
    installs: '31k',
    stars: '4.8',
  },
]

export const SUGGESTED_SKILL_IDS = ['interview', 'taste', 'security', 'shopify', 'hindi', 'refund-guard']

/* ---------------- Blueprint ---------------- */

export const BLUEPRINT = {
  title: 'Glow & Co. support desk',
  summary:
    'A chat on your site that answers order questions in English or Hindi, and an inbox where you approve refunds over ₹1,500.',
  pages: [
    { name: 'Customer chat', who: 'Customers', note: 'Opens from a button on your store' },
    { name: 'Order status', who: 'Customers', note: 'After they verify with order no. + email' },
    { name: 'Team inbox', who: 'You', note: 'Every conversation, filterable' },
    { name: 'Refund approvals', who: 'You', note: 'One tap to approve or reject' },
    { name: 'Settings', who: 'You', note: 'Refund limit, tone, working hours' },
  ],
  agents: [
    { id: 'desk', name: 'Front desk', job: 'Greets, works out what the customer wants, hands off.' },
    { id: 'orders', name: 'Order tracker', job: 'Looks up the order and shipping status in Shopify.' },
    { id: 'refunds', name: 'Refund helper', job: 'Checks the policy, approves under ₹1,500, escalates the rest.' },
  ],
  data: [
    { name: 'Conversations', where: 'Architect database' },
    { name: 'Refund requests', where: 'Architect database' },
    { name: 'Orders', where: 'Shopify (read only)' },
  ],
  real: [
    'Chat, inbox and approvals work end to end',
    'Order lookups hit your real Shopify store',
    'Refunds over ₹1,500 always wait for you',
  ],
  placeholder: [
    'Shipping updates use Shopify’s status, not the courier’s live tracking',
    'Emails to customers are drafted, not sent, until you connect Gmail',
  ],
  notDoing: ['Phone support', 'Instagram DMs (ask me later, it’s a skill)'],
  estimate: { minutes: [12, 18] as [number, number], credits: [140, 190] as [number, number] },
}

/* ---------------- Build steps ---------------- */

export type BuildStep = {
  id: string
  simple: string
  dev: string
  ms: number
  kind?: 'fix' | 'flag' | 'done'
  note?: string
}

export const BUILD_STEPS: BuildStep[] = [
  { id: 's1', simple: 'Setting up your project', dev: 'sandbox.claim(template=next-agent) · warm pool hit · 1.2s', ms: 900 },
  { id: 's2', simple: 'Saving your taste as rules I have to follow', dev: 'write design.md · tokens.css (12 tokens)', ms: 900 },
  { id: 's3', simple: 'Building the customer chat', dev: 'write app/chat/page.tsx · components/ChatWindow.tsx', ms: 1300 },
  { id: 's4', simple: 'Building the order status page', dev: 'write app/order/[id]/page.tsx · lib/verify.ts', ms: 1100 },
  {
    id: 's5',
    simple: 'Caught my own mistake: the chat didn’t scroll to new messages. Fixed it.',
    dev: 'console: TypeError scrollIntoView of null · patched ChatWindow.tsx:41 · 0 credits',
    ms: 1000,
    kind: 'fix',
    note: 'Free. My mistake, not yours.',
  },
  { id: 's6', simple: 'Creating the three AI agents', dev: 'agents/desk.py · agents/orders.py · agents/refunds.py (lyzr-adk)', ms: 1300 },
  { id: 's7', simple: 'Connecting to Shopify, read only', dev: 'egress allowlist += *.myshopify.com · secret SHOPIFY_TOKEN → vault', ms: 1000 },
  {
    id: 's8',
    simple: 'Using sample orders until you log in to Shopify',
    dev: 'fixtures/orders.json (24 rows) · flag placeholder:orders',
    ms: 800,
    kind: 'flag',
    note: 'Placeholder. Connect Shopify to make it real.',
  },
  { id: 's9', simple: 'Building your team inbox and refund approvals', dev: 'write app/inbox/* · app/refunds/* · 9 files', ms: 1300 },
  { id: 's10', simple: 'Testing it like a customer would', dev: 'playwright: 14 flows · 14 passed · agent evals 18/20', ms: 1200 },
  { id: 's11', simple: 'Done. Have a look.', dev: 'build ok · preview https://3000-a7f2.archpreview.app', ms: 400, kind: 'done' },
]

/* ---------------- Inspection ---------------- */

export type Finding = {
  id: string
  level: 'must' | 'should' | 'ok' | 'placeholder'
  area: 'Security' | 'Customer data' | 'Money' | 'Reliability' | 'Launch basics'
  title: string
  plain: string
  dev: string
  fix?: string
  needsYou?: string
}

export const FINDINGS: Finding[] = [
  {
    id: 'f1',
    level: 'must',
    area: 'Customer data',
    title: 'Anyone with an order number could see that order',
    plain:
      'Order numbers go up one at a time. A stranger could type 1041, 1042, 1043 and read other people’s names and addresses.',
    dev: 'GET /api/order/:id has no ownership check. Enumerable IDs.',
    fix: 'Ask for the order email too, and lock the page after 5 wrong tries',
  },
  {
    id: 'f2',
    level: 'must',
    area: 'Money',
    title: 'Someone could talk the AI into a bigger refund',
    plain:
      'The ₹1,500 limit is written in the AI’s instructions. A clever customer can argue past instructions.',
    dev: 'Limit enforced in prompt only. No server-side check on refunds.create().',
    fix: 'Enforce the limit in code, outside the AI, where talking can’t change it',
  },
  {
    id: 'f3',
    level: 'should',
    area: 'Reliability',
    title: 'One person could run up your AI bill',
    plain: 'Nothing stops a bot from sending 10,000 messages. You’d pay for every reply.',
    dev: 'No rate limit on POST /api/chat.',
    fix: 'Limit each visitor to 30 messages an hour',
  },
  {
    id: 'f4',
    level: 'should',
    area: 'Launch basics',
    title: 'You need a privacy page',
    plain: 'You collect emails and order details. In India that means telling people why, under the DPDP Act.',
    dev: 'No /privacy route. Collected: email, name, address (via Shopify).',
    fix: 'Write one from what the app actually collects',
  },
  {
    id: 'f5',
    level: 'placeholder',
    area: 'Reliability',
    title: 'Orders are sample data',
    plain: 'The AI is answering from 24 made-up orders. Customers would get wrong answers.',
    dev: 'fixtures/orders.json in use. SHOPIFY_TOKEN unset.',
    needsYou: 'Log in to Shopify',
  },
  {
    id: 'f6',
    level: 'ok',
    area: 'Security',
    title: 'Your Shopify key never touches the app',
    plain: 'It sits in the vault. The app gets a stand-in, and the real key is added on the way out.',
    dev: 'Egress proxy injects Authorization header. App env holds placeholder only.',
  },
  {
    id: 'f7',
    level: 'ok',
    area: 'Security',
    title: 'Your inbox needs a login',
    plain: 'Only you and people you invite can open the team inbox.',
    dev: 'Middleware: /inbox, /refunds require role=owner|agent.',
  },
  {
    id: 'f8',
    level: 'ok',
    area: 'Customer data',
    title: 'Conversations are private to your app',
    plain: 'Stored in your app’s own database. Not shared with other apps, not used to train AI.',
    dev: 'Per-app Postgres schema · RLS on · provider zero-retention flag set.',
  },
]

/* ---------------- Revisions ---------------- */

export const REVISIONS = [
  { rev: 'F', title: 'Refund limit enforced in code', when: '2 min ago', by: 'Architect', credits: 6 },
  { rev: 'E', title: 'Hindi replies added', when: '9 min ago', by: 'Architect', credits: 14 },
  { rev: 'D', title: 'You changed the chat button to sage', when: '12 min ago', by: 'You (click-edit)', credits: 0 },
  { rev: 'C', title: 'Team inbox and refund approvals', when: '16 min ago', by: 'Architect', credits: 48 },
  { rev: 'B', title: 'Customer chat and order status', when: '21 min ago', by: 'Architect', credits: 61 },
  { rev: 'A', title: 'Blueprint approved', when: '23 min ago', by: 'You', credits: 0 },
]

/* ---------------- Developer view ---------------- */

export const FILE_TREE = [
  { path: 'app', dir: true, depth: 0 },
  { path: 'app/chat/page.tsx', depth: 1 },
  { path: 'app/order/[id]/page.tsx', depth: 1 },
  { path: 'app/inbox/page.tsx', depth: 1 },
  { path: 'app/refunds/page.tsx', depth: 1 },
  { path: 'app/api/refund/route.ts', depth: 1, changed: true },
  { path: 'agents', dir: true, depth: 0 },
  { path: 'agents/desk.py', depth: 1 },
  { path: 'agents/orders.py', depth: 1 },
  { path: 'agents/refunds.py', depth: 1, changed: true },
  { path: 'lib', dir: true, depth: 0 },
  { path: 'lib/verify.ts', depth: 1 },
  { path: 'lib/limits.ts', depth: 1, added: true },
  { path: 'design.md', depth: 0 },
  { path: 'architect.json', depth: 0 },
  { path: '.architect/skills.json', depth: 0 },
]

export const CODE_SAMPLE = `import { NextRequest } from 'next/server'
import { refunds } from '@/lib/shopify'
import { REFUND_LIMIT_INR, needsOwner } from '@/lib/limits'
import { requireVerifiedCustomer } from '@/lib/verify'

export async function POST(req: NextRequest) {
  const { orderId, amount, reason } = await req.json()
  const customer = await requireVerifiedCustomer(req, orderId)

- // limit lived in the agent prompt only
- return refunds.create({ orderId, amount, reason })
+ // Enforced here, outside the model. The agent can ask; only code can approve.
+ if (needsOwner(amount)) {
+   return queueForOwner({ orderId, amount, reason, customer })
+ }
+ return refunds.create({ orderId, amount, reason })
}`

export const TERMINAL_LINES = [
  '$ architect dev',
  '▲ Next.js 15.4 · ready on http://localhost:3000',
  '● agents  desk, orders, refunds  (lyzr-adk 0.9 · python 3.12)',
  '● proxy   egress allowlist: *.myshopify.com, api.lyzr.ai',
  '✓ compiled /chat in 412ms',
  '✓ compiled /api/refund in 188ms',
  '  POST /api/chat 200 · 1.9s · desk → orders',
  '  POST /api/refund 202 · queued for owner (₹2,400 > ₹1,500)',
]

export const TRACE = [
  { t: '0.00s', who: 'Front desk', what: 'Customer: “mera order kab aayega? #1043”', kind: 'in' },
  { t: '0.41s', who: 'Front desk', what: 'Intent: order_status · language: Hinglish · handoff → Order tracker', kind: 'think' },
  { t: '0.44s', who: 'Order tracker', what: 'tool verify_customer(order=1043, email=•••@gmail.com) → ok', kind: 'tool' },
  { t: '0.92s', who: 'Order tracker', what: 'tool shopify.get_order(1043) → shipped · Delhivery · ETA Thu', kind: 'tool' },
  { t: '1.63s', who: 'Order tracker', what: 'Reply drafted (Hinglish, calm tone per design.md)', kind: 'think' },
  { t: '1.88s', who: 'Front desk', what: '“Aapka order ship ho gaya hai, Thursday tak pahunch jayega.”', kind: 'out' },
]

/* ---------------- Models ---------------- */

export const MODELS = [
  { id: 'auto', name: 'Auto', by: 'Architect', note: 'Picks per task. Best price for the quality.', tag: 'Recommended' },
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', by: 'Anthropic', note: 'Best for planning and big changes' },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', by: 'Anthropic', note: 'Fast, strong all-rounder' },
  { id: 'gpt', name: 'GPT-5', by: 'OpenAI', note: 'Strong reasoning' },
  { id: 'gemini', name: 'Gemini 2.5 Pro', by: 'Google', note: 'Huge context, good with long docs' },
  { id: 'haiku', name: 'Claude Haiku 4.5', by: 'Anthropic', note: 'Cheapest. Small edits and summaries' },
  { id: 'llama', name: 'Llama 4 Maverick', by: 'Meta · open source', note: 'Self-hostable, for private data' },
]

export const ROUTING = [
  { task: 'Planning & blueprint', model: 'Claude Opus 5.5', why: 'Gets the big decisions right once' },
  { task: 'Writing code', model: 'Claude Sonnet 5', why: 'Fast and accurate on multi-file edits' },
  { task: 'Small edits & fixes', model: 'Claude Haiku 4.5', why: '10x cheaper, same result on one-liners' },
  { task: 'Your app’s agents', model: 'GPT-5 mini', why: 'Your choice. Change any time, nothing breaks' },
  { task: 'Summaries & titles', model: 'Gemini 2.5 Flash', why: 'Cheapest for throwaway text' },
]

/* ---------------- Deploys ---------------- */

export const DEPLOYS = [
  { id: 'd3', when: 'Just now', rev: 'F', status: 'live', url: 'glow-support.architect.app' },
  { id: 'd2', when: 'Yesterday, 6:12 pm', rev: 'C', status: 'previous', url: 'glow-support.architect.app' },
  { id: 'd1', when: 'Mon, 11:40 am', rev: 'B', status: 'previous', url: 'glow-support.architect.app' },
]
