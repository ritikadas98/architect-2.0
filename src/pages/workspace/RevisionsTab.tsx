import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/ui'
import { useStore } from '../../lib/store'
import { useWS, type Rev } from './wsState'
import { CodeLines } from './CodeTab'

export default function RevisionsTab() {
  const { revs, addRev, setPreviewRev, goTab } = useWS()
  const { mode, toast } = useStore()
  const [restore, setRestore] = useState<Rev | null>(null)
  const [comparing, setComparing] = useState(false)
  const [pick, setPick] = useState<string[]>([])
  const latest = revs[0]

  const togglePick = (r: string) =>
    setPick((p) => (p.includes(r) ? p.filter((x) => x !== r) : p.length >= 2 ? [p[1], r] : [...p, r]))

  // Order by position in the timeline: older one first.
  const idx = (r: string) => revs.findIndex((x) => x.rev === r)
  const [a, b] = pick.length === 2 ? [...pick].sort((x, y) => idx(y) - idx(x)) : [null, null]
  const between = a && b ? revs.slice(idx(b), idx(a)) : []

  return (
    <div className="page ws-revs">
      <div className="row between wrap" style={{ gap: 12, marginBottom: 20 }}>
        <div className="col" style={{ gap: 4 }}>
          <h2 style={{ fontSize: 24 }}>Revisions</h2>
          <p className="muted">Every change is saved, like a drawing set. Go back to any of them. Nothing gets deleted.</p>
        </div>
        <button
          className={'btn btn-sm ' + (comparing ? 'btn-primary' : 'btn-line')}
          onClick={() => {
            setComparing(!comparing)
            setPick([])
          }}
          aria-pressed={comparing}
        >
          <Icon name="layers" size={13} /> {comparing ? 'Done comparing' : 'Compare'}
        </button>
      </div>

      {comparing && (
        <div className="card ws-compare rise" style={{ marginBottom: 20 }}>
          {!a || !b ? (
            <p className="muted">Pick two revisions below. {pick.length === 1 && `Rev ${pick[0]} picked. One more.`}</p>
          ) : (
            <>
              <h4 style={{ fontSize: 15, marginBottom: 10 }}>
                From <span className="ws-revtag">Rev {a}</span> to <span className="ws-revtag">Rev {b}</span>
              </h4>
              <ul className="ws-difflist">
                {between.flatMap((r) => (r.plain || [r.title]).map((p) => (
                  <li key={r.rev + p}>
                    <span className="ws-revtag">{r.rev}</span> {p}
                  </li>
                )))}
              </ul>
              {mode === 'dev' && (
                <div style={{ marginTop: 12 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Code diff</div>
                  <CodeLines code={between.flatMap((r) => [`# Rev ${r.rev}`, ...(r.dev || [])]).join('\n')} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      <ol className="ws-timeline">
        {revs.map((r) => (
          <li key={r.rev} className={'ws-rev' + (pick.includes(r.rev) ? ' is-picked' : '')}>
            <span className="ws-rev-letter" aria-label={`Revision ${r.rev}`}>{r.rev}</span>
            <div className="ws-rev-body card">
              <div className="row between wrap" style={{ gap: 8 }}>
                <strong>{r.title}</strong>
                {r === latest && <span className="badge badge-blue">Current</span>}
              </div>
              <div className="row wrap muted" style={{ gap: 10, fontSize: 12.5 }}>
                <span className="row" style={{ gap: 4 }}><Icon name="user" size={12} /> {r.by}</span>
                <span className="row" style={{ gap: 4 }}><Icon name="clock" size={12} /> {r.when}</span>
                <span className="row mono" style={{ gap: 4 }}><Icon name="coin" size={12} /> {r.credits === 0 ? 'free' : r.credits + ' credits'}</span>
              </div>
              {mode === 'dev' && r.dev && <div className="mono muted" style={{ fontSize: 11.5 }}>{r.dev.slice(0, 2).join('  ')}</div>}
              <div className="row wrap" style={{ gap: 6, marginTop: 4 }}>
                {comparing ? (
                  <button className={'chip' + (pick.includes(r.rev) ? ' is-on' : '')} onClick={() => togglePick(r.rev)} aria-pressed={pick.includes(r.rev)}>
                    {pick.includes(r.rev) ? <Icon name="check" size={12} /> : <Icon name="plus" size={12} />} Compare this
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-sm btn-line"
                      onClick={() => {
                        setPreviewRev(r === latest ? null : r.rev)
                        goTab('build')
                      }}
                    >
                      <Icon name="eye" size={13} /> Preview
                    </button>
                    {r !== latest && (
                      <button className="btn btn-sm btn-ghost" onClick={() => setRestore(r)}>
                        <Icon name="undo" size={13} /> Restore to here
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {restore && (
        <Modal
          title={`Go back to Rev ${restore.rev}?`}
          onClose={() => setRestore(null)}
          foot={
            <>
              <button className="btn btn-ghost" onClick={() => setRestore(null)}>Keep Rev {latest.rev}</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const n = addRev({ title: `Went back to Rev ${restore.rev}`, by: 'You', credits: 0, plain: [`Everything after Rev ${restore.rev} undone`], dev: [`git revert ${latest.rev}..${restore.rev} (no history lost)`] })
                  toast(`Back to Rev ${restore.rev}. Saved as Rev ${n.rev}.`)
                  setRestore(null)
                }}
              >
                <Icon name="undo" size={14} /> Restore
              </button>
            </>
          }
        >
          <div className="col" style={{ gap: 10 }}>
            <p>Your app goes back to how it was at Rev {restore.rev}. Nothing is deleted: you can come back to Rev {latest.rev}.</p>
            <p className="muted" style={{ fontSize: 13 }}>It’s free. It shows up as a new revision, so the history stays honest.</p>
          </div>
        </Modal>
      )}
    </div>
  )
}
