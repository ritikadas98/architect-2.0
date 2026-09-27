#!/usr/bin/env python3
"""Generates docs/architecture.svg. Hand-placed coordinates, one helper per primitive."""
from xml.sax.saxutils import escape

W, H = 1800, 1200
PAPER, INK, INK2, INK3, RULE = '#F3F0E8', '#16150F', '#47453D', '#7D7A70', '#BFB9A8'
RED, BLUE, SHEET = '#E0482A', '#2350C8', '#FBFAF6'
SANS = 'Archivo, Helvetica, Arial, sans-serif'
MONO = "'JetBrains Mono', Menlo, Consolas, monospace"

out = []


def add(s):
    out.append(s)


def text(x, y, s, size=12, weight=400, fill=INK, family=SANS, anchor='start', ls=None, italic=False):
    extra = f' letter-spacing="{ls}"' if ls else ''
    if italic:
        extra += ' font-style="italic"'
    add(f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
        f'fill="{fill}" text-anchor="{anchor}"{extra}>{escape(s)}</text>')


def mono(x, y, s, size=10.5, fill=INK2, anchor='start', weight=400):
    text(x, y, s, size=size, family=MONO, fill=fill, anchor=anchor, weight=weight)


def zone(x, y, w, h, num, title, note=None):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="{INK}" stroke-width="1" '
        f'stroke-dasharray="6 4"/>')
    # tab label
    lab = f'{num}  {title}'
    tw = len(lab) * 7.1 + 16
    add(f'<rect x="{x}" y="{y - 9}" width="{tw}" height="18" fill="{INK}"/>')
    mono(x + 8, y + 4, lab, size=10.5, fill=PAPER, weight=700)
    if note:
        mono(x + w - 8, y + 4 + 18, note, size=9.5, fill=INK3, anchor='end')


def box(x, y, w, h, title, lines=(), sub=None, fill=SHEET, stroke=INK, sw=1.4, title_size=13.5, dashed=False,
        tcolor=INK):
    dash = ' stroke-dasharray="4 3"' if dashed else ''
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{dash}/>')
    ty = y + 19
    text(x + 10, ty, title, size=title_size, weight=700, fill=tcolor)
    cy = ty
    if sub:
        cy += 15
        mono(x + 10, cy, sub, size=10, fill=RED if sub.startswith('*') else INK3)
    for ln in lines:
        cy += 14
        mono(x + 10, cy, ln, size=10)


def store(x, y, w, h, title, lines):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{SHEET}" stroke="{BLUE}" stroke-width="1.6"/>')
    # cylinder cap hint
    add(f'<path d="M{x} {y + 10} Q{x + w / 2} {y + 20} {x + w} {y + 10}" fill="none" stroke="{BLUE}" stroke-width="1"/>')
    text(x + 8, y + 36, title, size=12.5, weight=700, fill=BLUE)
    cy = y + 36
    for ln in lines:
        cy += 13.5
        mono(x + 8, cy, ln, size=9.5, fill=INK2)


def chip(x, y, w, label, color=INK):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="22" rx="2" fill="{PAPER}" stroke="{color}" stroke-width="1"/>')
    mono(x + w / 2, y + 15, label, size=10, fill=color, anchor='middle', weight=700)


def path(pts, color=INK, width=1.4, head='end', dashed=False, marker_color=None):
    d = 'M' + ' L'.join(f'{a} {b}' for a, b in pts)
    mc = {'#E0482A': 'r', '#16150F': 'k', '#2350C8': 'b'}[color]
    m = ''
    if head in ('end', 'both'):
        m += f' marker-end="url(#a{mc})"'
    if head in ('start', 'both'):
        m += f' marker-start="url(#s{mc})"'
    dash = ' stroke-dasharray="5 4"' if dashed else ''
    add(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}"{dash}{m}/>')


