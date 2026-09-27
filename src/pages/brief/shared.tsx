import { Link } from 'react-router-dom'
import { Logo, ModeToggle, Steps, ThemeToggle } from '../../components/ui'
import { Icon } from '../../components/Icon'
import { DIRECTIONS, QUESTIONS, type Question } from '../../data/demo'
import type { Project } from '../../lib/store'
import './shared.css'

/* ---------- Answer helpers ---------- */

/** Answers are an option id, or `guess:<id>` when the user let me decide. */
export function parseAnswer(v?: string): { id?: string; guess: boolean } {
  if (!v) return { guess: false }
  if (v.startsWith('guess:')) return { id: v.slice(6), guess: true }
  return { id: v, guess: false }
}

export function optionLabel(q: Question, v?: string) {
  const { id } = parseAnswer(v)
  return q.options.find((o) => o.id === id)?.label
}

export function inr(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export const DEFAULT_LIMIT = 1500

export function refundLimit(p: Project) {
  const n = Number(p.answers.refundLimit)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT
}

export function openQuestions(p: Project) {
  return QUESTIONS.filter((q) => !p.answers[q.id])
}

export function guesses(p: Project) {
  return QUESTIONS.filter((q) => parseAnswer(p.answers[q.id]).guess)
}

export function tasteName(p: Project) {
  return DIRECTIONS.find((d) => d.id === p.taste)?.name
}

/** Short, plain summary of the refund rule. */
export function refundRule(p: Project) {
  const { id } = parseAnswer(p.answers.refund)
  if (id === 'under') return `Approves under ${inr(refundLimit(p))}. Bigger ones go to you.`
  if (id === 'draft') return 'Drafts every refund. You approve each one.'
  if (id === 'never') return 'Never touches refunds. Collects details for you.'
  return undefined
}

/* ---------- Top bar ---------- */

export function FlowBar({ step, name, right }: { step: number; name: string; right?: React.ReactNode }) {
  return (
    <header className="fb-bar">
      <Link to="/home" aria-label="Back to your projects" className="fb-logo">
        <Logo withWord={false} size={24} />
      </Link>
      <div className="fb-steps">
        <Steps current={step} />
      </div>
      <span className="fb-stepnum label">Step {step + 1} of 5</span>
      <span className="fb-name" title={name}>
        {name}
      </span>
      <div className="row fb-right">
        {right}
        <span className="fb-hide-sm">
          <ModeToggle compact />
        </span>
        <ThemeToggle />
      </div>
    </header>
  )
}

export function MissingProject() {
  return (
    <div className="grid-bg" style={{ minHeight: '100%' }}>
      <div className="page" style={{ maxWidth: 520, paddingTop: 96 }}>
        <div className="sheet-ink col" style={{ padding: 28, gap: 12, alignItems: 'flex-start' }}>
          <span className="label">Sheet not found</span>
          <h2 style={{ fontSize: 24 }}>I can’t find that project.</h2>
          <p className="muted">
            It may have been deleted, or it lives in another browser. Projects you make here are saved on this device
            unless you signed in.
          </p>
          <Link to="/home" className="btn btn-primary">
            <Icon name="back" size={14} /> Back to your projects
          </Link>
        </div>
      </div>
    </div>
  )
}
