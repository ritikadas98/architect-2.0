import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStore } from '../../lib/store'
import { FILE_TREE, TERMINAL_LINES, TRACE } from '../../data/demo'
import { copyText, useWS } from './wsState'
import { snippetFor } from './wsData'

export function CodeLines({ code }: { code: string }) {
  const lines = code.split('\n')
  return (
    <div className="ws-code mono" role="region" aria-label="Code">
      {lines.map((l, i) => {
        const kind = l.startsWith('+') ? 'add' : l.startsWith('-') ? 'del' : ''
        return (
          <div key={i} className={'ws-line' + (kind ? ' is-' + kind : '')}>
            <span className="ws-ln">{i + 1}</span>
            <span className="ws-sign">{kind === 'add' ? '+' : kind === 'del' ? '−' : ' '}</span>
            <span className="ws-src">{kind ? l.slice(1) : l}</span>
          </div>
        )
      })}
    </div>
  )
}

const TERM_REPLIES: Record<string, string[]> = {
  help: ['commands: ls, architect status, architect logs, git log, clear'],
  ls: ['app/  agents/  lib/  design.md  architect.json  .architect/'],
  'architect status': ['● preview  running · glow-support.archpreview.app', '● agents   3 healthy · p50 1.9s', '● github   ' + 'see the GitHub button up top'],
  'architect logs': ['  POST /api/chat 200 · 1.7s · desk → orders', '  POST /api/refund 202 · queued for owner (₹2,400 > ₹1,500)'],
  'git log': ['a91f2c3 architect: test pass, 14 of 14 flows (Rev F)', '4be07d1 architect: fix chat scroll, free (Rev E)', '19c3aa0 architect: team inbox and refund approvals (Rev D)'],
}

function Terminal() {
  const [lines, setLines] = useState<string[]>(TERMINAL_LINES)
  const [cmd, setCmd] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const p = end.current?.parentElement
    if (p) p.scrollTop = p.scrollHeight
  }, [lines])
  return (
    <div className="ws-term mono" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement | null)?.focus()}>
      {lines.map((l, i) => (
        <div key={i} className={l.startsWith('✓') ? 'is-ok' : l.startsWith('$') ? 'is-cmd' : ''}>{l || ' '}</div>
      ))}
      <form
        className="row"
        style={{ gap: 6 }}
        onSubmit={(e) => {
          e.preventDefault()
          const c = cmd.trim()
          setCmd('')
          if (!c) return
          if (c === 'clear') return setLines([])
          setLines((ls) => [...ls, '$ ' + c, ...(TERM_REPLIES[c] || [`${c.split(' ')[0]}: not available in the preview sandbox. Try "help".`])])
        }}
      >
        <span className="is-cmd">$</span>
        <input value={cmd} onChange={(e) => setCmd(e.target.value)} aria-label="Terminal command" spellCheck={false} autoComplete="off" placeholder="try: architect status" />
      </form>
      <div ref={end} />
    </div>
  )
}

