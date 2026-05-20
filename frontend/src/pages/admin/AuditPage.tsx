import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { auditApi } from '../../api/services'
import type { AuditLog } from '../../types'
import { ScrollText } from 'lucide-react'

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroTabla, setFiltroTabla] = useState('')

  const loadLogs = () => {
    setLoading(true)
    setError(null)
    const fetch = filtroTabla
      ? auditApi.porTabla(filtroTabla)
      : auditApi.listarTodos()
    fetch.then((res) => setLogs(res.data))
      .catch((err) => setError(err.response?.data?.error || err.response?.data?.message || 'Error al cargar logs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadLogs() }, [filtroTabla])

  const fmtDate = (d: string) => new Date(d).toLocaleString('es-CO')

  const tablas = ['usuario', 'bodega', 'zona', 'objeto', 'contrato', 'movimiento', 'acceso_persona']

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}><ScrollText size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Logs de Auditoría</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Registro de acciones del sistema</p>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span className="label" style={{ marginBottom: 0 }}>Filtrar por tabla:</span>
        <select className="input" style={{ width: 'auto' }} value={filtroTabla} onChange={e => setFiltroTabla(e.target.value)}>
          <option value="">Todas</option>
          {tablas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? <p>Cargando...</p> : error ? (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={loadLogs}>Reintentar</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Usuario</th><th>Acción</th><th>Tabla</th><th>Registro</th><th>IP</th><th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={7} className="text-secondary" style={{ textAlign: 'center' }}>Sin registros</td></tr>
                ) : logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td className="text-secondary" style={{ fontSize: '0.75rem' }}>{l.usuarioId ? l.usuarioId.substring(0, 8) + '...' : 'Sistema'}</td>
                    <td><span className={`badge ${l.accion?.startsWith('DELETE') ? 'badge-danger' : l.accion?.startsWith('CREATE') ? 'badge-success' : 'badge-info'}`}>{l.accion}</span></td>
                    <td>{l.tabla}</td>
                    <td>{l.registroId ?? '—'}</td>
                    <td className="text-secondary" style={{ fontSize: '0.75rem' }}>{l.ipOrigen ?? '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}