def num(x, y, n):
    add(f'<circle cx="{x}" cy="{y}" r="9.5" fill="{RED}" stroke="{PAPER}" stroke-width="2"/>')
    text(x, y + 4, str(n), size=11, weight=800, fill='#FFFFFF', anchor='middle')


def lbl(x, y, s, color=INK2, anchor='start', size=9.5):
    # label with paper knock-out so it stays legible over lines
    w = len(s) * size * 0.61 + 6
    x0 = x - 3 if anchor == 'start' else (x - w / 2 if anchor == 'middle' else x - w + 3)
    add(f'<rect x="{x0}" y="{y - size}" width="{w}" height="{size + 4}" fill="{PAPER}"/>')
    mono(x, y, s, size=size, fill=color, anchor=anchor)


# ---------------------------------------------------------------- document
add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
add('<title>Architect 2.0 system architecture</title>')
add('<defs>')
for key, col in (('r', RED), ('k', INK), ('b', BLUE)):
    add(f'<marker id="a{key}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
        f'<path d="M0 0 L10 5 L0 10 z" fill="{col}"/></marker>')
    add(f'<marker id="s{key}" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
        f'<path d="M10 0 L0 5 L10 10 z" fill="{col}"/></marker>')
add('<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">'
    '<path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(22,21,15,0.06)" stroke-width="1"/></pattern>')
add('</defs>')
add(f'<rect width="{W}" height="{H}" fill="{PAPER}"/>')
add(f'<rect width="{W}" height="{H}" fill="url(#grid)"/>')
add(f'<rect x="12" y="12" width="{W - 24}" height="{H - 24}" fill="none" stroke="{INK}" stroke-width="2"/>')

# title
text(30, 50, 'ARCHITECT 2.0 — SYSTEM ARCHITECTURE', size=22, weight=800, ls='0.02em')
mono(30, 70, 'Prompt → live app. Red = critical path, numbered as in ARCHITECTURE.md.', size=10.5, fill=INK3)

# ---------------------------------------------------------------- zones
zone(30, 100, 250, 520, '01', 'CLIENTS')
zone(310, 100, 250, 520, '02', 'EDGE')
zone(590, 100, 620, 590, '03', 'CONTROL PLANE', note='multi-region · stateless')
zone(1240, 100, 530, 460, '04', 'DATA PLANE CELL', note='asia-south1 · us-east1')
zone(1240, 590, 530, 240, '05', 'MODEL GATEWAY')
zone(30, 650, 530, 280, '06', 'USER APP HOSTING')
zone(590, 710, 620, 220, '07', 'DATA')

# ---------------------------------------------------------------- clients
box(50, 140, 210, 240, 'Web app', [], sub='builder UI · React')
chip(60, 180, 90, 'SIMPLE', INK)
chip(158, 180, 92, 'DEVELOPER', INK)
for i, ln in enumerate(['one project, two views,', 'one event log', '', 'click-to-edit overlay', 'in the preview iframe', '', 'EventSource (SSE)', 'WebSocket (terminal)']):
    mono(60, 224 + i * 14, ln, size=10, fill=INK3 if i < 2 else INK2)
box(50, 410, 210, 80, 'CLI / MCP server', ['Claude Code · Cursor', 'OAuth device flow'], sub='architect link')
box(50, 520, 210, 80, 'GitHub', ['user repos', 'push / PR webhooks'], sub='external')

# ---------------------------------------------------------------- edge
box(330, 140, 210, 50, 'CDN / WAF', sub='Cloudflare · static web app', title_size=12.5)
box(330, 210, 210, 80, 'Preview proxy', ['host → route (Redis)', '→ cell tunnel · wake'], sub='*.archpreview.app')
box(330, 310, 210, 90, 'API gateway', ['authN · rate limits', 'SSE fan-out', 'admission control'], sub='api.architect.new')

