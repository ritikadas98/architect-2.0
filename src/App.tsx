import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { StoreProvider, useStore } from './lib/store'
import { Toasts } from './components/ui'
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Welcome = lazy(() => import('./pages/Welcome'))
const Home = lazy(() => import('./pages/Home'))
const ImportProject = lazy(() => import('./pages/ImportProject'))
const Brief = lazy(() => import('./pages/Brief'))
const Blueprint = lazy(() => import('./pages/Blueprint'))
const Workspace = lazy(() => import('./pages/workspace/Workspace'))
const Launch = lazy(() => import('./pages/Launch'))
const Skills = lazy(() => import('./pages/Skills'))
const Settings = lazy(() => import('./pages/Settings'))
const Architecture = lazy(() => import('./pages/Architecture'))

function RequireUser({ children }: { children: React.ReactNode }) {
  const { user } = useStore()
  const loc = useLocation()
  if (!user) return <Navigate to={'/login?next=' + encodeURIComponent(loc.pathname)} replace />
  return <>{children}</>
}

/** After a real OAuth round-trip we land on the app root; send the user where they were heading. */
function AfterLogin() {
  const { user } = useStore()
  const nav = useNavigate()
  useEffect(() => {
    if (!user?.real) return
    try {
      const to = sessionStorage.getItem('a2:after-login')
      if (to) {
        sessionStorage.removeItem('a2:after-login')
        nav(to, { replace: true })
      }
    } catch {
      /* ignore */
    }
  }, [user?.real]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollTop />
        <AfterLogin />
        <Suspense fallback={<div className="grid-bg" style={{ minHeight: '100%' }} />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/welcome" element={<RequireUser><Welcome /></RequireUser>} />
          <Route path="/home" element={<RequireUser><Home /></RequireUser>} />
          <Route path="/import" element={<RequireUser><ImportProject /></RequireUser>} />
          <Route path="/skills" element={<RequireUser><Skills /></RequireUser>} />
          <Route path="/settings" element={<Navigate to="/settings/models" replace />} />
          <Route path="/settings/:tab" element={<RequireUser><Settings /></RequireUser>} />
          <Route path="/p/:id/brief" element={<RequireUser><Brief /></RequireUser>} />
          <Route path="/p/:id/blueprint" element={<RequireUser><Blueprint /></RequireUser>} />
          <Route path="/p/:id/launch" element={<RequireUser><Launch /></RequireUser>} />
          <Route path="/p/:id" element={<RequireUser><Workspace /></RequireUser>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
        <Toasts />
      </HashRouter>
    </StoreProvider>
  )
}
