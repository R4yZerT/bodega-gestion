import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { objetoApi } from '../../api/services'
import type { ObjetoResponse } from '../../types'
import { Package, FileText } from 'lucide-react'

export function ClienteObjetosPage() {
  const [objetos, setObjetos] = useState<ObjetoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadObjetos = () => {
    setLoading(true)
    setError(null)
    objetoApi.misObjetos()
      .then((res) => setObjetos(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar objetos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadObjetos() }, [])

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Package size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Mis Objetos
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Consulta de tus objetos almacenados.
          </p>
        </div>
        <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
          <FileText size={14} /> Solo lectura
        </span>
      </div>

      {loading ? <p>Cargando...</p> : error ? (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={loadObjetos}>Reintentar</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Cant.</th>
                  <th>Dim. (cm)</th>
                  <th>Vol. (m³)</th>
                  <th>Bodega</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {objetos.length === 0 ? (
                  <tr><td colSpan={7} className="text-secondary" style={{ textAlign: 'center' }}>No tienes objetos registrados</td></tr>
                ) : objetos.map(o => (
                  <tr key={o.id} style={{ background: o.bajoStockMinimo ? '#fef2f2' : 'inherit' }}>
                    <td>{o.id}</td>
                    <td>{o.nombre}</td>
                    <td>{o.cantidad}</td>
                    <td>{o.largoCm && o.anchoCm && o.altoCm ? `${o.largoCm}x${o.anchoCm}x${o.altoCm}` : '-'}</td>
                    <td>{o.volumenTotalM3?.toFixed(4) || '0'}</td>
                    <td>{o.bodegaNombre}</td>
                    <td>
                      {o.bajoStockMinimo ? (
                        <span className="badge badge-danger">Bajo ({o.stockMinimo})</span>
                      ) : o.stockMinimo ? (
                        <span className="badge badge-success">OK</span>
                      ) : '-'}
                    </td>
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
