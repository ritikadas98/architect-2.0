import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Logo, ThemeToggle } from '../components/ui'
import { Icon } from '../components/Icon'
import { useStore, uid } from '../lib/store'
import { hasBackend, redirectUrl, supabase } from '../lib/supabase'

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function Login() {
  const { user, setUser, projects } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/home'
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const firstTime = projects.length === 0
  const after = firstTime ? '/welcome?next=' + encodeURIComponent(next) : next

  useEffect(() => {
    if (user) nav(after, { replace: true })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const demo = (provider: 'google' | 'github' | 'email', name = 'Ritika Das', mail = 'ritika@example.com') => {
    setBusy(provider)
    setTimeout(() => {
      setUser({ id: 'demo-' + uid(), name, email: mail, provider: 'demo', real: false })
    }, 650)
  }

  const oauth = async (provider: 'google' | 'github') => {
    setErr(null)
    if (!supabase) return demo(provider)
    setBusy(provider)
    try {
      sessionStorage.setItem('a2:after-login', after)
    } catch {
      /* ignore */
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectUrl() } })
    if (error) {
      setBusy(null)
      setErr(`${provider === 'google' ? 'Google' : 'GitHub'} sign-in isn't switched on yet. Try email, or the demo.`)
    }
  }

  const magic = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('That email looks off. One more look?')
    if (!supabase) return demo('email', email.split('@')[0], email)
    setBusy('email')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectUrl() } })
    setBusy(null)
    if (error) setErr(error.message)
    else setSent(true)
  }

  return (
    <div className="grid-bg lg">
      <style>{css}</style>
      <header className="row between" style={{ padding: '14px 16px', maxWidth: 1120, margin: '0 auto' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="lg-main">
        <div className="lg-card sheet-ink">
          <span className="label">Sign in</span>
          <h1 className="lg-h">Let's get you building.</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            New here? Same buttons. We'll set you up.
          </p>

          {sent ? (
            <div className="lg-sent rise">
              <Icon name="mail" size={20} />
              <div>
                <div style={{ fontWeight: 700 }}>Check {email}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Tap the link in that email. You can close this tab.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="col" style={{ gap: 8, marginTop: 22 }}>
                <button className="btn btn-lg lg-oauth" onClick={() => oauth('google')} disabled={!!busy}>
                  {busy === 'google' ? <span className="spinner" /> : <GoogleMark />} Continue with Google
                </button>
                <button className="btn btn-lg lg-oauth" onClick={() => oauth('github')} disabled={!!busy}>
                  {busy === 'github' ? <span className="spinner" /> : <Icon name="github" size={17} />} Continue with GitHub
                </button>
              </div>

              <div className="lg-or">
                <span>or</span>
              </div>

              <form onSubmit={magic} className="col" style={{ gap: 8 }}>
                <label className="field">
                  <span>Work email</span>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </label>
                <button className="btn btn-primary btn-lg" type="submit" disabled={!!busy}>
                  {busy === 'email' ? <span className="spinner" /> : <Icon name="mail" size={15} />} Email me a sign-in link
                </button>
              </form>
            </>
          )}

          {err && (
            <p className="lg-err" role="alert">
              {err}
            </p>
          )}

          <hr className="divider" style={{ margin: '20px 0 14px' }} />
          {hasBackend ? (
            <p className="muted" style={{ fontSize: 12.5 }}>
              Real sign-in. Your projects are saved to your account.{' '}
              <button className="lg-link" onClick={() => demo('email', 'Guest', 'guest@example.com')}>
                Just looking? Use a demo account.
              </button>
            </p>
          ) : (
            <p className="muted" style={{ fontSize: 12.5 }}>
              <span className="badge badge-amber" style={{ marginRight: 6 }}>
                Demo
              </span>
              This build has no sign-in server, so every button signs you in to a demo account. Projects stay in this
              browser.
            </p>
          )}
        </div>

        <aside className="lg-side">
          <div className="titleblock" style={{ ['--cols' as string]: 2 }}>
            <div>
              <span className="label">Project</span>
              <b>Your next app</b>
            </div>
            <div>
              <span className="label">Drawn by</span>
              <b>You + Architect</b>
            </div>
          </div>
          <ol className="lg-list">
            <li>
              <b>A brief.</b> It reads your screenshots and asks five questions.
            </li>
            <li>
              <b>A blueprint.</b> Pages, agents, cost. You stamp it.
            </li>
            <li>
              <b>A build you can watch.</b> Its own bugs are free.
            </li>
            <li>
              <b>An inspection.</b> Security, in plain words.
            </li>
            <li>
              <b>Launch.</b> Your domain, your GitHub.
            </li>
          </ol>
        </aside>
      </main>
    </div>
  )
}

const css = `
.lg { min-height: 100%; }
.lg-main { max-width: 980px; margin: 0 auto; padding: 32px 16px 64px; display: grid; grid-template-columns: minmax(0, 440px) 1fr; gap: 56px; align-items: center; }
.lg-card { padding: 28px; box-shadow: var(--shadow-hard); }
.lg-h { font-size: 30px; font-stretch: 118%; margin-top: 8px; }
.lg-oauth { justify-content: flex-start; background: var(--sheet); border-color: var(--rule-strong); }
.lg-oauth:hover { border-color: var(--ink); }
.lg-or { display: flex; align-items: center; gap: 10px; margin: 18px 0; color: var(--ink-3); font-size: 12px; }
.lg-or::before, .lg-or::after { content: ''; flex: 1; height: 1px; background: var(--rule); }
.lg-err { margin-top: 12px; color: var(--red-text); font-size: 13px; font-weight: 600; }
.lg-sent { display: flex; gap: 12px; margin-top: 22px; padding: 14px; border: 1.5px dashed var(--blue); border-radius: var(--r-sm); background: var(--blue-wash); }
.lg-link { border: 0; background: none; padding: 0; color: var(--ink); text-decoration: underline; font-size: inherit; }
.lg-side { display: grid; gap: 18px; justify-items: start; }
.lg-list { margin: 0; padding-left: 20px; display: grid; gap: 12px; color: var(--ink-2); font-size: 15px; }
.lg-list li::marker { font-family: var(--font-mono); color: var(--red-text); font-weight: 700; }
@media (max-width: 820px) { .lg-main { grid-template-columns: 1fr; gap: 28px; } .lg-card { padding: 20px; } }
`
