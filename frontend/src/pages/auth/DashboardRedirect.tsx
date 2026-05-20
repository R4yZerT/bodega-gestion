import { useAuth } from '../../contexts'
import { Navigate } from 'react-router-dom'

export function DashboardRedirect() {
  const { perfil, isAdmin, isSeguridad } = useAuth()

  if (isAdmin) return <Navigate to="/admin" replace />
  if (isSeguridad) return <Navigate to="/seguridad" replace />
  return <Navigate to="/cliente" replace />
}

export function UnauthorizedPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>403</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        No tienes permisos para acceder a esta página.
      </p>
      <a href="/" className="btn btn-primary mt-2">
        Volver al inicio
      </a>
    </div>
  )
}