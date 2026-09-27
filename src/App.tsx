import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { StoreProvider, useStore } from './lib/store'
import { Toasts } from './components/ui'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import ImportProject from './pages/ImportProject'
import Brief from './pages/Brief'
import Blueprint from './pages/Blueprint'
import Workspace from './pages/workspace/Workspace'
import Launch from './pages/Launch'
import Skills from './pages/Skills'
import Settings from './pages/Settings'
import Architecture from './pages/Architecture'

function RequireUser({ children }: { children: React.ReactNode }) {
  const { user } = useStore()
  const loc = useLocation()
  if (!user) return <Navigate to={'/login?next=' + encodeURIComponent(loc.pathname)} replace />
  return <>{children}</>
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollTop />
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
        <Toasts />
      </HashRouter>
    </StoreProvider>
  )
}
