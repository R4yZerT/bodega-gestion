import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { LogOut, Package, User, Shield, FileText, ClipboardList } from 'lucide-react'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { perfil, signOut, isAdmin, isSeguridad } = useAuth()

  const getDashboardPath = () => {
    if (isAdmin) return '/admin'
    if (isSeguridad) return '/seguridad'
    return '/cliente'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          background: 'white',
          borderBottom: '1px solid var(--border)',
          padding: '0 1.5rem',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={28} color="var(--primary)" />
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              BodegaGestión
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {isAdmin && (
              <>
                <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <Shield size={16} /> Admin
                </Link>
                <Link to="/admin/bodegas" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <Package size={16} /> Bodegas
                </Link>
                <Link to="/admin/contratos" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <FileText size={16} /> Contratos
                </Link>
                <Link to="/admin/audit" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <ClipboardList size={16} /> Auditoría
                </Link>
              </>
            )}
            {isSeguridad && (
              <>
                <Link to="/seguridad" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <Shield size={16} /> Seguridad
                </Link>
                <Link to="/seguridad/inventario" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                  <Package size={16} /> Inventario
                </Link>
              </>
            )}
            {!isAdmin && !isSeguridad && (
              <Link to="/cliente" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                <Package size={16} /> Mis Bodegas
              </Link>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <User size={16} color="var(--primary)" />
              {perfil?.nombreCompleto || perfil?.email}
              <span
                className={`badge ${isAdmin ? 'badge-danger' : isSeguridad ? 'badge-warning' : 'badge-info'}`}
              >
                {perfil?.rol || 'USUARIO'}
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={signOut}>
              <LogOut size={16} />
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main
        className="container"
        style={{ flex: 1, padding: '2rem 1.5rem' }}
      >
        {children}
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}
      >
        BodegaGestión &copy; {new Date().getFullYear()} — Bodegas YEIJU
      </footer>
    </div>
  )
}