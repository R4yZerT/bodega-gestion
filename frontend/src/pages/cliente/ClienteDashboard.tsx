import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts'
import { Layout } from '../../components/layout/Layout'
import { dashboardApi } from '../../api/services'
import type { DashboardUsuario } from '../../types'
import { Package, AlertTriangle, BarChart3 } from 'lucide-react'

export function ClienteDashboard() {
  const { perfil } = useAuth()
  const [data, setData] = useState<DashboardUsuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.usuario()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <p>Cargando panel...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Mi Panel
        </h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Hola, {perfil?.nombreCompleto || perfil?.email}
        </p>
      </div>

      <div className="grid grid-4">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--primary)" />
            <span className="stat-label">Mis Objetos</span>
          </div>
          <div className="stat-value">{data?.totalObjetos ?? 0}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--warning)" />
            <span className="stat-label">Bajo Stock</span>
          </div>
          <div className="stat-value text-warning">{data?.objetosBajoStock ?? 0}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="var(--success)" />
            <span className="stat-label">Ocupación</span>
          </div>
          <div className="stat-value text-success">
            {data?.porcentajeOcupacionUsuario?.toFixed(1) ?? 0}%
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--secondary)" />
            <span className="stat-label">Volumen Total</span>
          </div>
          <div className="stat-value">{data?.volumenTotalM3?.toFixed(2) ?? 0} m³</div>
        </div>
      </div>

      <div className="card mt-3">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Accesos rápidos
        </h2>
        <div className="grid grid-3">
          <a href="/cliente/objetos" className="btn btn-primary">Mis Objetos</a>
          <a href="/cliente/movimientos" className="btn btn-secondary">Movimientos</a>
          <a href="/cliente/bodegas" className="btn btn-secondary">Mis Bodegas</a>
        </div>
      </div>
    </Layout>
  )
}