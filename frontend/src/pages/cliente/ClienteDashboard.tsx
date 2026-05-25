import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { Layout } from '../../components/layout/Layout'
import { dashboardApi } from '../../api/services'
import type { DashboardUsuario } from '../../types'
import { Package, AlertTriangle, BarChart3, Bell } from 'lucide-react'

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

  if (!data) {
    return (
      <Layout>
        <p className="text-danger">Error al cargar datos</p>
      </Layout>
    )
  }

  const tieneAlertas = (data.alertasStock && data.alertasStock.length > 0)
    || (data.bodegasCercanasLimite && data.bodegasCercanasLimite.length > 0)

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

      {tieneAlertas && (
        <div className="card mb-3" style={{ borderLeft: '4px solid var(--danger)', background: '#fef2f2' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--danger)" />
            Alertas
          </h3>
          {data.alertasStock && data.alertasStock.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Stock bajo mínimo:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {data.alertasStock.map(o => (
                  <span key={o.id} className="badge badge-danger">
                    {o.nombre}: {o.cantidad} ({o.stockMinimo})
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.bodegasCercanasLimite && data.bodegasCercanasLimite.length > 0 && (
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Bodegas cerca del límite (&gt;80%):
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {data.bodegasCercanasLimite.map(b => (
                  <span key={b.id} className="badge badge-warning">
                    {b.nombre}: {b.porcentajeOcupacion?.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {data.ultimosMovimientos && data.ultimosMovimientos.length > 0 && (
        <div className="card mt-3">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            Últimos movimientos
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th><th>Objeto</th><th>Bodega</th><th>Cant.</th><th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.ultimosMovimientos.map(m => (
                  <tr key={m.id}>
                    <td>
                      <span className={`badge ${m.tipo === 'ENTRADA' ? 'badge-success' : 'badge-warning'}`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td>{m.objetoNombre}</td>
                    <td>{m.bodegaNombre}</td>
                    <td>{m.cantidad}</td>
                    <td>{new Date(m.fechaMovimiento).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card mt-3">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Accesos rápidos
        </h2>
        <div className="grid grid-3">
          <Link to="/cliente/objetos" className="btn btn-primary">Mis Objetos</Link>
          <Link to="/cliente/movimientos" className="btn btn-secondary">Movimientos</Link>
          <Link to="/cliente/bodegas" className="btn btn-secondary">Mis Bodegas</Link>
        </div>
      </div>
    </Layout>
  )
}