# ---------------------------------------------------------------- control plane
box(610, 140, 180, 80, 'Auth & tenancy', ['orgs · roles', 'OIDC · SSO'])
box(810, 140, 180, 80, 'Project service', ['projects · turns', 'design.md · skills'])
box(1010, 140, 180, 80, 'Billing & metering', ['estimate · ledger', 'cause: user | agent'])
box(610, 240, 580, 110, 'Build orchestrator · Temporal', [
    'BuildSession workflow per turn · child workflow per sub-agent',
    'signals: approve · answer · cancel · user_edit   ·   durable retries',
    'task queue per cell  ·  writes every step to the event log',
], sub='durable state machine for a build')
box(610, 370, 180, 85, 'Inspection service', ['Semgrep · LLM review', 'runtime probes'])
box(610, 475, 180, 85, 'GitHub App service', ['installation tokens', 'sync · PR · conflicts'])
box(810, 370, 380, 190, 'Agent harness', [], sub='runs OUTSIDE the sandbox · AI SDK loop')
chip(822, 412, 82, 'PLANNER')
chip(912, 412, 82, 'CODER')
chip(1002, 412, 82, 'TESTER')
chip(1092, 412, 88, 'INSPECTOR')
mono(822, 456, 'tools: read · search_replace · write · shell', size=10)
mono(822, 470, '       grep · screenshot · console_logs', size=10)
mono(822, 488, 'context: repo map · design.md · SKILL.md', size=10)
mono(822, 506, 'self-heal: deterministic fix → small model', size=10)
mono(822, 520, '           → main model (3 tries / error)', size=10)
mono(822, 540, 'every step: model, tokens, cause, cost', size=10, fill=INK3)
box(610, 580, 180, 90, 'Deploy service', ['immutable builds', 'promote · rollback', 'domains · secrets'])
box(810, 580, 180, 90, 'Skills & MCP registry', ['SKILL.md bundles', 'embedding match', 'trust review'])
box(1010, 580, 180, 90, 'Observability', ['OTel GenAI spans', 'Langfuse · SLOs', 'cost per session'])

# small internal arrows (ink)
path([(900, 580), (900, 562)], INK, 1.2)
lbl(906, 575, 'SKILL.md', size=8.5)
path([(1100, 562), (1100, 580)], INK, 1.2)
lbl(1106, 575, 'spans', size=8.5)
path([(1100, 350), (1100, 368)], INK, 1.2)
lbl(1106, 363, 'activities', size=8.5)
path([(1100, 222), (1100, 240)], INK, 1.2, head='start')
lbl(1106, 235, 'meter', size=8.5)

# ---------------------------------------------------------------- data plane cell
box(1260, 140, 330, 400, 'Sandbox fleet', [], sub='SandboxProvider: E2B/Modal → GKE+gVisor', fill='none', sw=1.2)
box(1280, 195, 290, 260, 'Sandbox · microVM, one per project', [], fill=SHEET, title_size=12)
box(1295, 225, 125, 52, 'Agent sidecar', [':8080 /invoke'], title_size=11.5, fill=PAPER, sw=1)
box(1430, 225, 125, 52, 'Dev server', [':3000 · HMR'], title_size=11.5, fill=PAPER, sw=1)
add(f'<rect x="1295" y="287" width="260" height="30" fill="{PAPER}" stroke="{INK}" stroke-width="1"/>')
mono(1305, 306, '/workspace · git · design.md · .env*', size=10)
mono(1295, 336, 'warm → running → paused → hibernated', size=9.5, fill=INK3)
mono(1295, 350, 'snapshots → object storage', size=9.5, fill=BLUE)
box(1295, 372, 260, 70, 'In-sandbox daemon', ['fs · exec · logs · screenshots', 'mTLS tunnel to harness'], title_size=11.5,
    fill=PAPER, sw=1)
# warm pool
add(f'<rect x="1280" y="470" width="290" height="58" fill="none" stroke="{INK}" stroke-width="1" stroke-dasharray="4 3"/>')
text(1290, 488, 'Warm pool', size=11.5, weight=700)
mono(1290, 502, 'pre-booted per template', size=9.5, fill=INK3)
mono(1290, 516, 'claim = seconds, not minutes', size=9.5, fill=INK3)
for i in range(6):
    add(f'<rect x="{1470 + i * 15}" y="{484}" width="11" height="11" fill="{PAPER}" stroke="{INK}" stroke-width="1"/>')
