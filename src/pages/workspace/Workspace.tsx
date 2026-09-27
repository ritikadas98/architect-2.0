import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { ModeToggle, ThemeToggle } from '../../components/ui'
import { useStore, type Project, type Stage } from '../../lib/store'
import { FINDINGS, MODELS } from '../../data/demo'
import AgentsTab from './AgentsTab'
import InspectionTab from './InspectionTab'
import BuildTab from './BuildTab'
import CodeTab from './CodeTab'
import RevisionsTab from './RevisionsTab'
import { GitHubModal, ShareModal } from './Modals'
import { WorkspaceProvider, type Tab } from './wsState'
import './workspace.css'

const STAGE: Record<Stage, { label: string; cls: string }> = {
  brief: { label: 'Brief', cls: 'badge' },
  blueprint: { label: 'Blueprint', cls: 'badge' },
  building: { label: 'Building', cls: 'badge badge-amber' },
  ready: { label: 'Ready to test', cls: 'badge badge-blue' },
  live: { label: 'Live', cls: 'badge badge-green' },
}

function useOutside(ref: React.RefObject<HTMLElement | null>, on: boolean, close: () => void) {
  useEffect(() => {
    if (!on) return
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', h)
    document.addEventListener('keydown', k)
    return () => {
      document.removeEventListener('mousedown', h)
      document.removeEventListener('keydown', k)
    }
  }, [ref, on, close])
}

function ProjectName({ project }: { project: Project }) {
  const { updateProject, toast } = useStore()
  const [editing, setEditing] = useState(false)
  const [v, setV] = useState(project.name)
  const save = () => {
    setEditing(false)
    const n = v.trim()
    if (!n) return setV(project.name)
    if (n !== project.name) {
      updateProject(project.id, { name: n })
      toast('Renamed.')
    }
  }
  if (editing)
    return (
      <input
        className="input ws-name-input"
        value={v}
        autoFocus
        onChange={(e) => setV(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') {
            setV(project.name)
            setEditing(false)
          }
        }}
        aria-label="Project name"
        maxLength={60}
      />
    )
  return (
    <button
      className="ws-name"
      onClick={() => {
        setV(project.name)
        setEditing(true)
      }}
      title="Rename"
    >
      <span>{project.name}</span>
      <Icon name="pencil" size={12} className="ws-name-pen" />
    </button>
  )
}

function ModelPicker({ project }: { project: Project }) {
  const { updateProject, toast } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useOutside(ref, open, close)
  const current = MODELS.find((m) => m.id === project.model) || MODELS[0]
  return (
    <div className="ws-pop-wrap" ref={ref}>
      <button className="chip ws-model" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open} title="Which model builds your app">
        <Icon name="cpu" size={13} />
        <span className="ws-lbl">{current.name}</span>
        <Icon name="chevronDown" size={12} />
      </button>
      {open && (
        <div className="ws-pop ws-pop-right" role="listbox" aria-label="Model">
          <div className="label" style={{ padding: '4px 8px 6px' }}>Model for building</div>
          {MODELS.map((m) => (
            <button
              key={m.id}
              role="option"
              aria-selected={m.id === current.id}
              className={'ws-pop-item' + (m.id === current.id ? ' is-on' : '')}
              onClick={() => {
                setOpen(false)
                if (m.id === current.id) return
                updateProject(project.id, { model: m.id })
                toast(`Switched to ${m.name}. Nothing else changes.`)
              }}
            >
              <span className="row between" style={{ gap: 8 }}>
                <strong>{m.name}</strong>
                {m.tag ? <span className="badge badge-ink">{m.tag}</span> : <span className="muted" style={{ fontSize: 11 }}>{m.by}</span>}
              </span>
              <span className="muted" style={{ fontSize: 12 }}>{m.note}</span>
            </button>
          ))}
          <Link to="/settings/models" className="ws-pop-foot">
            How Auto picks, per task <Icon name="arrow" size={12} />
          </Link>
        </div>
      )}
    </div>
  )
}

