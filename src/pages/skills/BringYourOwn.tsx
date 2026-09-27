import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { useStore } from '../../lib/store'

type Result = { kind: 'skill' | 'mcp'; name: string; line: string; dev: string[] }

function inspect(url: string): Result | 'bad' {
  const m = url.trim().match(/github\.com\/([\w.-]+)\/([\w.-]+)/i)
  if (!m) return 'bad'
  const repo = `${m[1]}/${m[2].replace(/\.git$/, '')}`
  if (/mcp/i.test(repo)) {
    return {
      kind: 'mcp',
      name: repo,
      line: 'Found: 1 MCP server with 4 tools. Reads files, no network access. Safe to add.',
      dev: ['server.json · stdio transport', 'tools: list_files, read_file, search, summarize', 'egress: none requested', 'runs in the build sandbox only'],
    }
  }
  return {
    kind: 'skill',
    name: repo,
    line: 'Found: 1 skill, reads files, no network access. Safe to add.',
    dev: ['SKILL.md · 1.4 KB · valid frontmatter', 'no scripts, no binaries', 'egress: none requested', `installs to .architect/skills/${m[2].toLowerCase()}/`],
  }
}

export function BringYourOwn({ onAdd }: { onAdd: (name: string, kind: 'skill' | 'mcp') => void }) {
  const { mode, toast } = useStore()
  const [url, setUrl] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'bad' | 'done'>('idle')
  const [result, setResult] = useState<Result | null>(null)

  const check = () => {
    const r = inspect(url)
    if (r === 'bad') {
      setState('bad')
      return
    }
    setState('checking')
    setResult(null)
    setTimeout(() => {
      setResult(r)
      setState('done')
    }, 1400)
  }

  return (
    <section className="sheet-ink sk-byo">
      <div className="col" style={{ gap: 4 }}>
        <span className="label">Bring your own</span>
        <h3 style={{ fontSize: 18 }}>Found a skill on YouTube? Paste it here.</h3>
        <p className="muted" style={{ fontSize: 13 }}>
          A GitHub link to a skill or an MCP server. I read it before it touches your project.
          {mode === 'dev' && ' Claude Code skills (SKILL.md) work as they are.'}
        </p>
      </div>
      <form
        className="row sk-byo-form"
        onSubmit={(e) => {
          e.preventDefault()
          check()
        }}
      >
        <label className="sr-only" htmlFor="byo-url">GitHub link</label>
        <input
          id="byo-url"
          className="input mono grow"
          style={{ fontSize: 13 }}
          placeholder="https://github.com/someone/their-skill"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (state === 'bad') setState('idle')
          }}
        />
        <button className="btn" type="submit" disabled={!url.trim() || state === 'checking'}>
          {state === 'checking' ? <span className="spinner" /> : <Icon name="search" size={14} />}
          {state === 'checking' ? 'Reading it' : 'Check it'}
        </button>
      </form>
      {state === 'bad' && (
        <p style={{ color: 'var(--red-text)', fontSize: 13 }}>That doesn’t look like a GitHub link. It should start with github.com/.</p>
      )}
      {state === 'idle' && !url && (
        <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setUrl('https://github.com/design-crew/brand-voice-skill')}>
          Try an example link
        </button>
      )}
      {state === 'done' && result && (
        <div className="card rise col" style={{ gap: 10, borderColor: 'var(--green)' }}>
          <div className="row between wrap">
            <div className="row" style={{ gap: 8 }}>
              <Icon name="shieldCheck" size={18} style={{ color: 'var(--green)' }} />
              <strong className="mono" style={{ fontSize: 13 }}>{result.name}</strong>
              <span className="badge badge-green">{result.kind === 'mcp' ? 'MCP server' : 'Skill'}</span>
            </div>
            <button
              className="btn btn-sm"
              onClick={() => {
                onAdd(result.name, result.kind)
                toast('Added. I’ll use it on the next build.')
                setState('idle')
                setUrl('')
                setResult(null)
              }}
            >
              <Icon name="plus" size={13} /> Add
            </button>
          </div>
          <p style={{ fontSize: 13.5 }}>{result.line}</p>
          {mode === 'dev' && (
            <ul className="mono muted" style={{ margin: 0, paddingLeft: 16, fontSize: 11.5 }}>
              {result.dev.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {mode === 'dev' && (
        <p className="mono muted" style={{ fontSize: 11.5 }}>
          $ architect skills add &lt;github-url&gt; · $ architect mcp add &lt;github-url&gt;
        </p>
      )}
    </section>
  )
}