for i in range(6):
    add(f'<rect x="{1470 + i * 15}" y="{500}" width="11" height="11" fill="{PAPER}" stroke="{INK}" stroke-width="1"/>')
path([(1425, 470), (1425, 457)], INK, 1.1)

box(1620, 140, 135, 110, 'Secrets vault', ['real keys live', 'here only', '(Shopify, Stripe)'], title_size=12)
box(1620, 290, 135, 130, 'Egress proxy', ['allowlist hosts', 'placeholder →', 'real secret', 'npm/pip mirror'], title_size=12)
path([(1687, 250), (1687, 288)], INK, 1.2)
lbl(1692, 274, 'inject', size=8.5)
box(1620, 450, 135, 78, 'Internet', ['npm · PyPI', 'Shopify · APIs'], dashed=True, fill='none', title_size=12)
path([(1687, 420), (1687, 448)], INK, 1.2)

# ---------------------------------------------------------------- model gateway
box(1260, 630, 210, 180, 'LiteLLM proxy', ['virtual keys · budgets', 'routing by task', 'fallback chains', 'prompt caching', 'BYOK keys', 'spend logs'],
    sub='one OpenAI-style API')
provs = ['Anthropic', 'OpenAI', 'Google', 'Open-source · vLLM']
for i, p in enumerate(provs):
    y = 632 + i * 45
    add(f'<rect x="1545" y="{y}" width="205" height="34" fill="{SHEET}" stroke="{INK}" stroke-width="1.2"/>')
    text(1557, y + 22, p, size=12, weight=600)
    path([(1470, 720), (1508, 720), (1508, y + 17), (1543, y + 17)], INK, 1.1)

# cells note
add(f'<rect x="1240" y="850" width="530" height="80" fill="none" stroke="{INK3}" stroke-width="1" stroke-dasharray="3 4"/>')
text(1255, 874, 'Cell N+1 …', size=12.5, weight=700, fill=INK3)
mono(1255, 892, 'Same stack per cell: sandbox fleet, egress proxy, preview', size=9.5, fill=INK3)
mono(1255, 906, 'tunnel, Redis. Each project has a home cell. Add capacity', size=9.5, fill=INK3)
mono(1255, 920, 'by adding cells. One cell failing takes out only its share.', size=9.5, fill=INK3)

# ---------------------------------------------------------------- user app hosting
box(50, 690, 180, 60, 'End users', ['browser · phone'], sub=None)
box(50, 800, 180, 110, 'Custom domains', ['Cloudflare for SaaS', 'auto TLS', 'glow-support.', '  architect.app'])
box(300, 690, 240, 75, 'Edge frontend', ['Workers for Platforms', 'or Vercel · immutable'])
box(300, 790, 240, 120, 'Agent containers', ['Cloud Run / Fly · OCI image', '/invoke /stream /health', 'Lyzr ADK · LangGraph', 'CrewAI · OpenAI Agents SDK', 'egress via proxy sidecar'])
path([(265, 845), (265, 728), (298, 728)], INK, 1.2)
path([(232, 845), (265, 845)], INK, 1.2, head='none')
path([(420, 765), (420, 788)], INK, 1.2)
lbl(426, 781, '/invoke', size=8.5)

# ---------------------------------------------------------------- data stores
stores = [
    ('Postgres', ['projects, users,', 'orgs, skills,', 'deploys, revs', 'RLS per tenant']),
    ('Redis Streams', ['event log (SSE),', 'preview routes,', 'locks, queues']),
    ('Object store', ['sandbox snapshots', 'build artifacts', 'uploads (S3/R2)']),
    ('Vector store', ['pgvector:', 'skill embeddings', 'repo chunks']),
    ('ClickHouse', ['events, traces,', 'metering ledger,', 'cost analytics']),
]
for i, (t, ls) in enumerate(stores):
    x = 610 + i * 118
    store(x, 750, 106, 120, t, ls)
    path([(x + 53, 728), (x + 53, 748)], BLUE, 1.3)
