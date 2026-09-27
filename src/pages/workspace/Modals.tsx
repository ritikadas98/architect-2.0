import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Avatar, Modal } from '../../components/ui'
import { useStore, type Project } from '../../lib/store'
import { copyText } from './wsState'

/* ------------------------------ GitHub ------------------------------ */

type GhStep = 'intro' | 'consent' | 'repo' | 'sync' | 'done'

export function GitHubModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { updateProject, toast, mode, user } = useStore()
  const [step, setStep] = useState<GhStep>(project.github ? 'done' : 'intro')
  const [busy, setBusy] = useState(false)
  const handle = (user?.name || 'ritika').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const [owner, setOwner] = useState('glow-and-co')
  const [kind, setKind] = useState<'new' | 'existing'>('new')
  const [name, setName] = useState('glow-support')
  const [existing, setExisting] = useState('glow-and-co/storefront')
  const [priv, setPriv] = useState(true)
  const [autosave, setAutosave] = useState(true)
  const [prs, setPrs] = useState(project.github?.prs ?? mode === 'dev')
  const [branch, setBranch] = useState(project.github?.branch || 'main')
  const repo = project.github?.repo || (kind === 'new' ? `${owner}/${name}` : existing)
  const nameOk = /^[a-z0-9._-]{1,60}$/i.test(name)

  const wait = (fn: () => void, ms = 900) => {
    setBusy(true)
    window.setTimeout(() => {
      setBusy(false)
      fn()
    }, ms)
  }

  const stepNo = { intro: 0, consent: 0, repo: 1, sync: 2, done: 3 }[step]
  const sub = (
    <span className="row" style={{ gap: 4 }}>
      {['Install', 'Repo', 'Sync', 'Connected'].map((s, i) => (
        <span key={s} className={'ws-ghstep' + (i <= stepNo ? ' is-on' : '')}>{s}</span>
      ))}
    </span>
  )

  let body: React.ReactNode
  let foot: React.ReactNode
  if (step === 'intro') {
    body = (
      <div className="col" style={{ gap: 12 }}>
        <p>Keep a copy of your app’s code on GitHub, updated every time it changes.</p>
        <p className="muted" style={{ fontSize: 13 }}>Useful if a developer joins later, or you want to leave. It’s your code either way.</p>
      </div>
    )
    foot = (
      <>
        <button className="btn btn-ghost" onClick={onClose}>Not now</button>
        <button className="btn btn-primary" onClick={() => setStep('consent')}>
          <Icon name="github" size={14} /> Install the Architect GitHub App
        </button>
      </>
    )
  } else if (step === 'consent') {
    body = (
      <div className="ws-consent">
        <div className="row" style={{ gap: 10, marginBottom: 12 }}>
          <span className="ws-consent-logo"><Icon name="github" size={20} /></span>
          <div>
            <strong>github.com</strong>
            <div className="muted" style={{ fontSize: 12.5 }}>Architect wants to be installed on your account</div>
          </div>
        </div>
        <ul className="ws-scopes">
          <li><Icon name="check" size={14} /> Only the repos you pick</li>
          <li><Icon name="check" size={14} /> Read & write code</li>
          <li className="is-no"><Icon name="x" size={14} /> No access to anything else</li>
        </ul>
        <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>You can uninstall it from GitHub settings any time.</p>
      </div>
    )
    foot = (
      <>
        <button className="btn btn-ghost" onClick={() => setStep('intro')}>Back</button>
        <button className="btn btn-primary" disabled={busy} onClick={() => wait(() => setStep('repo'))}>
          {busy ? <span className="spinner" /> : <Icon name="check" size={14} />} {busy ? 'Installing…' : 'Install & authorise'}
        </button>
      </>
    )
  } else if (step === 'repo') {
    body = (
      <div className="col" style={{ gap: 14 }}>
        <label className="field">
          <span>Account or organisation</span>
          <select className="select" value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="glow-and-co">glow-and-co (organisation)</option>
            <option value={handle}>{handle} (you)</option>
          </select>
        </label>
        <div className="seg" role="group" aria-label="Repository">
          <button className={kind === 'new' ? 'is-on' : ''} onClick={() => setKind('new')}>Create new repo</button>
          <button className={kind === 'existing' ? 'is-on' : ''} onClick={() => setKind('existing')}>Use existing</button>
        </div>
        {kind === 'new' ? (
          <>
            <label className="field">
              <span>Repo name</span>
              <input className="input mono" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!nameOk} />
              {!nameOk && <small style={{ color: 'var(--red-text)' }}>Letters, numbers, dashes and dots only.</small>}
            </label>
            <div className="seg" role="group" aria-label="Visibility">
              <button className={priv ? 'is-on' : ''} onClick={() => setPriv(true)}><Icon name="lock" size={12} /> Private</button>
              <button className={!priv ? 'is-on' : ''} onClick={() => setPriv(false)}><Icon name="globe" size={12} /> Public</button>
            </div>
            {!priv && <p style={{ fontSize: 12.5, color: 'var(--amber)' }}>Anyone can read public code. Your keys stay in the vault, not the repo.</p>}
          </>
        ) : (
          <label className="field">
            <span>Repository</span>
            <select className="select mono" value={existing} onChange={(e) => setExisting(e.target.value)}>
              <option>{owner}/storefront</option>
              <option>{owner}/support-bot-old</option>
            </select>
            <small className="muted">I’ll add the app in a new folder. Nothing else in the repo changes.</small>
          </label>
        )}
      </div>
    )
    foot = (
      <>
        <button className="btn btn-ghost" onClick={() => setStep('consent')}>Back</button>
        <button className="btn btn-primary" disabled={kind === 'new' && !nameOk} onClick={() => setStep('sync')}>
          Next <Icon name="arrow" size={14} />
        </button>
      </>
    )
  } else if (step === 'sync') {
    body = (
      <div className="col" style={{ gap: 12 }}>
        <label className="ws-toggle">
          <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} />
          <span>
            <strong>Save every change to GitHub</strong>
            <small className="muted">Each revision becomes a commit.</small>
          </span>
        </label>
        <label className="ws-toggle">
          <input type="checkbox" checked={prs} onChange={(e) => setPrs(e.target.checked)} />
          <span>
            <strong>Open a pull request instead of pushing to main</strong>
            <small className="muted">For teams who review code. Your developer approves it on GitHub.</small>
          </span>
        </label>
        <label className="field">
          <span>Branch</span>
          <select className="select mono" value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option>main</option>
            <option>architect</option>
            <option>develop</option>
          </select>
        </label>
      </div>
    )
    foot = (
      <>
        <button className="btn btn-ghost" onClick={() => setStep('repo')}>Back</button>
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={() =>
            wait(() => {
              updateProject(project.id, { github: { repo, branch, prs } })
              toast(`Connected to ${repo}. First commit pushed.`)
              setStep('done')
            }, 1200)
          }
        >
          {busy ? <span className="spinner" /> : <Icon name="github" size={14} />} {busy ? 'Pushing your code…' : 'Connect'}
        </button>
      </>
    )
  } else {
    const gh = project.github || { repo, branch, prs }
    body = (
      <div className="col" style={{ gap: 14 }}>
        <div className="sheet" style={{ padding: 14 }}>
          <div className="row between wrap" style={{ gap: 8 }}>
            <a className="mono row" style={{ gap: 6, fontWeight: 600 }} href={`https://github.com/${gh.repo}`} target="_blank" rel="noreferrer">
              <Icon name="github" size={14} /> {gh.repo}
            </a>
            <span className="badge badge-blue"><span className="dot" /> Synced</span>
          </div>
          <div className="row muted wrap" style={{ gap: 10, fontSize: 12.5, marginTop: 8 }}>
            <span className="row" style={{ gap: 4 }}><Icon name="branch" size={12} /> {gh.branch}</span>
            <span className="row" style={{ gap: 4 }}><Icon name={gh.prs ? 'pr' : 'upload'} size={12} /> {gh.prs ? 'Opens pull requests' : 'Pushes directly'}</span>
          </div>
          <div className="divider" style={{ margin: '10px 0' }} />
          <div className="label">Last commit</div>
          <div className="mono" style={{ fontSize: 12.5 }}>architect: Refund limit enforced in code · 2m ago</div>
        </div>
        <div className="row wrap" style={{ gap: 6 }}>
          <button className="btn btn-sm btn-line" disabled={busy} onClick={() => wait(() => toast('Pulled. Already up to date.'), 700)}>
            <Icon name="download" size={13} /> Pull
          </button>
          <button className="btn btn-sm btn-line" disabled={busy} onClick={() => wait(() => toast(gh.prs ? 'Pull request #4 opened on GitHub.' : 'Pushed to ' + gh.branch + '.'), 700)}>
            <Icon name="upload" size={13} /> {gh.prs ? 'Open PR' : 'Push'}
          </button>
          {busy && <span className="spinner" />}
        </div>
        <p className="muted" style={{ fontSize: 12.5 }}>Edits made in GitHub or Cursor show up here automatically, as a new revision.</p>
      </div>
    )
    foot = (
      <>
        <button
          className="btn btn-ghost"
          onClick={() => {
            updateProject(project.id, { github: undefined })
            toast('Disconnected. The repo stays on GitHub.')
            onClose()
          }}
        >
          Disconnect
        </button>
        <button className="btn btn-primary" onClick={onClose}>Done</button>
      </>
    )
  }

  return (
    <Modal title="GitHub" sub={sub} onClose={onClose} foot={foot}>
      {body}
    </Modal>
  )
}

