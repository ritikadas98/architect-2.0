import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Avatar, Modal } from '../../components/ui'
import { useStore } from '../../lib/store'

type Member = { email: string; role: 'Owner' | 'Builder' | 'Viewer'; pending?: boolean }

const PROVIDER_LABEL: Record<string, string> = { google: 'Google', github: 'GitHub', email: 'Email link', demo: 'Demo sign-in' }

export function AccountTab() {
  const { user, mode, setMode, theme, setTheme, projects, deleteProject, signOut, toast } = useStore()
  const nav = useNavigate()
  const [team, setTeam] = useState<Member[]>(() => [{ email: user?.email || 'you@example.com', role: 'Owner' }])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Member['role']>('Builder')
  const [err, setErr] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [typed, setTyped] = useState('')

  const invite = (e: React.FormEvent) => {
    e.preventDefault()
    const v = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(v)) return setErr('That email doesn’t look right.')
    if (team.some((m) => m.email === v)) return setErr('They’re already on the team.')
    setTeam((t) => [...t, { email: v, role, pending: true }])
    setEmail('')
    setErr('')
    toast(`Invite sent to ${v}.`)
  }

  return (
    <>
      <header className="st-h">
        <span className="label">Account</span>
        <h1>You, your team, your defaults.</h1>
      </header>

      <section className="sheet" style={{ padding: 18, display: 'grid', gap: 14 }}>
        <div className="row wrap" style={{ gap: 14 }}>
          <Avatar name={user?.name || 'You'} size={44} />
          <div className="col grow" style={{ gap: 2 }}>
            <strong style={{ fontSize: 16 }}>{user?.name}</strong>
            <span className="muted" style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{user?.email}</span>
          </div>
          {user?.real ? (
            <span className="badge badge-green">Signed in with {PROVIDER_LABEL[user.provider] || user.provider}</span>
          ) : (
            <span className="badge badge-amber">Demo account</span>
          )}
        </div>
        <div className="titleblock" style={{ ['--cols' as string]: 3 }}>
          <div>
            <span className="label">Sign-in</span>
            <span>{PROVIDER_LABEL[user?.provider || 'demo']}</span>
          </div>
          <div>
            <span className="label">Projects</span>
            <span className="mono">{projects.length}</span>
          </div>
          <div>
            <span className="label">Saved to</span>
            <span>{user?.real ? 'Your account' : 'This browser only'}</span>
          </div>
        </div>
      </section>

      <section className="st-sec">
        <h2>How do you like to work?</h2>
        <p className="st-sub">Your default view. You can flip it on any screen.</p>
        <div className="st-plans" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {(
            [
              ['simple', 'Simple', 'eye', 'Plain words. No code. I explain what changed and why.'],
              ['dev', 'Developer', 'code', 'Code, diffs, terminal, agent traces, CLI and GitHub PRs.'],
            ] as const
          ).map(([id, label, icon, note]) => (
            <button
              key={id}
              className={'st-opt' + (mode === id ? ' is-on' : '')}
              onClick={() => {
                setMode(id)
                toast(`${label} view is now your default.`)
              }}
              aria-pressed={mode === id}
            >
              <span className="st-radio" />
              <span className="col" style={{ gap: 4 }}>
                <span className="row" style={{ gap: 6 }}>
                  <Icon name={icon} size={14} /> <strong>{label}</strong>
                </span>
                <span className="muted" style={{ fontSize: 12.5 }}>{note}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="st-sec">
        <h2>Theme</h2>
        <div className="seg" role="group" aria-label="Theme">
          <button className={theme === 'light' ? 'is-on' : ''} onClick={() => setTheme('light')}>
            <Icon name="sun" size={13} /> Paper
          </button>
          <button className={theme === 'dark' ? 'is-on' : ''} onClick={() => setTheme('dark')}>
            <Icon name="moon" size={13} /> Blueprint
          </button>
        </div>
      </section>

      <section className="st-sec">
        <h2>Team</h2>
        <p className="st-sub">Builders can change apps. Viewers can look and comment.</p>
        <form className="row wrap" style={{ gap: 8 }} onSubmit={invite}>
          <label className="sr-only" htmlFor="invite">Email to invite</label>
          <input
            id="invite"
            className="input grow"
            style={{ minWidth: 200 }}
            type="email"
            placeholder="teammate@glowandco.in"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErr('')
            }}
          />
          <label className="sr-only" htmlFor="invite-role">Role</label>
          <select id="invite-role" className="select" style={{ width: 120 }} value={role} onChange={(e) => setRole(e.target.value as Member['role'])}>
            <option>Builder</option>
            <option>Viewer</option>
          </select>
          <button className="btn" type="submit" disabled={!email.trim()}>
            <Icon name="mail" size={14} /> Invite
          </button>
        </form>
        {err && <p style={{ color: 'var(--red-text)', fontSize: 13 }}>{err}</p>}
        <div className="sheet">
          {team.map((m, i) => (
            <div key={m.email} className="row" style={{ gap: 12, padding: '12px 16px', borderBottom: i < team.length - 1 ? '1px solid var(--rule)' : undefined }}>
              <Avatar name={m.email} size={28} />
              <span className="grow" style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.email}
                {m.pending && <span className="muted" style={{ fontSize: 12 }}> · invite sent</span>}
              </span>
              {m.role === 'Owner' ? (
                <span className="badge badge-ink">Owner</span>
              ) : (
                <>
                  <label className="sr-only" htmlFor={'role-' + i}>Role for {m.email}</label>
                  <select
                    id={'role-' + i}
                    className="select"
                    style={{ width: 110, padding: '5px 8px', fontSize: 12.5 }}
                    value={m.role}
                    onChange={(e) => setTeam((t) => t.map((x) => (x.email === m.email ? { ...x, role: e.target.value as Member['role'] } : x)))}
                  >
                    <option>Builder</option>
                    <option>Viewer</option>
                  </select>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    aria-label={'Remove ' + m.email}
                    onClick={() => {
                      setTeam((t) => t.filter((x) => x.email !== m.email))
                      toast(`${m.email} removed.`)
                    }}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      <section className="st-sec">
        <h2 style={{ color: 'var(--red-text)' }}>Delete account</h2>
        <p className="st-sub">Deletes your projects, keys and history. Live apps go offline.</p>
        <button className="btn btn-line" style={{ justifySelf: 'start', color: 'var(--red-text)', borderColor: 'var(--red)' }} onClick={() => setConfirm(true)}>
          Delete my account
        </button>
      </section>

      {confirm && (
        <Modal
          title="Delete your account?"
          sub="This can’t be undone."
          onClose={() => {
            setConfirm(false)
            setTyped('')
          }}
          foot={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Keep my account</button>
              <button
                className="btn btn-red"
                disabled={typed.trim().toLowerCase() !== 'delete'}
                onClick={async () => {
                  projects.forEach((p) => deleteProject(p.id))
                  await signOut()
                  toast('Account deleted. Everything is gone.')
                  nav('/')
                }}
              >
                Delete everything
              </button>
            </>
          }
        >
          <div className="col" style={{ gap: 12 }}>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, display: 'grid', gap: 4 }}>
              <li>{projects.length} {projects.length === 1 ? 'project' : 'projects'}, with every revision</li>
              <li>Your API keys, wiped from the vault</li>
              <li>Any live app goes offline straight away</li>
            </ul>
            <label className="field">
              <span>Type “delete” to confirm</span>
              <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
            </label>
          </div>
        </Modal>
      )}
    </>
  )
}
