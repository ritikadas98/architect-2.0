import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Avatar, CreditsPill, Logo, ThemeToggle } from './ui'
import { Icon } from './Icon'
import { useStore } from '../lib/store'
import { hasBackend } from '../lib/supabase'

/** Top bar for everything outside a project: projects, skills, settings. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useStore()
  const [menu, setMenu] = useState(false)
  const nav = useNavigate()
  return (
    <div className="grid-bg" style={{ minHeight: '100%' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          height: 'var(--topbar-h)',
          background: 'color-mix(in srgb, var(--paper) 88%, transparent)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div className="row between" style={{ height: '100%', maxWidth: 1240, margin: '0 auto', padding: '0 16px' }}>
          <div className="row" style={{ gap: 18 }}>
            <Link to="/home" style={{ textDecoration: 'none' }} aria-label="Architect home">
              <Logo />
            </Link>
            <nav className="row app-nav" style={{ gap: 2 }}>
              <NavLink to="/home" className={({ isActive }) => 'btn btn-ghost btn-sm' + (isActive ? ' is-active' : '')}>
                Projects
              </NavLink>
              <NavLink to="/skills" className={({ isActive }) => 'btn btn-ghost btn-sm' + (isActive ? ' is-active' : '')}>
                Skills
              </NavLink>
              <NavLink
                to="/settings/models"
                className={({ isActive }) => 'btn btn-ghost btn-sm' + (isActive ? ' is-active' : '')}
              >
                Models & usage
              </NavLink>
            </nav>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <CreditsPill />
            <ThemeToggle />
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: 2, height: 32 }}
                onClick={() => setMenu((m) => !m)}
                aria-label="Account menu"
              >
                <Avatar name={user?.name || 'You'} />
              </button>
              {menu && (
                <div
                  className="sheet-ink col"
                  style={{ position: 'absolute', right: 0, top: 40, width: 240, padding: 6, gap: 2, boxShadow: 'var(--shadow-hard)' }}
                  onMouseLeave={() => setMenu(false)}
                >
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700 }}>{user?.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{user?.email}</div>
                    <div className="row" style={{ marginTop: 6 }}>
                      {user?.real ? (
                        <span className="badge badge-green">Signed in with {user.provider}</span>
                      ) : (
                        <span className="badge badge-amber" title={hasBackend ? '' : 'No backend configured for this build'}>
                          Demo account
                        </span>
                      )}
                    </div>
                  </div>
                  <hr className="divider" />
                  <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => nav('/settings/account')}>
                    <Icon name="user" size={14} /> Account
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => nav('/architecture')}>
                    <Icon name="layers" size={14} /> How Architect is built
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={async () => {
                      await signOut()
                      nav('/')
                    }}
                  >
                    <Icon name="logout" size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <style>{`
        .app-nav .is-active { background: var(--paper-2); }
        @media (max-width: 720px) { .app-nav { display: none !important; } }
      `}</style>
      {children}
    </div>
  )
}
