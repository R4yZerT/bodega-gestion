import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts'
import type { RolUsuario } from '../../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: RolUsuario[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, perfil, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles) {
    if (!perfil) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Cargando perfil...</p>
        </div>
      )
    }
    if (!roles.includes(perfil.rol)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}