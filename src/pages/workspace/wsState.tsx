import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Project } from '../../lib/store'
import { REVISIONS } from '../../data/demo'
import { REV_DIFFS } from './wsData'

export type Tab = 'build' | 'agents' | 'inspect' | 'revisions' | 'code'

export type Rev = {
  rev: string
  title: string
  when: string
  by: string
  credits: number
  at?: number
  plain?: string[]
  dev?: string[]
}

export type AppEdits = { text: Record<string, string>; btnColor: string; btnRadius: number }
export const DEFAULT_EDITS: AppEdits = { text: {}, btnColor: '#7C8B6F', btnRadius: 999 }

export type Step = { simple: string; dev: string }
export type ChatMsg =
  | { id: string; role: 'user'; text: string; file?: string }
  | { id: string; role: 'ai'; kind: 'text'; text: string }
  | { id: string; role: 'ai'; kind: 'ask'; text: string; options: [string, string]; request: string; chosen?: string }
  | { id: string; role: 'ai'; kind: 'plan'; request: string; choice: string; steps: Step[]; decided?: 'go' | 'no' }
  | { id: string; role: 'ai'; kind: 'work'; steps: Step[]; done: number; rev?: string; credits: number }

/** Small per-viewer persistence. Falls back to memory in private windows. */
export function usePersist<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem('a2:ws:' + key)
      return raw ? (JSON.parse(raw) as T) : init
    } catch {
      return init
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('a2:ws:' + key, JSON.stringify(v))
    } catch {
      /* fine: state lives in memory only */
    }
  }, [key, v])
  return [v, setV] as const
}

export function ago(at?: number, fallback = '') {
  if (!at) return fallback
  const m = Math.round((Date.now() - at) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function letter(i: number) {
  return i < 26 ? LETTERS[i] : LETTERS[Math.floor(i / 26) - 1] + LETTERS[i % 26]
}

type WS = {
  project: Project
  tab: Tab
  goTab: (t: Tab) => void
  revs: Rev[]
  addRev: (r: Omit<Rev, 'rev' | 'when' | 'at'>) => Rev
  edits: AppEdits
  setEdits: (fn: (e: AppEdits) => AppEdits) => void
  shopify: boolean
  setShopify: (b: boolean) => void
  msgs: ChatMsg[]
  setMsgs: React.Dispatch<React.SetStateAction<ChatMsg[]>>
  previewRev: string | null
  setPreviewRev: (r: string | null) => void
  customerTick: number
  tryAsCustomer: () => void
  buildIdx: number
  setBuildIdx: (n: number) => void
  mobilePane: 'chat' | 'preview'
  setMobilePane: (p: 'chat' | 'preview') => void
}

const Ctx = createContext<WS | null>(null)

export function WorkspaceProvider({
  project,
  tab,
  goTab,
  children,
}: {
  project: Project
  tab: Tab
  goTab: (t: Tab) => void
  children: React.ReactNode
}) {
  const id = project.id
  const [added, setAdded] = usePersist<Rev[]>(id + ':revs', [])
  const [edits, setEditsRaw] = usePersist<AppEdits>(id + ':edits', DEFAULT_EDITS)
  const [shopify, setShopify] = usePersist<boolean>(id + ':shopify', false)
  const [msgs, setMsgs] = usePersist<ChatMsg[]>(id + ':msgs', [])
  const [buildIdx, setBuildIdx] = usePersist<number>(id + ':buildIdx', 0)
  const [previewRev, setPreviewRev] = useState<string | null>(null)
  const [customerTick, setCustomerTick] = useState(0)
  const [mobilePane, setMobilePane] = useState<'chat' | 'preview'>('chat')

  const base: Rev[] = REVISIONS.map((r) => ({ ...r, ...REV_DIFFS[r.rev] }))
  const revs = [...added.map((r) => ({ ...r, when: ago(r.at, r.when) })), ...base]

  const count = useRef(added.length)
  const addRev = useCallback(
    (r: Omit<Rev, 'rev' | 'when' | 'at'>) => {
      const next: Rev = { ...r, rev: letter(REVISIONS.length + count.current++), when: 'just now', at: Date.now() }
      setAdded((a) => [next, ...a])
      return next
    },
    [setAdded],
  )

  const setEdits = useCallback((fn: (e: AppEdits) => AppEdits) => setEditsRaw((e) => fn(e)), [setEditsRaw])

  const tryAsCustomer = useCallback(() => {
    setCustomerTick((t) => t + 1)
    setMobilePane('preview')
    goTab('build')
  }, [goTab])

  return (
    <Ctx.Provider
      value={{
        project,
        tab,
        goTab,
        revs,
        addRev,
        edits,
        setEdits,
        shopify,
        setShopify,
        msgs,
        setMsgs,
        previewRev,
        setPreviewRev,
        customerTick,
        tryAsCustomer,
        buildIdx,
        setBuildIdx,
        mobilePane,
        setMobilePane,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useWS() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useWS outside WorkspaceProvider')
  return c
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