add(f'<path d="M663 728 L1135 728" stroke="{BLUE}" stroke-width="1.3" fill="none"/>')
path([(900, 690), (900, 728)], BLUE, 1.3, head='none')
lbl(906, 722, 'all services read / write', color=BLUE, size=8.5)

# ---------------------------------------------------------------- critical path (red)
# 1 prompt: web -> gateway
path([(260, 330), (328, 330)], RED, 2.2)
num(294, 330, 1)
# SSE back (ink)
path([(328, 372), (262, 372)], INK, 1.3)
lbl(270, 366, 'SSE', size=8.5)
# CLI -> gateway (ink)
path([(260, 450), (435, 450), (435, 402)], INK, 1.3)
lbl(300, 444, 'HTTPS + MCP', size=8.5)
# 2 gateway -> orchestrator
path([(540, 330), (608, 330)], RED, 2.2)
num(575, 330, 2)
# 5 orchestrator -> preview proxy (route)
path([(610, 262), (542, 262)], RED, 2.2)
num(575, 262, 5)
# 8 preview: web iframe -> preview proxy -> top rail -> dev server
path([(260, 250), (328, 250)], RED, 2.2)
num(294, 250, 8)
path([(540, 222), (568, 222), (568, 84), (1602, 84), (1602, 251), (1557, 251)], RED, 2.2)
lbl(640, 80, 'preview: 3000-a7f2.archpreview.app → dev server  (HTTP + HMR WebSocket)', color=RED, size=9.5)
num(1180, 84, 8)
# 4 orchestrator -> sandbox (claim)
path([(1190, 290), (1278, 290)], RED, 2.2)
num(1226, 290, 4)
# 6 harness -> daemon (tool calls)
path([(1190, 392), (1293, 392)], RED, 2.2)
num(1226, 392, 6)
# 9 daemon -> harness (verify + self-heal)
path([(1293, 425), (1192, 425)], RED, 2.2)
num(1226, 425, 9)
# 3 harness -> LiteLLM
path([(1190, 540), (1222, 540), (1222, 700), (1258, 700)], RED, 2.2)
num(1222, 620, 3)
# 7 sandbox -> egress proxy
path([(1570, 355), (1618, 355)], RED, 2.2)
num(1596, 355, 7)
# 10 checkpoint: GitHub App svc <-> GitHub
path([(262, 545), (608, 545)], RED, 2.2, head='both')
lbl(300, 538, 'commit per checkpoint · push webhooks', color=RED, size=8.5)
num(575, 545, 10)
# 11 deploy svc -> hosting
path([(610, 640), (580, 640), (580, 845), (542, 845)], RED, 2.2)
path([(580, 728), (542, 728)], RED, 2.2)
num(580, 685, 11)
# 12 live: end users -> domain
path([(140, 750), (140, 798)], RED, 2.2)
num(140, 773, 12)
# agent containers -> LiteLLM (ink, along bottom rail)
path([(420, 910), (420, 948), (1232, 948), (1232, 790), (1258, 790)], INK, 1.3)
lbl(640, 944, 'app agents call models with a scoped virtual key (metered)', size=8.5)