function MoreMenu({ onGitHub, onShare }: { onGitHub: () => void; onShare: () => void }) {
  const { theme, setTheme } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useOutside(ref, open, close)
  return (
    <div className="ws-pop-wrap ws-narrow" ref={ref}>
      <button className="btn btn-ghost btn-icon btn-sm" aria-label="More" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="more" />
      </button>
      {open && (
        <div className="ws-pop ws-pop-right">
          <div style={{ padding: 6 }}>
            <ModeToggle />
          </div>
          <button
            className="ws-pop-item"
            onClick={() => {
              setOpen(false)
              onGitHub()
            }}
          >
            <span className="row"><Icon name="github" size={14} /> GitHub</span>
          </button>
          <button
            className="ws-pop-item"
            onClick={() => {
              setOpen(false)
              onShare()
            }}
          >
            <span className="row"><Icon name="users" size={14} /> Share</span>
          </button>
          <button className="ws-pop-item" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <span className="row">
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={14} /> {theme === 'light' ? 'Blueprint theme' : 'Paper theme'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

const TABS: Tab[] = ['build', 'agents', 'inspect', 'revisions', 'code']

export default function Workspace() {
  const { id = '' } = useParams()
  const { getProject, mode } = useStore()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const project = getProject(id)
  const raw = params.get('tab') as Tab | null
  const tab: Tab = raw && TABS.includes(raw) ? raw : 'build'
  const [gh, setGh] = useState(false)
  const [share, setShare] = useState(false)

  const goTab = useCallback((t: Tab) => setParams(t === 'build' ? {} : { tab: t }), [setParams])

  if (!project)
    return (
      <div className="page grid-bg" style={{ minHeight: '100vh' }}>
        <div className="card dashed col" style={{ alignItems: 'center', textAlign: 'center', padding: 40, gap: 10, maxWidth: 480, margin: '80px auto' }}>
          <Icon name="search" size={22} />
          <h3 style={{ fontSize: 18 }}>I can’t find that project</h3>
          <p className="muted">It may have been deleted, or it lives in another account.</p>
          <Link to="/home" className="btn btn-primary">Back to your projects</Link>
        </div>
      </div>
    )

  const open = FINDINGS.filter((f) => (f.level === 'must' || f.level === 'should') && !project.fixed.includes(f.id)).length
  const tabs: { id: Tab; label: string; icon: 'bolt' | 'agent' | 'shieldCheck' | 'history' | 'code'; badge?: number }[] = [
    { id: 'build', label: 'Build', icon: 'bolt' },
    { id: 'agents', label: 'Agents', icon: 'agent' },
    { id: 'inspect', label: 'Inspection', icon: 'shieldCheck', badge: open },
    { id: 'revisions', label: 'Revisions', icon: 'history' },
  ]
  if (mode === 'dev' || tab === 'code') tabs.push({ id: 'code', label: 'Code', icon: 'code' })
  const st = STAGE[project.stage]

  return (
    <WorkspaceProvider project={project} tab={tab} goTab={goTab}>
      <div className="ws-root">
        <header className="ws-top">
          <div className="ws-top-left">
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate('/home')} aria-label="Back to your projects" title="Your projects">
              <Icon name="back" />
            </button>
            <ProjectName project={project} />
            <span className={st.cls + ' ws-stage-badge'}>{st.label}</span>
          </div>
          <nav className="tabs ws-tabs" aria-label="Workspace">
            {tabs.map((t) => (
              <button key={t.id} className={tab === t.id ? 'is-on' : ''} onClick={() => goTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
                <Icon name={t.icon} size={14} />
                {t.label}
                {!!t.badge && (
                  <span className="badge badge-red ws-tabcount" aria-label={`${t.badge} to fix`}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="ws-top-right">
            <span className="ws-wide"><ModeToggle /></span>
            <span className="ws-wide"><ThemeToggle /></span>
            <ModelPicker project={project} />
            <button className="btn btn-sm btn-line ws-wide" onClick={() => setGh(true)} title="GitHub">
              <Icon name="github" size={14} />
              <span className="ws-lbl">{project.github ? project.github.repo.split('/')[1] : 'GitHub'}</span>
              {project.github && <span className="dot" style={{ color: 'var(--blue)' }} />}
            </button>
            <button className="btn btn-sm btn-line ws-wide" onClick={() => setShare(true)} title="Share">
              <Icon name="users" size={14} />
              <span className="ws-lbl">Share</span>
            </button>
            <MoreMenu onGitHub={() => setGh(true)} onShare={() => setShare(true)} />
            <Link to={`/p/${project.id}/launch`} className="btn btn-sm btn-primary">
              <Icon name="rocket" size={14} /> Launch
            </Link>
          </div>
        </header>
        <main className={'ws-main' + (tab === 'build' ? ' is-fixed' : tab === 'code' && mode === 'dev' ? ' is-fixed is-code' : ' grid-bg')}>
          {tab === 'build' && <BuildTab />}
          {tab === 'agents' && <AgentsTab project={project} />}
          {tab === 'inspect' && <InspectionTab project={project} />}
          {tab === 'revisions' && <RevisionsTab />}
          {tab === 'code' && <CodeTab />}
        </main>
        {gh && <GitHubModal project={project} onClose={() => setGh(false)} />}
        {share && <ShareModal project={project} onClose={() => setShare(false)} />}
      </div>
    </WorkspaceProvider>
  )
}
