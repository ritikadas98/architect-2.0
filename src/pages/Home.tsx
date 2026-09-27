import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Icon } from '../components/Icon'
import { Modal } from '../components/ui'
import { useStore, type Project, type Stage } from '../lib/store'
import { SAMPLE_PROMPTS } from '../data/demo'

const STAGE: Record<Stage, { label: string; cls: string; to: (id: string) => string }> = {
  brief: { label: 'Brief', cls: 'badge-red', to: (id) => `/p/${id}/brief` },
  blueprint: { label: 'Blueprint', cls: 'badge-red', to: (id) => `/p/${id}/blueprint` },
  building: { label: 'Building', cls: 'badge-amber', to: (id) => `/p/${id}?tab=build` },
  ready: { label: 'Ready to inspect', cls: 'badge-blue', to: (id) => `/p/${id}?tab=build` },
  live: { label: 'Live', cls: 'badge-green', to: (id) => `/p/${id}?tab=build` },
}

function ago(t: number) {
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return `${Math.round(s / 86400)} d ago`
}

export default function Home() {
  const { user, projects, createProject, deleteProject, toast } = useStore()
  const nav = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [refs, setRefs] = useState<{ name: string; url?: string }[]>([])
  const [linkOpen, setLinkOpen] = useState(false)
  const [link, setLink] = useState('')
  const [confirmDel, setConfirmDel] = useState<Project | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const first = (user?.name || 'there').split(' ')[0]

  useEffect(() => {
    try {
      const p = sessionStorage.getItem('a2:pending-prompt')
      if (p) {
        setPrompt(p)
        sessionStorage.removeItem('a2:pending-prompt')
      }
    } catch {
      /* ignore */
    }
  }, [])

  const start = () => {
    const text = prompt.trim() || SAMPLE_PROMPTS[0].prompt
    const p = createProject({ prompt: text })
    nav(`/p/${p.id}/brief`)
  }

  const onFiles = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files)
      .slice(0, 6)
      .map((f) => ({ name: f.name, url: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined }))
    setRefs((r) => [...r, ...next].slice(0, 6))
  }

  return (
    <AppShell>
      <style>{css}</style>
      <main className="page hm">
        <section className="hm-hero">
          <span className="label">New project</span>
          <h1>What are we building, {first}?</h1>

          <div
            className="hm-prompt sheet-ink"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              onFiles(e.dataTransfer.files)
            }}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe it like you'd tell a friend. Drop screenshots of apps or sites you like."
              aria-label="Describe your app"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) start()
              }}
            />
            {refs.length > 0 && (
              <div className="row wrap" style={{ gap: 8 }}>
                {refs.map((r, i) => (
                  <span key={i} className="hm-ref">
                    {r.url ? <img src={r.url} alt="" /> : <Icon name={r.name.startsWith('http') ? 'link' : 'file'} size={14} />}
                    <span className="hm-ref-name">{r.name}</span>
                    <button aria-label={'Remove ' + r.name} onClick={() => setRefs((x) => x.filter((_, j) => j !== i))}>
                      <Icon name="x" size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="row between wrap" style={{ gap: 10 }}>
              <div className="row wrap" style={{ gap: 6 }}>
                <input ref={fileRef} type="file" accept="image/*,.pdf" multiple hidden onChange={(e) => onFiles(e.target.files)} />
                <button className="btn btn-line btn-sm" onClick={() => fileRef.current?.click()}>
                  <Icon name="image" size={14} /> Screenshots
                </button>
                <button className="btn btn-line btn-sm" onClick={() => setLinkOpen(true)}>
                  <Icon name="link" size={14} /> A site or Figma link
                </button>
                <Link to="/import" className="btn btn-line btn-sm">
                  <Icon name="github" size={14} /> Import existing
                </Link>
              </div>
              <button className="btn btn-primary" onClick={start}>
                Start with a brief <Icon name="arrow" size={14} />
              </button>
            </div>
          </div>
          <p className="hm-hint">
            <Icon name="info" size={13} /> Nothing gets built yet. First I'll tell you what I understood, and ask a few
            questions.
          </p>

          <div className="row wrap" style={{ gap: 6 }}>
            <span className="muted" style={{ fontSize: 12.5 }}>Starting points:</span>
            {SAMPLE_PROMPTS.map((s) => (
              <button key={s.label} className="chip" onClick={() => setPrompt(s.prompt)}>
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section className="col" style={{ gap: 14 }}>
          <div className="row between">
            <h2 style={{ fontSize: 20 }}>Your projects</h2>
            <span className="mono muted" style={{ fontSize: 12 }}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="hm-empty">
              <svg width="120" height="70" viewBox="0 0 120 70" aria-hidden="true">
                <rect x="1" y="1" width="118" height="68" fill="none" stroke="var(--rule-strong)" strokeDasharray="4 4" />
                <path d="M20 50 L60 18 L100 50" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" />
                <path d="M34 39 H86" stroke="var(--red)" strokeWidth="1.5" />
              </svg>
              <div style={{ fontWeight: 700 }}>An empty drawing board.</div>
              <div className="muted" style={{ fontSize: 13.5 }}>
                Type an idea above. Or pick a starting point and see the whole flow.
              </div>
            </div>
          ) : (
            <div className="hm-grid">
              {projects.map((p) => {
                const st = STAGE[p.stage]
                return (
                  <article key={p.id} className="hm-card sheet">
                    <Link to={st.to(p.id)} className="hm-card-link" aria-label={'Open ' + p.name} />
                    <Thumb stage={p.stage} />
                    <div className="hm-card-body">
                      <div className="row between" style={{ gap: 8 }}>
                        <span className={'badge ' + st.cls}>{st.label}</span>
                        <button
                          className="btn btn-ghost btn-icon btn-sm hm-del"
                          aria-label={'Delete ' + p.name}
                          onClick={() => setConfirmDel(p)}
                        >
                          <Icon name="x" size={13} />
                        </button>
                      </div>
                      <div className="hm-card-title">{p.name}</div>
                      <div className="hm-card-prompt">{p.prompt}</div>
                      <div className="row between muted" style={{ fontSize: 12, marginTop: 'auto' }}>
                        <span>{ago(p.updatedAt)}</span>
                        {p.imported ? (
                          <span className="row" style={{ gap: 4 }}>
                            <Icon name="github" size={12} /> imported
                          </span>
                        ) : p.liveUrl ? (
                          <span className="mono" style={{ fontSize: 11 }}>{p.liveUrl}</span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <p className="hm-proto">
          <span className="badge">Prototype</span> Every new project walks through the same sample build, a support desk
          for a skincare brand, so each step has something real in it. Your prompt is kept on the project.
        </p>
      </main>

      {linkOpen && (
        <Modal
          title="Add a reference link"
          sub="A site you like, a competitor, or a Figma file. I'll read the look, not copy the content."
          onClose={() => setLinkOpen(false)}
          foot={
            <>
              <button className="btn btn-ghost" onClick={() => setLinkOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!link.trim()}
                onClick={() => {
                  setRefs((r) => [...r, { name: link.trim() }])
                  setLink('')
                  setLinkOpen(false)
                }}
              >
                Add link
              </button>
            </>
          }
        >
          <label className="field">
            <span>Link</span>
            <input className="input" autoFocus value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
          </label>
        </Modal>
      )}

      {confirmDel && (
        <Modal
          title={`Delete ${confirmDel.name}?`}
          sub="The project and its revisions go. Anything already on GitHub stays on GitHub."
          onClose={() => setConfirmDel(null)}
          foot={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>
                Keep it
              </button>
              <button
                className="btn btn-red"
                onClick={() => {
                  deleteProject(confirmDel.id)
                  setConfirmDel(null)
                  toast('Deleted.')
                }}
              >
                Delete project
              </button>
            </>
          }
        >
          <p className="muted">This can't be undone.</p>
        </Modal>
      )}
    </AppShell>
  )
}

/** A tiny drawing of where the project is: sketch lines early, a filled page once built. */
function Thumb({ stage }: { stage: Stage }) {
  const built = stage === 'ready' || stage === 'live'
  return (
    <div className="hm-thumb" style={{ background: built ? '#F4EDE2' : undefined }}>
      {built ? (
        <svg viewBox="0 0 200 110" width="100%" height="100%" aria-hidden="true">
          <text x="14" y="30" fontFamily="Cormorant Garamond, serif" fontSize="18" fill="#2E2A24">
            Glow & Co.
          </text>
          <rect x="14" y="42" width="96" height="5" rx="2" fill="#2E2A24" opacity=".25" />
          <rect x="14" y="52" width="70" height="5" rx="2" fill="#2E2A24" opacity=".15" />
          <rect x="14" y="70" width="58" height="16" rx="8" fill="#7C8B6F" />
          <rect x="128" y="30" width="58" height="64" rx="6" fill="#fff" stroke="#2E2A24" strokeOpacity=".15" />
          <rect x="134" y="38" width="34" height="8" rx="4" fill="#7C8B6F" opacity=".35" />
          <rect x="146" y="52" width="34" height="8" rx="4" fill="#2E2A24" opacity=".15" />
          {stage === 'live' && <circle cx="186" cy="14" r="5" fill="#2F7A4B" />}
        </svg>
      ) : (
        <svg viewBox="0 0 200 110" width="100%" height="100%" aria-hidden="true">
          <rect x="14" y="14" width="172" height="82" fill="none" stroke="var(--rule-strong)" strokeDasharray="3 3" />
          <path d="M28 34 H110 M28 46 H90" stroke="var(--ink-4)" strokeWidth="2" />
          <rect x="28" y="62" width="44" height="16" fill="none" stroke="var(--red)" strokeDasharray="3 2" />
          <text x="124" y="80" fontFamily="Architects Daughter, cursive" fontSize="12" fill="var(--red-text)">
            {stage === 'brief' ? '5 questions?' : 'stamp me'}
          </text>
        </svg>
      )}
    </div>
  )
}

const css = `
.hm { display: grid; gap: 44px; }
.hm-hero { display: grid; gap: 14px; max-width: 820px; }
.hm-hero h1 { font-size: clamp(28px, 4.6vw, 44px); font-stretch: 120%; letter-spacing: -0.02em; }
.hm-prompt { display: grid; gap: 12px; padding: 14px; box-shadow: var(--shadow-hard); }
.hm-prompt textarea { border: 0; outline: none; resize: none; background: transparent; font-size: 16px; line-height: 1.5; min-height: 76px; }
.hm-hint { display: flex; gap: 6px; align-items: center; font-size: 12.5px; color: var(--ink-3); }
.hm-ref { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 3px 6px 3px 3px; border: 1px solid var(--rule-strong); border-radius: 4px; background: var(--sheet-2); font-size: 12px; max-width: 220px; }
.hm-ref img { width: 28px; height: 28px; object-fit: cover; border-radius: 2px; }
.hm-ref > svg { margin-left: 5px; }
.hm-ref-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hm-ref button { border: 0; background: none; padding: 2px; color: var(--ink-3); display: grid; }
.hm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
.hm-card { position: relative; display: flex; flex-direction: column; overflow: hidden; transition: border-color .15s, box-shadow .15s; min-height: 280px; }
.hm-card:hover { border-color: var(--ink); box-shadow: var(--shadow-hard); }
.hm-card-link { position: absolute; inset: 0; z-index: 1; }
.hm-del { position: relative; z-index: 2; opacity: .5; }
.hm-card:hover .hm-del { opacity: 1; }
.hm-thumb { height: 128px; border-bottom: 1px solid var(--rule); background: var(--sheet-2); }
.hm-card-body { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px 14px; flex: 1; }
.hm-card-title { font-weight: 750; font-size: 16px; font-stretch: 110%; }
.hm-card-prompt { color: var(--ink-3); font-size: 13px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hm-empty { display: grid; justify-items: center; gap: 8px; text-align: center; padding: 40px 16px; border: 1.5px dashed var(--rule-strong); border-radius: var(--r-md); }
.hm-proto { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; color: var(--ink-3); max-width: 720px; }
`
