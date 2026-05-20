import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts'
import { ProtectedRoute, PublicRoute } from './components/ui/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardRedirect, UnauthorizedPage } from './pages/auth/DashboardRedirect'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { BodegasPage } from './pages/admin/BodegasPage'
import { ContratosPage } from './pages/admin/ContratosPage'
import { AuditPage } from './pages/admin/AuditPage'
import { ClienteDashboard } from './pages/cliente/ClienteDashboard'
import { SeguridadDashboard } from './pages/seguridad/SeguridadDashboard'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bodegas"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <BodegasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contratos"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <ContratosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cliente"
            element={
              <ProtectedRoute>
                <ClienteDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seguridad"
            element={
              <ProtectedRoute roles={['ADMIN', 'SEGURIDAD']}>
                <SeguridadDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App