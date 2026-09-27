import { NavLink, Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Icon, type IconName } from '../components/Icon'
import { ModelsTab } from './settings/ModelsTab'
import { UsageTab } from './settings/UsageTab'
import { KeysTab } from './settings/KeysTab'
import { AccountTab } from './settings/AccountTab'
import { settingsCss } from './settings/settingsCss'

const TABS: { id: string; label: string; icon: IconName }[] = [
  { id: 'models', label: 'Models', icon: 'cpu' },
  { id: 'usage', label: 'Usage & credits', icon: 'coin' },
  { id: 'keys', label: 'API keys', icon: 'key' },
  { id: 'account', label: 'Account', icon: 'user' },
]

export default function Settings() {
  const { tab } = useParams()
  if (!TABS.some((t) => t.id === tab)) return <Navigate to="/settings/models" replace />
  return (
    <AppShell>
      <style>{settingsCss}</style>
      <div className="page st-wrap">
        <aside className="st-nav">
          <span className="label st-nav-label">Settings</span>
          <nav className="st-nav-list" aria-label="Settings sections">
            {TABS.map((t) => (
              <NavLink key={t.id} to={`/settings/${t.id}`} className={({ isActive }) => 'st-nav-item' + (isActive ? ' is-on' : '')}>
                <Icon name={t.icon} size={15} />
                {t.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="st-main" key={tab}>
          {tab === 'models' && <ModelsTab />}
          {tab === 'usage' && <UsageTab />}
          {tab === 'keys' && <KeysTab />}
          {tab === 'account' && <AccountTab />}
        </main>
      </div>
    </AppShell>
  )
}
