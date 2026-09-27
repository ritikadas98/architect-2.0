import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useStore, type Project } from '../lib/store'
import { Icon } from '../components/Icon'
import { Redline } from '../components/ui'
import {
  DIRECTIONS,
  GENERIC_TELLS,
  QUESTIONS,
  REFERENCE_FILES,
  REFERENCE_READS,
  SKILLS,
  SUGGESTED_SKILL_IDS,
  type Question,
  type ReadItem,
} from '../data/demo'
import {
  DEFAULT_LIMIT,
  FlowBar,
  MissingProject,
  inr,
  openQuestions,
  optionLabel,
  parseAnswer,
  refundLimit,
  refundRule,
  tasteName,
} from './brief/shared'
import { DirectionMock, GenericMock, RefThumb } from './brief/Mockups'
import './brief/brief.css'

const KIND_LABEL: Record<ReadItem['kind'], string> = {
  colour: 'Colour',
  type: 'Type',
  shape: 'Shape',
  layout: 'Layout',
  tone: 'Tone',
}
const KIND_ORDER: ReadItem['kind'][] = ['colour', 'type', 'shape', 'layout', 'tone']

type Patch = (patch: Record<string, string | undefined>, extra?: Partial<Project>) => void

export default function Brief() {
  const { id = '' } = useParams()
  const { getProject } = useStore()
  const project = getProject(id)
  if (!project) return <MissingProject />
  return <BriefDesk project={project} />
}

function BriefDesk({ project: p }: { project: Project }) {
  const { updateProject, toast } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const open = openQuestions(p)
  const jump = params.get('q')
  const jumpQ = jump && QUESTIONS.some((q) => q.id === jump) ? jump : null

  // "change" links from the blueprint can point at the taste section too.
  useEffect(() => {
    if (jump !== 'taste') return
    const t = window.setTimeout(() => document.getElementById('taste')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    return () => window.clearTimeout(t)
  }, [jump])

  // Suggested skills start switched on. "Interview me" is always on, so this only runs once.
  useEffect(() => {
    if (p.skills.length === 0) updateProject(p.id, { skills: [...SUGGESTED_SKILL_IDS] })
  }, [p.id, p.skills.length, updateProject])

  const patchAnswers: Patch = useCallback(
    (patch, extra) => {
      const next = { ...p.answers }
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) delete next[k]
        else next[k] = v
      }
      updateProject(p.id, { answers: next, ...extra })
    },
    [p.answers, p.id, updateProject],
  )

  // Don't drag a project that's already built back to an earlier stage.
  const canContinue = p.stage === 'brief' || p.stage === 'blueprint'

  const finish = (patch: Record<string, string>) => {
    const extra: Partial<Project> = {}
    if (!p.taste) {
      extra.taste = 'calm'
      patch.taste = 'guess:calm'
    }
    if (canContinue) extra.stage = 'blueprint'
    patchAnswers(patch, extra)
    navigate(`/p/${p.id}/blueprint`)
    return Object.keys(patch).length
  }

  const draw = () => finish({})

  const skipAll = () => {
    const patch: Record<string, string> = {}
    for (const q of open) patch[q.id] = 'guess:' + q.recommended
    const n = finish(patch)
    toast(n ? `I filled in ${n} guess${n === 1 ? '' : 'es'}. They’re marked in red.` : 'Nothing left to guess.')
  }

  return (
    <div className="grid-bg br-root">
      <FlowBar
        step={0}
        name={p.name}
        right={
          <button className="btn btn-ghost btn-sm br-skip" onClick={skipAll} title="I’ll pick for you and mark every guess in red">
            <span className="br-skip-long">Skip, you decide and flag your guesses</span>
            <span className="br-skip-short">Skip</span>
          </button>
        }
      />
      <div className="br-desk">
        <main className="br-main">
          <PromptSection p={p} />
          <ReadsSection p={p} patchAnswers={patchAnswers} />
          <QuestionsSection p={p} patchAnswers={patchAnswers} initial={jumpQ} />
          <TasteSection p={p} patchAnswers={patchAnswers} />
          <SkillsSection p={p} />
        </main>
        <aside className="br-rail" aria-label="What I know so far">
          <div className="br-rail-inner sheet-ink">
            <Summary p={p} />
            <Cta p={p} onDraw={draw} />
          </div>
        </aside>
      </div>
      <MobileBar p={p} onDraw={draw} />
    </div>
  )
}

