import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts'
import { ProtectedRoute, PublicRoute } from './components/ui/ProtectedRoute'
import './styles/global.css'

// Lazy loaded pages
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage').then(module => ({ default: module.LoginPage })))
const DashboardRedirect = React.lazy(() => import('./pages/auth/DashboardRedirect').then(module => ({ default: module.DashboardRedirect })))
const UnauthorizedPage = React.lazy(() => import('./pages/auth/DashboardRedirect').then(module => ({ default: module.UnauthorizedPage })))
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const BodegasPage = React.lazy(() => import('./pages/admin/BodegasPage').then(module => ({ default: module.BodegasPage })))
const ContratosPage = React.lazy(() => import('./pages/admin/ContratosPage').then(module => ({ default: module.ContratosPage })))
const AuditPage = React.lazy(() => import('./pages/admin/AuditPage').then(module => ({ default: module.AuditPage })))
const ClienteDashboard = React.lazy(() => import('./pages/cliente/ClienteDashboard').then(module => ({ default: module.ClienteDashboard })))
const ClienteObjetosPage = React.lazy(() => import('./pages/cliente/ClienteObjetosPage').then(module => ({ default: module.ClienteObjetosPage })))
const ClienteMovimientosPage = React.lazy(() => import('./pages/cliente/ClienteMovimientosPage').then(module => ({ default: module.ClienteMovimientosPage })))
const ClienteBodegasPage = React.lazy(() => import('./pages/cliente/ClienteBodegasPage').then(module => ({ default: module.ClienteBodegasPage })))
const SeguridadDashboard = React.lazy(() => import('./pages/seguridad/SeguridadDashboard').then(module => ({ default: module.SeguridadDashboard })))

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Cargando...</div>}>
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
              path="/cliente/objetos"
              element={
                <ProtectedRoute>
                  <ClienteObjetosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cliente/movimientos"
              element={
                <ProtectedRoute>
                  <ClienteMovimientosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cliente/bodegas"
              element={
                <ProtectedRoute>
                  <ClienteBodegasPage />
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App