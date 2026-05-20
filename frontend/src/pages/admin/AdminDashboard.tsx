import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { Layout } from '../../components/layout/Layout'
import { dashboardApi } from '../../api/services'
import type { DashboardAdmin } from '../../types'
import { Warehouse, TrendingUp, Users, AlertCircle } from 'lucide-react'

export function AdminDashboard() {
  const { perfil } = useAuth()
  const [data, setData] = useState<DashboardAdmin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.admin()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <p>Cargando dashboard...</p>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout>
        <p className="text-danger">Error al cargar datos del dashboard</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Panel de Administración
        </h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Bienvenido, {perfil?.nombreCompleto || perfil?.email}
        </p>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Warehouse size={20} color="var(--primary)" />
            <span className="stat-label">Total Bodegas</span>
          </div>
          <div className="stat-value">{data.totalBodegas}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
            <span className="stat-label">Libres</span>
          </div>
          <div className="stat-value text-success">{data.bodegasLibres}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--warning)" />
            <span className="stat-label">En Uso</span>
          </div>
          <div className="stat-value text-warning">{data.bodegasEnUso}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="var(--primary)" />
            <span className="stat-label">Ocupación Global</span>
          </div>
          <div className="stat-value">{data.ocupacionGlobalPorcentaje?.toFixed(1) ?? 0}%</div>
        </div>
      </div>

      <div className="card mt-3">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Accesos rápidos
        </h2>
        <div className="grid grid-3">
          <Link to="/admin/bodegas" className="btn btn-primary">Gestionar Bodegas</Link>
          <Link to="/admin/contratos" className="btn btn-secondary">Ver Contratos</Link>
          <Link to="/admin/audit" className="btn btn-secondary">Logs de Auditoría</Link>
        </div>
      </div>
    </Layout>
  )
}