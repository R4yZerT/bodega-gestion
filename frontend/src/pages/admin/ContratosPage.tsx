import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { contratoApi, bodegaApi } from '../../api/services'
import type { Contrato, Bodega } from '../../types'
import { FileText, Plus } from 'lucide-react'

export function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    usuarioId: '',
    bodegaId: '',
    fechaInicio: '',
    fechaFin: '',
    canonMensual: '',
  })
  const [bodegas, setBodegas] = useState<Bodega[]>([])

const [error, setError] = useState<string | null>(null)

  const loadContratos = () => {
    setLoading(true)
    setError(null)
    contratoApi.listarTodos()
      .then((res) => setContratos(res.data))
      .catch((err) => setError(err.response?.data?.error || err.response?.data?.message || 'Error al cargar contratos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadContratos()
    bodegaApi.listar().then((res) => setBodegas(res.data)).catch(() => {})
  }, [])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await contratoApi.crear({
        usuarioId: form.usuarioId,
        bodegaId: Number(form.bodegaId),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        canonMensual: parseFloat(form.canonMensual),
      })
      setShowForm(false)
      setForm({ usuarioId: '', bodegaId: '', fechaInicio: '', fechaFin: '', canonMensual: '' })
      loadContratos()
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Error al crear contrato')
    }
  }

  const handleTerminar = async (id: number) => {
    if (!confirm('¿Terminar este contrato? La bodega quedará libre.')) return
    try {
      await contratoApi.terminar(id)
      loadContratos()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al terminar contrato')
    }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-CO')

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}><FileText size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Contratos</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Gestión de contratos de arrendamiento</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Nuevo Contrato
        </button>
      </div>

      {showForm && (
        <div className="card mb-3">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Crear Contrato</h3>
          <form onSubmit={handleCrear}>
            <div className="grid grid-2">
              <div>
                <label className="label">ID Usuario (UUID) *</label>
                <input className="input" required value={form.usuarioId} onChange={e => setForm({ ...form, usuarioId: e.target.value })} placeholder="UUID del usuario" />
              </div>
              <div>
                <label className="label">Bodega *</label>
                <select className="input" required value={form.bodegaId} onChange={e => setForm({ ...form, bodegaId: e.target.value })}>
                  <option value="">Seleccionar bodega</option>
                  {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Fecha Inicio *</label>
                <input className="input" type="date" required value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} />
              </div>
              <div>
                <label className="label">Fecha Fin *</label>
                <input className="input" type="date" required value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} />
              </div>
              <div>
                <label className="label">Canon Mensual *</label>
                <input className="input" type="number" step="0.01" required value={form.canonMensual} onChange={e => setForm({ ...form, canonMensual: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" type="submit">Crear</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p>Cargando...</p> : error ? (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={loadContratos}>Reintentar</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Usuario</th><th>Bodega</th><th>Inicio</th><th>Fin</th><th>Canon</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contratos.length === 0 ? (
                  <tr><td colSpan={8} className="text-secondary" style={{ textAlign: 'center' }}>No hay contratos</td></tr>
                ) : contratos.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.usuarioNombre || c.usuarioId}</td>
                    <td>{c.bodegaNombre || c.bodegaId}</td>
                    <td>{fmtDate(c.fechaInicio)}</td>
                    <td>{fmtDate(c.fechaFin)}</td>
                    <td>${Number(c.canonMensual).toLocaleString('es-CO')}</td>
                    <td>
                      <span className={`badge ${c.activo ? 'badge-success' : 'badge-danger'}`}>
                        {c.activo ? 'Activo' : 'Terminado'}
                      </span>
                    </td>
                    <td>
                      {c.activo && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleTerminar(c.id)}>Terminar</button>
                      )}
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