# ---------------------------------------------------------------- critical path key
kx, ky = 30, 975
add(f'<rect x="{kx}" y="{ky - 15}" width="1180" height="215" fill="{SHEET}" stroke="{INK}" stroke-width="1.2"/>')
mono(kx + 14, ky + 6, 'CRITICAL PATH · PROMPT → LIVE', size=11, fill=INK, weight=700)
steps = [
    'Prompt + references: POST /turns, open SSE stream',
    'Gateway starts a Temporal BuildSession workflow',
    'Brief, plan, estimate via model gateway; wait for approve',
    'Claim a warm sandbox in the project’s home cell',
    'Register preview route {host → sandbox, port}',
    'Coder edits files through the in-sandbox daemon',
    'Installs and API calls leave via the egress proxy',
    'Preview loads through the proxy; HMR on every edit',
    'Tester verifies; agent-caused errors self-heal for free',
    'Checkpoint: git commit + snapshot + DB branch',
    'Inspection gate, then immutable deploy',
    'Live on a custom domain; traced, metered, hibernated',
]
for i, s in enumerate(steps):
    col, row = divmod(i, 6)
    x = kx + 30 + col * 590
    y = ky + 34 + row * 27
    num(x, y - 4, i + 1)
    text(x + 18, y, s, size=12.5, fill=INK)

# ---------------------------------------------------------------- legend
lx, ly = 1240, 960
add(f'<rect x="{lx}" y="{ly}" width="240" height="215" fill="{SHEET}" stroke="{INK}" stroke-width="1.2"/>')
mono(lx + 12, ly + 20, 'LEGEND', size=11, fill=INK, weight=700)
path([(lx + 14, ly + 44), (lx + 64, ly + 44)], RED, 2.2)
num(lx + 39, ly + 44, 1)
mono(lx + 74, ly + 48, 'critical path, step n', size=10)
path([(lx + 14, ly + 72), (lx + 64, ly + 72)], INK, 1.3)
mono(lx + 74, ly + 76, 'control / request flow', size=10)
path([(lx + 14, ly + 100), (lx + 64, ly + 100)], BLUE, 1.3)
mono(lx + 74, ly + 104, 'data read / write', size=10)
add(f'<rect x="{lx + 14}" y="{ly + 118}" width="50" height="22" fill="{SHEET}" stroke="{BLUE}" stroke-width="1.6"/>')
mono(lx + 74, ly + 133, 'data store', size=10)
add(f'<rect x="{lx + 14}" y="{ly + 150}" width="50" height="22" fill="none" stroke="{INK}" stroke-dasharray="4 3"/>')
mono(lx + 74, ly + 165, 'zone / external', size=10)
mono(lx + 12, ly + 200, 'not to scale', size=9.5, fill=INK3)

# ---------------------------------------------------------------- title block
tx, ty, tw, th = 1500, 960, 270, 215
add(f'<rect x="{tx}" y="{ty}" width="{tw}" height="{th}" fill="{SHEET}" stroke="{INK}" stroke-width="2"/>')
rows = [('PROJECT', 'Architect 2.0'), ('DRAWING', 'System architecture'), ('DRAWN BY', 'Ritika Das'),
        ('DATE', '28 Sep 2026')]
for i, (k, v) in enumerate(rows):
    y = ty + i * 43
    if i:
        add(f'<line x1="{tx}" y1="{y}" x2="{tx + tw}" y2="{y}" stroke="{INK}" stroke-width="1"/>')
    mono(tx + 12, y + 16, k, size=9, fill=INK3)
    text(tx + 12, y + 35, v, size=14, weight=700)
y = ty + 4 * 43
add(f'<line x1="{tx}" y1="{y}" x2="{tx + tw}" y2="{y}" stroke="{INK}" stroke-width="1"/>')
add(f'<line x1="{tx + 135}" y1="{y}" x2="{tx + 135}" y2="{ty + th}" stroke="{INK}" stroke-width="1"/>')
mono(tx + 12, y + 16, 'REV', size=9, fill=INK3)
text(tx + 12, y + 36, 'A', size=16, weight=800, fill=RED)
mono(tx + 147, y + 16, 'SHEET', size=9, fill=INK3)
text(tx + 147, y + 36, '1 of 1', size=14, weight=700)

add('</svg>')

import sys
open(sys.argv[1], 'w').write('\n'.join(out))
print('ok')