function SecHead({ n, label, title, sub }: { n: string; label: string; title: string; sub?: React.ReactNode }) {
  return (
    <div className="br-sechead">
      <span className="label">
        <span className="br-secnum">{n}</span> {label}
      </span>
      <h2>{title}</h2>
      {sub && <p className="muted">{sub}</p>}
    </div>
  )
}

/* ---------------- 1. The prompt ---------------- */

function PromptSection({ p }: { p: Project }) {
  return (
    <section className="br-sec">
      <SecHead n="01" label="Your brief" title="Here’s what you asked for." />
      <figure className="br-quote">
        <blockquote>“{p.prompt}”</blockquote>
        <figcaption className="row wrap" style={{ gap: 10 }}>
          {REFERENCE_FILES.map((f) => (
            <span key={f.name} className="br-thumb">
              <RefThumb name={f.name} />
              <span className="mono">{f.name}</span>
            </span>
          ))}
        </figcaption>
      </figure>
      <p className="br-say">
        Before I plan anything, I want to check a few things. It takes about two minutes. It saves us both a rebuild.
      </p>
    </section>
  )
}

/* ---------------- 2. Reads ---------------- */

function ReadsSection({ p, patchAnswers }: { p: Project; patchAnswers: Patch }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const rejected = new Set(p.readsRejected)
  const keptCount = REFERENCE_READS.filter((r) => p.answers['read:' + r.id] === 'ok').length
  const unchecked = REFERENCE_READS.length - keptCount - p.readsRejected.length

  const without = (rid: string) => p.readsRejected.filter((x) => x !== rid)
  const keep = (r: ReadItem) => {
    const on = p.answers['read:' + r.id] === 'ok'
    patchAnswers({ ['read:' + r.id]: on ? undefined : 'ok' }, { readsRejected: without(r.id) })
  }
  const reject = (r: ReadItem) => {
    const on = rejected.has(r.id) && !p.answers['read:' + r.id]
    patchAnswers({ ['read:' + r.id]: undefined }, { readsRejected: on ? without(r.id) : [...without(r.id), r.id] })
  }
  const startEdit = (r: ReadItem) => {
    const cur = p.answers['read:' + r.id]
    setDraft(cur?.startsWith('fix:') ? cur.slice(4) : '')
    setEditing(r.id)
  }
  const saveEdit = (r: ReadItem) => {
    const t = draft.trim()
    if (t) patchAnswers({ ['read:' + r.id]: 'fix:' + t }, { readsRejected: [...without(r.id), r.id] })
    setEditing(null)
  }

  return (
    <section className="br-sec">
      <SecHead
        n="02"
        label="Reads"
        title="Here’s what I picked up from your screenshots."
        sub={`${keptCount} confirmed · ${p.readsRejected.length} wrong · ${unchecked} not checked`}
      />
      <Redline style={{ marginBottom: 16 }}>
        I read these off your images. Tell me where I’m wrong before I build 40 screens on it.
      </Redline>
      <div className="br-reads">
        {KIND_ORDER.map((kind) => {
          const items = REFERENCE_READS.filter((r) => r.kind === kind)
          if (!items.length) return null
          return (
            <div key={kind} className="br-readgroup">
              <span className="label">{KIND_LABEL[kind]}</span>
              <div className="br-readlist">
                {items.map((r) => {
                  const ans = p.answers['read:' + r.id]
                  const fix = ans?.startsWith('fix:') ? ans.slice(4) : undefined
                  const isKept = ans === 'ok'
                  const isWrong = rejected.has(r.id)
                  if (editing === r.id) {
                    return (
                      <form
                        key={r.id}
                        className="br-read is-editing"
                        onSubmit={(e) => {
                          e.preventDefault()
                          saveEdit(r)
                        }}
                      >
                        <span className="br-read-was">{r.text}</span>
                        <input
                          autoFocus
                          className="input br-read-input"
                          placeholder="Actually, it’s…"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
                          aria-label={`Correct “${r.text}”`}
                        />
                        <span className="row" style={{ gap: 4 }}>
                          <button className="btn btn-sm" type="submit" disabled={!draft.trim()}>
                            Save
                          </button>
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                        </span>
                      </form>
                    )
                  }
                  return (
                    <div key={r.id} className={'br-read' + (isKept ? ' is-kept' : '') + (isWrong ? ' is-wrong' : '')}>
                      {r.swatch && <span className="br-swatch" style={{ background: r.swatch }} title={r.swatch} />}
                      <span className="br-read-text">
                        <span className={isWrong ? 'br-strike' : ''}>{r.text}</span>
                        {fix && <span className="br-read-fix">→ {fix}</span>}
                      </span>
                      <span className="br-read-acts">
                        <button
                          className={'br-tog' + (isKept ? ' is-on' : '')}
                          onClick={() => keep(r)}
                          aria-pressed={isKept}
                          aria-label={`Right: ${r.text}`}
                          title="Right, keep it"
                        >
                          <Icon name="check" size={13} stroke={2.2} />
                        </button>
                        <button
                          className={'br-tog br-tog-x' + (isWrong && !fix ? ' is-on' : '')}
                          onClick={() => reject(r)}
                          aria-pressed={isWrong && !fix}
                          aria-label={`Wrong: ${r.text}`}
                          title="Wrong, drop it"
                        >
                          <Icon name="x" size={13} stroke={2.2} />
                        </button>
                        <button className="br-actually" onClick={() => startEdit(r)}>
                          {fix ? 'Edit' : 'Actually…'}
                        </button>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------------- 3. Questions ---------------- */

function nextOpenAfter(answers: Record<string, string>, afterId: string) {
  const i = QUESTIONS.findIndex((q) => q.id === afterId)
  const rest = [...QUESTIONS.slice(i + 1), ...QUESTIONS.slice(0, i)]
  return rest.find((q) => !answers[q.id])?.id ?? null
}

function QuestionsSection({ p, patchAnswers, initial }: { p: Project; patchAnswers: Patch; initial: string | null }) {
  const [current, setCurrent] = useState<string | null>(() => {
    if (initial && QUESTIONS.some((q) => q.id === initial)) return initial
    return QUESTIONS.find((q) => !p.answers[q.id])?.id ?? null
  })
  const sectionRef = useRef<HTMLElement>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Arriving from a "change" link on the blueprint: jump straight to the question.
  useEffect(() => {
    if (!initial) return
    const t = window.setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    return () => window.clearTimeout(t)
  }, [initial])

  const q = QUESTIONS.find((x) => x.id === current)
  const idx = q ? QUESTIONS.indexOf(q) : -1
  const answeredCount = QUESTIONS.filter((x) => p.answers[x.id]).length

  const choose = useCallback(
    (qq: Question, optId: string, guess: boolean) => {
      const patch: Record<string, string> = { [qq.id]: (guess ? 'guess:' : '') + optId }
      if (qq.id === 'refund' && optId === 'under' && !p.answers.refundLimit) patch.refundLimit = String(DEFAULT_LIMIT)
      patchAnswers(patch)
      window.clearTimeout(timer.current)
      // The refund limit needs a second look, so that card stays open.
      if (qq.id === 'refund' && optId === 'under') return
      const nextAnswers = { ...p.answers, ...patch }
      timer.current = window.setTimeout(() => setCurrent(nextOpenAfter(nextAnswers, qq.id)), 260)
    },
    [p.answers, patchAnswers],
  )

  // Keyboard: 1–4 picks an option, D lets me decide.
  useEffect(() => {
    if (!q) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest?.('input, textarea, select, [contenteditable="true"]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (document.querySelector('.modal-backdrop')) return
      const n = Number(e.key)
      if (n >= 1 && n <= q.options.length) {
        e.preventDefault()
        choose(q, q.options[n - 1].id, false)
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        choose(q, q.recommended, true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, choose])

  const answered = QUESTIONS.filter((x) => p.answers[x.id] && x.id !== current)

  return (
    <section className="br-sec" ref={sectionRef} id="questions">
      <SecHead
        n="03"
        label="Questions"
        title={answeredCount === QUESTIONS.length ? 'That’s all I needed to ask.' : 'A few things I shouldn’t guess.'}
        sub="Pick one, or let me decide. Anything I decide gets marked in red, so you can check it later."
      />

      {q ? (
        <QuestionCard
          key={q.id}
          q={q}
          idx={idx}
          p={p}
          answeredCount={answeredCount}
          onChoose={choose}
          onLimit={(v) => patchAnswers({ refundLimit: v })}
          onNext={() => setCurrent(nextOpenAfter(p.answers, q.id))}
          onBack={idx > 0 ? () => setCurrent(QUESTIONS[idx - 1].id) : undefined}
        />
      ) : (
        <div className="br-qdone sheet rise">
          <span className="br-qdone-mark">
            <Icon name="check" size={16} stroke={2.2} />
          </span>
          <div className="grow">
            <b>All {QUESTIONS.length} answered.</b>
            <p className="muted" style={{ fontSize: 13 }}>
              Reopen any of them below. Next, pick a look.
            </p>
          </div>
          <button
            className="btn btn-line btn-sm"
            onClick={() => document.getElementById('taste')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Next: taste <Icon name="chevronDown" size={13} />
          </button>
        </div>
      )}

      {answered.length > 0 && (
        <ul className="br-answers" aria-label="Your answers">
          {answered.map((x) => {
            const a = parseAnswer(p.answers[x.id])
            return (
              <li key={x.id} className={a.guess ? 'is-guess' : ''}>
                <span className="br-ans-q">{x.q}</span>
                <span className="br-ans-a">
                  {optionLabel(x, p.answers[x.id])}
                  {x.id === 'refund' && a.id === 'under' && <span className="mono"> · {inr(refundLimit(p))}</span>}
                  {a.guess && <span className="badge badge-red">my guess</span>}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => setCurrent(x.id)} aria-label={`Change: ${x.q}`}>
                  Change
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function QuestionCard({
  q,
  idx,
  p,
  answeredCount,
  onChoose,
  onLimit,
  onNext,
  onBack,
}: {
  q: Question
  idx: number
  p: Project
  answeredCount: number
  onChoose: (q: Question, optId: string, guess: boolean) => void
  onLimit: (v: string) => void
  onNext: () => void
  onBack?: () => void
}) {
  const a = parseAnswer(p.answers[q.id])
  const rec = q.options.find((o) => o.id === q.recommended)
  const showLimit = q.id === 'refund' && a.id === 'under'
  const limitRaw = p.answers.refundLimit ?? String(DEFAULT_LIMIT)
  const limitNum = Number(limitRaw)
  const limitBad = !limitRaw || !Number.isFinite(limitNum) || limitNum <= 0

  return (
    <div className="br-qcard sheet-ink rise">
      <div className="row between">
        <span className="label">
          Question <b className="mono br-qcount">{idx + 1} of {QUESTIONS.length}</b>
        </span>
        <span className="label">{answeredCount} answered</span>
      </div>
      <div className="bar" aria-hidden="true" style={{ marginTop: 8 }}>
        <i style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }} />
      </div>
      <h3 className="br-qtitle">{q.q}</h3>
      <div className="br-opts" role="radiogroup" aria-label={q.q}>
        {q.options.map((o, i) => {
          const on = a.id === o.id && !a.guess
          const guessed = a.id === o.id && a.guess
          return (
            <button
              key={o.id}
              role="radio"
              aria-checked={on}
              className={'br-opt' + (on ? ' is-on' : '') + (guessed ? ' is-guess' : '')}
              onClick={() => onChoose(q, o.id, false)}
            >
              <kbd>{i + 1}</kbd>
              <span className="grow col" style={{ gap: 1 }}>
                <b>{o.label}</b>
                {o.hint && <small>{o.hint}</small>}
              </span>
              {guessed && <span className="badge badge-red">my guess</span>}
              <span className="br-radio" aria-hidden="true" />
            </button>
          )
        })}
        <button
          role="radio"
          aria-checked={a.guess}
          className={'br-opt br-opt-decide' + (a.guess ? ' is-on' : '')}
          onClick={() => onChoose(q, q.recommended, true)}
        >
          <kbd>D</kbd>
          <span className="grow col" style={{ gap: 1 }}>
            <b>You decide</b>
            <small>I’d pick “{rec?.label}”. I’ll mark it as my guess.</small>
          </span>
          <span className="br-radio" aria-hidden="true" />
        </button>
      </div>

      {showLimit && (
        <div className="br-limit rise">
          <label className="field">
            <span>It can approve on its own up to</span>
            <span className="br-limit-in">
              <span className="mono">₹</span>
              <input
                className="input mono"
                type="number"
                inputMode="numeric"
                min={100}
                step={100}
                value={limitRaw}
                onChange={(e) => onLimit(e.target.value)}
                aria-invalid={limitBad}
              />
            </span>
          </label>
          <p className={limitBad ? 'br-err' : 'muted'} style={{ fontSize: 12.5 }}>
            {limitBad
              ? 'Needs a number above zero.'
              : `Anything over ${inr(limitNum)} waits for you. I’ll enforce it in code, not just in the AI’s instructions.`}
          </p>
          <button className="btn btn-sm" onClick={onNext} disabled={limitBad} style={{ justifySelf: 'start' }}>
            Next question <Icon name="arrow" size={13} />
          </button>
        </div>
      )}

      <p className="br-why">
        <span className="label">Why I’m asking</span> {q.why}
      </p>
      <div className="row between br-qfoot">
        {onBack ? (
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <Icon name="back" size={13} /> Previous
          </button>
        ) : (
          <span />
        )}
        <span className="label br-keys">
          Keys <kbd>1</kbd>–<kbd>{q.options.length}</kbd> or <kbd>D</kbd>
        </span>
      </div>
    </div>
  )
}

/* ---------------- 4. Taste ---------------- */

function TasteSection({ p, patchAnswers }: { p: Project; patchAnswers: Patch }) {
  const { toast } = useStore()
  const pick = (id: string) => patchAnswers({ taste: undefined }, { taste: id })
  const tasteGuessed = parseAnswer(p.answers.taste).guess
  const refuse = () => toast('Not by default. Ask me in the chat if you really want it.')
  return (
    <section className="br-sec" id="taste">
      <SecHead
        n="04"
        label="Taste"
        title="Which one looks like you?"
        sub="Same app, three looks. Two come from your screenshots. The third is a contrast, so you can feel the difference."
      />
      <div className="br-taste" role="radiogroup" aria-label="Pick a look">
        {DIRECTIONS.map((d) => {
          const on = p.taste === d.id
          return (
            <button
              key={d.id}
              role="radio"
              aria-checked={on}
              className={'br-dir' + (on ? ' is-on' : '') + (on && tasteGuessed ? ' is-guess' : '')}
              onClick={() => pick(d.id)}
            >
              <DirectionMock d={d} />
              <span className="br-dir-meta">
                <span className="row between" style={{ width: '100%', gap: 8 }}>
                  <b>{d.name}</b>
                  {on ? (
                    tasteGuessed ? (
                      <span className="badge badge-red">my guess</span>
                    ) : (
                      <span className="badge badge-ink">
                        <Icon name="check" size={10} stroke={2.4} /> Picked
                      </span>
                    )
                  ) : (
                    <span className="label">{d.from}</span>
                  )}
                </span>
                <small>{d.note}</small>
              </span>
            </button>
          )
        })}
        <div
          className="br-dir br-dir-no"
          role="button"
          tabIndex={0}
          aria-label="The default AI look. Off unless you ask."
          onClick={refuse}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              refuse()
            }
          }}
        >
          <GenericMock />
          <span className="br-dir-meta">
            <b className="br-strike">The default AI look</b>
            <ul className="br-tells">
              {GENERIC_TELLS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <Redline style={{ fontSize: 14 }}>I won’t do this unless you ask.</Redline>
          </span>
        </div>
      </div>
      {!p.taste && (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>
          No pick yet. If you move on, I’ll use Quiet spa and mark it as my guess.
        </p>
      )}
    </section>
  )
}

/* ---------------- 5. Skills ---------------- */

function SkillsSection({ p }: { p: Project }) {
  const { updateProject } = useStore()
  const suggested = SKILLS.filter((s) => SUGGESTED_SKILL_IDS.includes(s.id))
  // The reason should match what you actually told me, not what I expected you to say.
  const skillWhy = (sid: string, why?: string) => {
    const orders = parseAnswer(p.answers.orders).id
    const lang = parseAnswer(p.answers.lang).id
    if (sid === 'shopify' && orders !== 'shopify') return orders ? 'Useful later if you move orders to Shopify.' : 'In case your orders live in Shopify.'
    if (sid === 'hindi' && lang !== 'enhi') return lang === 'en' ? 'You picked English only. Untick if you won’t need it.' : lang ? 'Handles Hindi and Hinglish when customers write it.' : 'In case customers write in Hindi.'
    return why
  }
  const toggle = (sid: string) => {
    if (sid === 'interview') return
    const on = p.skills.includes(sid)
    updateProject(p.id, { skills: on ? p.skills.filter((x) => x !== sid) : [...p.skills, sid] })
  }
  return (
    <section className="br-sec">
      <SecHead
        n="05"
        label="Skills"
        title="Skills I’ll bring."
        sub="Add-ons that make me better at this kind of app. I picked these from your answers. Untick any you don’t want."
      />
      <ul className="br-skills">
        {suggested.map((s) => {
          const on = p.skills.includes(s.id)
          const locked = s.id === 'interview'
          return (
            <li key={s.id}>
              <label className={'br-skill' + (on ? ' is-on' : '') + (locked ? ' is-locked' : '')}>
                <input type="checkbox" className="sr-only" checked={on} disabled={locked} onChange={() => toggle(s.id)} />
                <span className="br-check" aria-hidden="true">
                  {on && <Icon name="check" size={12} stroke={2.4} />}
                </span>
                <span className="grow col" style={{ gap: 2 }}>
                  <span className="row wrap" style={{ gap: 8 }}>
                    <b>{s.name}</b>
                    <span className="mono muted" style={{ fontSize: 11 }}>
                      {s.by}
                    </span>
                    <span className="badge">{s.cat}</span>
                  </span>
                  <small className="muted">{s.what}</small>
                  {skillWhy(s.id, s.why) && (
                    <small className="br-skill-why">
                      <Icon name="arrow" size={11} /> {skillWhy(s.id, s.why)}
                    </small>
                  )}
                </span>
                {locked && <span className="label br-always">Always on</span>}
              </label>
            </li>
          )
        })}
      </ul>
      <Link to="/skills" className="btn btn-line btn-sm" style={{ marginTop: 12 }}>
        <Icon name="skill" size={13} /> Browse all skills
      </Link>
    </section>
  )
}

/* ---------------- Rail ---------------- */

function Fact({ k, v, guess, open }: { k: string; v?: React.ReactNode; guess?: boolean; open?: boolean }) {
  return (
    <div className={'br-fact' + (guess ? ' is-guess' : '') + (open ? ' is-open' : '')}>
      <span className="label">{k}</span>
      <span className="br-fact-v">
        {open ? 'Not answered yet' : v}
        {guess && !open && <span className="badge badge-red">guess</span>}
      </span>
    </div>
  )
}

function Summary({ p }: { p: Project }) {
  const facts = useMemo(() => {
    const get = (qid: string) => {
      const q = QUESTIONS.find((x) => x.id === qid)!
      const a = parseAnswer(p.answers[qid])
      return { a, opt: q.options.find((o) => o.id === a.id), open: !p.answers[qid] }
    }
    return { who: get('who'), orders: get('orders'), refund: get('refund'), verify: get('verify'), lang: get('lang') }
  }, [p.answers])
  const open = openQuestions(p).length
  const tasteGuess = !p.taste || parseAnswer(p.answers.taste).guess
  const wrong = p.readsRejected.length
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row between">
        <h3 style={{ fontSize: 15 }}>What I know so far</h3>
        <span className={'badge ' + (open ? 'badge-red' : 'badge-green')}>{open ? `${open} open` : 'Complete'}</span>
      </div>
      <div className="br-facts">
        <Fact k="Who" v={facts.who.opt?.hint ?? facts.who.opt?.label} guess={facts.who.a.guess} open={facts.who.open} />
        <Fact
          k="Orders"
          v={facts.orders.a.id === 'unsure' ? 'Sample orders for now' : facts.orders.opt?.label}
          guess={facts.orders.a.guess}
          open={facts.orders.open}
        />
        <Fact k="Refund rule" v={refundRule(p)} guess={facts.refund.a.guess} open={facts.refund.open} />
        <Fact k="Proof of order" v={facts.verify.opt?.label} guess={facts.verify.a.guess} open={facts.verify.open} />
        <Fact k="Languages" v={facts.lang.opt?.label} guess={facts.lang.a.guess} open={facts.lang.open} />
        <Fact k="Look" v={p.taste ? tasteName(p) : 'Quiet spa, unless you pick'} guess={tasteGuess} />
        <Fact k="Screenshots" v={`${REFERENCE_READS.length - wrong} reads kept${wrong ? ` · ${wrong} fixed` : ''}`} />
        <Fact k="Skills" v={`${p.skills.length} add-on${p.skills.length === 1 ? '' : 's'}`} />
      </div>
    </div>
  )
}

function Cta({ p, onDraw, compact }: { p: Project; onDraw: () => void; compact?: boolean }) {
  const left = openQuestions(p).length
  return (
    <div className={'col br-cta' + (compact ? ' is-compact' : '')} style={{ gap: 8 }}>
      <button className={'btn btn-primary' + (compact ? '' : ' btn-lg')} disabled={left > 0} onClick={onDraw}>
        Draw the blueprint <Icon name="arrow" size={15} />
      </button>
      {!compact && (
        <p className="muted" style={{ fontSize: 12.5 }}>
          {left > 0
            ? `${left} question${left === 1 ? '' : 's'} left. Answer, or tap “You decide”.`
            : 'Ready. Nothing gets built until you approve the plan.'}
        </p>
      )}
    </div>
  )
}

function MobileBar({ p, onDraw }: { p: Project; onDraw: () => void }) {
  const [open, setOpen] = useState(false)
  const left = openQuestions(p).length
  return (
    <div className="br-mbar">
      {open && (
        <div className="br-msheet sheet-ink rise">
          <Summary p={p} />
        </div>
      )}
      <div className="br-mbar-row">
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <Icon name={open ? 'chevronDown' : 'up'} size={13} />
          {left > 0 ? <span className="br-left">{left} left</span> : 'What I know'}
        </button>
        <Cta p={p} onDraw={onDraw} compact />
      </div>
    </div>
  )
}