function Trace() {
  return (
    <ol className="ws-trace">
      {TRACE.map((t, i) => (
        <li key={i} className={'is-' + t.kind}>
          <span className="mono ws-trace-t">{t.t}</span>
          <span className="ws-trace-dot" />
          <div>
            <div className="label">{t.who} · {t.kind}</div>
            <div className={t.kind === 'tool' ? 'mono' : ''} style={{ fontSize: 12.5 }}>{t.what}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function OwnTools() {
  const { toast } = useStore()
  const cli = 'npx architect link glow-support'
  const mcp = '{"mcpServers":{"architect":{"command":"npx","args":["architect","mcp"]}}}'
  const copy = async (t: string, msg: string) => {
    const ok = await copyText(t)
    toast(ok ? msg : 'Couldn’t reach your clipboard. Select the text and copy it.')
  }
  return (
    <div className="card col" style={{ gap: 10 }}>
      <div className="row between wrap">
        <h4 style={{ fontSize: 14 }}>Work from your own tools</h4>
        <span className="muted" style={{ fontSize: 12 }}>Same project. Edits sync both ways.</span>
      </div>
      <div className="label">Link this folder</div>
      <button className="ws-snip mono" onClick={() => copy(cli, 'Copied. Run it in your project folder.')} title="Copy">
        <span>{cli}</span>
        <Icon name="copy" size={13} />
      </button>
      <div className="label">MCP config for Claude Code or Cursor</div>
      <button className="ws-snip mono" onClick={() => copy(mcp, 'Copied. Paste it into your MCP settings.')} title="Copy">
        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', textAlign: 'left' }}>{mcp}</span>
        <Icon name="copy" size={13} />
      </button>
      <div className="row wrap" style={{ gap: 6 }}>
        <button className="btn btn-sm btn-line" onClick={() => copy('cursor://architect/open?project=glow-support', 'Link copied. Cursor opens it if it’s installed.')}>
          <Icon name="external" size={13} /> Open in Cursor
        </button>
        <button className="btn btn-sm btn-line" onClick={() => copy('git clone https://github.com/glow-and-co/glow-support.git', 'Clone command copied.')}>
          <Icon name="download" size={13} /> Clone
        </button>
      </div>
    </div>
  )
}

export default function CodeTab() {
  const { mode, setMode } = useStore()
  const { revs } = useWS()
  const [file, setFile] = useState('components/ChatWindow.tsx')
  if (mode !== 'dev')
    return (
      <div className="page">
        <div className="card dashed col" style={{ alignItems: 'center', textAlign: 'center', padding: 40, gap: 10, maxWidth: 520, margin: '40px auto' }}>
          <Icon name="code" size={22} />
          <h3 style={{ fontSize: 18 }}>The code lives in Developer view</h3>
          <p className="muted">Simple view keeps things in plain words. Switch if you want files, diffs and a terminal. Nothing about your app changes.</p>
          <button className="btn btn-primary" onClick={() => setMode('dev')}>
            <Icon name="code" size={14} /> Switch to Developer
          </button>
        </div>
      </div>
    )
  const fRev = revs.find((r) => r.rev === 'E')
  const last = FILE_TREE.find((f) => f.path === file && (f.changed || f.added)) ? fRev : revs.find((r) => r.rev === 'D')
  return (
    <div className="ws-codetab">
      <aside className="ws-tree" aria-label="Files">
        <div className="label" style={{ padding: '10px 12px 6px' }}>glow-support</div>
        {FILE_TREE.map((f) => {
          const name = f.dir || f.depth === 0 ? f.path.split('/').pop() : f.path.split('/').slice(1).join('/')
          if (f.dir)
            return (
              <div key={f.path} className="ws-tree-row is-dir" style={{ paddingLeft: 12 + f.depth * 14 }}>
                <Icon name="folder" size={13} /> {name}
              </div>
            )
          return (
            <button key={f.path} className={'ws-tree-row' + (file === f.path ? ' is-on' : '')} style={{ paddingLeft: 12 + f.depth * 14 }} onClick={() => setFile(f.path)}>
              <Icon name="file" size={13} />
              <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
              {f.changed && <span className="badge badge-amber" title="Changed in the last revision">M</span>}
              {f.added && <span className="badge badge-green" title="Added in the last revision">A</span>}
            </button>
          )
        })}
      </aside>
      <div className="ws-codemain">
        <div className="ws-codehead">
          <span className="mono" style={{ fontSize: 12.5 }}>{file}</span>
          <span className="muted" style={{ fontSize: 12 }}>
            Last change: <span className="ws-revtag">Rev {last?.rev}</span> {last?.title}
          </span>
        </div>
        <div className="ws-codebody">
          <CodeLines code={snippetFor(file)} />
        </div>
        <div className="ws-bottom">
          <section className="ws-bottom-pane" aria-label="Terminal">
            <div className="ws-pane-h label"><Icon name="terminal" size={12} /> Terminal</div>
            <Terminal />
          </section>
          <section className="ws-bottom-pane" aria-label="Agent trace">
            <div className="ws-pane-h label"><Icon name="agent" size={12} /> Agent trace · last chat</div>
            <div className="ws-bottom-body"><Trace /></div>
          </section>
        </div>
      </div>
      <aside className="ws-coderight">
        <OwnTools />
      </aside>
    </div>
  )
}
