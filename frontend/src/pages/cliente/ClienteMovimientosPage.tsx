import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { movimientoApi, objetoApi } from '../../api/services'
import type { MovimientoResponse, ObjetoResponse } from '../../types'
import { ArrowDownToLine, ArrowUpFromLine, Package, History } from 'lucide-react'

export function ClienteMovimientosPage() {
  const [movimientos, setMovimientos] = useState<MovimientoResponse[]>([])
  const [objetos, setObjetos] = useState<ObjetoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    tipo: 'ENTRADA',
    objetoId: '',
    cantidad: '1',
    observaciones: '',
  })

  const loadData = () => {
    setLoading(true)
    setError(null)
    Promise.all([objetoApi.misObjetos()])
      .then(([objRes]) => {
        setObjetos(objRes.data)
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

  const loadObjetos = () => {
    objetoApi.misObjetos()
      .then((res) => setObjetos(res.data))
      .catch(() => {})
  }

  useEffect(() => {
    loadData()
    loadObjetos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await movimientoApi.registrar({
        tipo: form.tipo,
        objetoId: parseInt(form.objetoId),
        cantidad: parseInt(form.cantidad),
        observaciones: form.observaciones || undefined,
      })
      setMensaje({ texto: 'Movimiento registrado correctamente', tipo: 'success' })
      setShowForm(false)
      setForm({ tipo: 'ENTRADA', objetoId: '', cantidad: '1', observaciones: '' })
      loadData()
      loadObjetos()
      setTimeout(() => setMensaje(null), 3000)
    } catch (err: any) {
      setMensaje({ texto: err.response?.data?.error || 'Error al registrar movimiento', tipo: 'error' })
      setTimeout(() => setMensaje(null), 5000)
    }
  }

  const formatoFecha = (f: string) => new Date(f).toLocaleString('es-CO')

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <History size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Movimientos
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Historial de movimientos de tus objetos.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Package size={16} /> Registrar Movimiento
        </button>
      </div>

      {mensaje && (
        <div className={`card mb-3`} style={{ borderColor: mensaje.tipo === 'success' ? 'var(--success)' : 'var(--danger)', background: mensaje.tipo === 'success' ? '#f0fdf4' : '#fef2f2' }}>
          <p className={mensaje.tipo === 'success' ? 'text-success' : 'text-danger'}>{mensaje.texto}</p>
        </div>
      )}

      {showForm && (
        <div className="card mb-3">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Registrar Movimiento</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div>
                <label className="label">Tipo *</label>
                <select className="input" required value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  <option value="ENTRADA">Entrada (ingreso)</option>
                  <option value="SALIDA">Salida (retiro)</option>
                </select>
              </div>
              <div>
                <label className="label">Objeto *</label>
                <select className="input" required value={form.objetoId} onChange={e => setForm({ ...form, objetoId: e.target.value })}>
                  <option value="">Seleccionar objeto</option>
                  {objetos.map(o => <option key={o.id} value={o.id}>{o.nombre} ({o.bodegaNombre}, stock: {o.cantidad})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Cantidad *</label>
                <input className="input" type="number" min="1" required value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} />
              </div>
              <div>
                <label className="label">Observaciones</label>
                <input className="input" value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" type="submit">Registrar</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

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
