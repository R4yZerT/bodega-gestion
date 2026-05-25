import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { movimientoApi, objetoApi } from '../../api/services'
import type { MovimientoResponse } from '../../types'
import { ArrowDownToLine, ArrowUpFromLine, History, FileText } from 'lucide-react'

export function ClienteMovimientosPage() {
  const [movimientos, setMovimientos] = useState<MovimientoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    setError(null)
    objetoApi.misObjetos()
      .then((objRes) => {
        if (objRes.data.length === 0) {
          setMovimientos([])
          setLoading(false)
          return
        }
        const promesas = objRes.data.map(o => movimientoApi.porObjeto(o.id))
        return Promise.all(promesas)
      })
      .then((results) => {
        if (results) {
          const todos = results.flatMap(r => r.data)
          todos.sort((a, b) => new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime())
          setMovimientos(todos)
        }
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar movimientos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const formatoFecha = (f: string) => new Date(f).toLocaleString('es-CO')

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <History size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Movimientos
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Historial de entradas y salidas de tus objetos.
          </p>
        </div>
        <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
          <FileText size={14} /> Solo lectura
        </span>
      </div>

      {loading ? <p>Cargando...</p> : error ? (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Tipo</th><th>Objeto</th><th>Bodega</th><th>Cant.</th><th>Observaciones</th><th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr><td colSpan={7} className="text-secondary" style={{ textAlign: 'center' }}>No hay movimientos registrados</td></tr>
                ) : movimientos.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>
                      {m.tipo === 'ENTRADA' ? (
                        <span className="badge badge-success">
                          <ArrowDownToLine size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Entrada
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <ArrowUpFromLine size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Salida
                        </span>
                      )}
                    </td>
                    <td>{m.objetoNombre}</td>
                    <td>{m.bodegaNombre}</td>
                    <td>{m.cantidad}</td>
                    <td>{m.observaciones || '-'}</td>
                    <td>{formatoFecha(m.fechaMovimiento)}</td>
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
