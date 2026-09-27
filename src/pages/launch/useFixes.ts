// Shared "fix it for me" logic for Inspection, Launch pre-flight and the Agents tab.
// Fixes land in project.fixed, so every screen agrees on what's been done.
import { useCallback, useRef, useState } from 'react'
import { FINDINGS, type Finding } from '../../data/demo'
import { useStore, type Project } from '../../lib/store'

export function useFixes(project: Project) {
  const { updateProject, freeFix, toast } = useStore()
  const [busy, setBusy] = useState<string[]>([])
  const fixedRef = useRef(project.fixed)
  fixedRef.current = project.fixed

  const fix = useCallback(
    (id: string, msg = 'Fixed. Saved as a new revision.', ms = 1400) =>
      new Promise<void>((resolve) => {
        setBusy((b) => [...b, id])
        setTimeout(() => {
          const next = Array.from(new Set([...fixedRef.current, id]))
          fixedRef.current = next
          updateProject(project.id, { fixed: next })
          freeFix(0)
          setBusy((b) => b.filter((x) => x !== id))
          if (msg) toast(msg)
          resolve()
        }, ms)
      }),
    [project.id, updateProject, freeFix, toast],
  )

  const isFixed = (f: Finding | string) => project.fixed.includes(typeof f === 'string' ? f : f.id)
  const openMust = FINDINGS.filter((f) => f.level === 'must' && !isFixed(f))

  return { fix, busy, isFixed, openMust }
}

/** Revision letter: Rev F from the build, plus one per fix since. */
export function revLetter(project: Project) {
  const n = Math.min(project.fixed.length, 19)
  return String.fromCharCode('F'.charCodeAt(0) + n)
}