/* ------------------------------ Share ------------------------------ */

type Role = 'Owner' | 'Editor' | 'Viewer'

export function ShareModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { user, toast } = useStore()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('Editor')
  const [people, setPeople] = useState<{ email: string; role: Role }[]>([])
  const ok = /^\S+@\S+\.\S+$/.test(email.trim())
  const link = `https://architect.app/p/${project.id}?invite=view`
  const roleHint: Record<Role, string> = {
    Owner: 'Can launch, pay and delete',
    Editor: 'Can change the app, not launch it',
    Viewer: 'Can look and comment',
  }
  return (
    <Modal title={`Share ${project.name}`} sub="People you invite see the same project, in their own view." onClose={onClose}>
      <form
        className="col"
        style={{ gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!ok) return
          setPeople((p) => [...p, { email: email.trim(), role }])
          toast(`Invite sent to ${email.trim()}.`)
          setEmail('')
        }}
      >
        <div className="row" style={{ gap: 6, alignItems: 'stretch' }}>
          <input className="input grow" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email to invite" />
          <select className="select" style={{ width: 110 }} value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="Role">
            <option>Owner</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
          <button className="btn btn-primary" disabled={!ok}>Invite</button>
        </div>
        <small className="muted">{role}: {roleHint[role]}.</small>
      </form>
      <div className="col" style={{ gap: 8, marginTop: 16 }}>
        <div className="label">Who has access</div>
        <div className="row" style={{ gap: 10 }}>
          <Avatar name={user?.name || 'You'} size={26} />
          <span className="grow">{user?.name || 'You'} <span className="muted">(you)</span></span>
          <span className="badge">Owner</span>
        </div>
        {people.map((p) => (
          <div key={p.email} className="row" style={{ gap: 10 }}>
            <Avatar name={p.email} size={26} />
            <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</span>
            <span className="badge badge-amber">Invited · {p.role}</span>
          </div>
        ))}
      </div>
      <div className="divider" style={{ margin: '16px 0' }} />
      <div className="row" style={{ gap: 6 }}>
        <input className="input mono grow" readOnly value={link} aria-label="Share link" style={{ fontSize: 12 }} onFocus={(e) => e.target.select()} />
        <button
          className="btn btn-line"
          onClick={async () => toast((await copyText(link)) ? 'Link copied. Anyone with it can view.' : 'Couldn’t copy. Select the link and copy it.')}
        >
          <Icon name="copy" size={14} /> Copy link
        </button>
      </div>
    </Modal>
  )
}
