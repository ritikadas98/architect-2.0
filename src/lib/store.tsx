import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase'

export type Mode = 'simple' | 'dev'
export type Theme = 'light' | 'dark'
export type Stage = 'brief' | 'blueprint' | 'building' | 'ready' | 'live'

export type User = {
  id: string
  name: string
  email: string
  provider: 'google' | 'github' | 'email' | 'demo'
  real: boolean
}

export type Project = {
  id: string
  name: string
  prompt: string
  stage: Stage
  createdAt: number
  updatedAt: number
  imported?: { from: string; repo?: string }
  answers: Record<string, string>
  readsRejected: string[]
  taste?: string
  skills: string[]
  fixed: string[]
  github?: { repo: string; branch: string; prs: boolean }
  liveUrl?: string
  model: string
}

type Credits = { balance: number; spent: number; freeFixes: number }

type Store = {
  user: User | null
  setUser: (u: User | null) => void
  signOut: () => Promise<void>
  mode: Mode
  setMode: (m: Mode) => void
  theme: Theme
  setTheme: (t: Theme) => void
  projects: Project[]
  createProject: (p: Partial<Project> & { prompt: string }) => Project
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
  credits: Credits
  spend: (n: number) => void
  freeFix: (n: number) => void
  toast: (msg: string) => void
  toasts: { id: number; msg: string }[]
  synced: boolean
}

const Ctx = createContext<Store | null>(null)

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem('a2:' + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem('a2:' + key, JSON.stringify(value))
  } catch {
    /* private mode: state just won't persist */
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 8)
}

export function nameFromPrompt(prompt: string) {
  const p = prompt.toLowerCase()
  if (p.includes('support') || p.includes('refund')) return 'Glow & Co. support desk'
  if (p.includes('lead')) return 'Lead qualifier'
  if (p.includes('expense') || p.includes('receipt')) return 'Expense checker'
  const words = prompt.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 4).join(' ')
  return words ? words[0].toUpperCase() + words.slice(1) : 'Untitled app'
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => load('user', null))
  const [mode, setModeState] = useState<Mode>(() => load('mode', 'simple'))
  const [theme, setThemeState] = useState<Theme>(() => load('theme', 'light'))
  const [projects, setProjects] = useState<Project[]>(() => load('projects', []))
  const [credits, setCredits] = useState<Credits>(() => load('credits', { balance: 500, spent: 0, freeFixes: 0 }))
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([])
  const [synced, setSynced] = useState(false)
  const skipPush = useRef(false)

  useEffect(() => save('user', user), [user])
  useEffect(() => save('mode', mode), [mode])
  useEffect(() => save('projects', projects), [projects])
  useEffect(() => save('credits', credits), [credits])
  useEffect(() => {
    save('theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Real auth: mirror the Supabase session into the store.
  useEffect(() => {
    if (!supabase) return
    const apply = (session: Awaited<ReturnType<NonNullable<typeof supabase>['auth']['getSession']>>['data']['session']) => {
      if (!session) return
      const u = session.user
      const provider = (u.app_metadata?.provider as User['provider']) || 'email'
      setUserState({
        id: u.id,
        email: u.email || '',
        name: (u.user_metadata?.full_name as string) || (u.user_metadata?.user_name as string) || (u.email || 'You').split('@')[0],
        provider,
        real: true,
      })
    }
    supabase.auth.getSession().then(({ data }) => apply(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, session) => apply(session))
    return () => data.subscription.unsubscribe()
  }, [])

  // Real database: load this user's projects once signed in.
  useEffect(() => {
    if (!supabase || !user?.real) return
    supabase
      .from('projects')
      .select('id, data')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) return
        if (data && data.length) {
          skipPush.current = true
          setProjects(data.map((r) => r.data as Project))
        }
        setSynced(true)
      })
  }, [user?.real, user?.id])

  const pushProject = useCallback(
    (p: Project) => {
      if (!supabase || !user?.real) return
      supabase
        .from('projects')
        .upsert({ id: p.id, user_id: user.id, data: p, updated_at: new Date(p.updatedAt).toISOString() })
        .then(() => {})
    },
    [user?.real, user?.id],
  )

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const createProject: Store['createProject'] = useCallback(
    (p) => {
      const now = Date.now()
      const proj: Project = {
        id: uid(),
        name: p.name || nameFromPrompt(p.prompt),
        stage: 'brief',
        createdAt: now,
        updatedAt: now,
        answers: {},
        readsRejected: [],
        skills: [],
        fixed: [],
        model: 'auto',
        ...p,
      }
      setProjects((ps) => [proj, ...ps])
      pushProject(proj)
      return proj
    },
    [pushProject],
  )

  const updateProject: Store['updateProject'] = useCallback(
    (id, patch) => {
      setProjects((ps) =>
        ps.map((p) => {
          if (p.id !== id) return p
          const next = { ...p, ...patch, updatedAt: Date.now() }
          if (!skipPush.current) pushProject(next)
          return next
        }),
      )
      skipPush.current = false
    },
    [pushProject],
  )

  const deleteProject = useCallback((id: string) => {
    setProjects((ps) => ps.filter((p) => p.id !== id))
    if (supabase) supabase.from('projects').delete().eq('id', id).then(() => {})
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setUserState(null)
  }, [])

  const value: Store = useMemo(
    () => ({
      user,
      setUser: setUserState,
      signOut,
      mode,
      setMode: setModeState,
      theme,
      setTheme: setThemeState,
      projects,
      createProject,
      updateProject,
      deleteProject,
      getProject: (id) => projects.find((p) => p.id === id),
      credits,
      spend: (n) => setCredits((c) => ({ ...c, balance: c.balance - n, spent: c.spent + n })),
      freeFix: (n) => setCredits((c) => ({ ...c, freeFixes: c.freeFixes + n })),
      toast,
      toasts,
      synced,
    }),
    [user, signOut, mode, theme, projects, createProject, updateProject, deleteProject, credits, toast, toasts, synced],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
