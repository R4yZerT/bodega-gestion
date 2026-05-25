import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { objetoApi, contratoApi } from '../../api/services'
import type { ObjetoResponse, Bodega, ContratoResponse } from '../../types'
import { Plus, Package, Pencil, Trash2 } from 'lucide-react'
import { useToast } from '../../components/ui/ToastProvider'

export function ClienteObjetosPage() {
  const [objetos, setObjetos] = useState<ObjetoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [bodegas, setBodegas] = useState<Bodega[]>([])
  const toast = useToast()
  const [form, setForm] = useState({
    nombre: '',
    cantidad: '1',
    largoCm: '',
    anchoCm: '',
    altoCm: '',
    stockMinimo: '',
    bodegaId: '',
  })

  const loadObjetos = () => {
    setLoading(true)
    setError(null)
    objetoApi.misObjetos()
      .then((res) => setObjetos(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar objetos'))
      .finally(() => setLoading(false))
  }

  const loadBodegas = () => {
    contratoApi.misContratos()
      .then((res) => {
        const uniq: Bodega[] = []
        const seen = new Set<number>()
        res.data.forEach((c: ContratoResponse) => {
          if (!seen.has(c.bodegaId)) {
            seen.add(c.bodegaId)
            uniq.push({
              id: c.bodegaId,
              nombre: c.bodegaNombre,
              ubicacion: '',
              capacidadM3: 0,
              volumenOcupadoM3: 0,
              volumenLibreM3: 0,
              porcentajeOcupacion: 0,
              estado: 'EN_USO',
              descripcion: null,
            })
          }
        })
        setBodegas(uniq)
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadObjetos()
    loadBodegas()
  }, [])

  const resetForm = () => {
    setForm({ nombre: '', cantidad: '1', largoCm: '', anchoCm: '', altoCm: '', stockMinimo: '', bodegaId: '' })
    setShowForm(false)
    setEditing(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      nombre: form.nombre,
      cantidad: parseInt(form.cantidad) || 0,
      largoCm: form.largoCm ? parseFloat(form.largoCm) : undefined,
      anchoCm: form.anchoCm ? parseFloat(form.anchoCm) : undefined,
      altoCm: form.altoCm ? parseFloat(form.altoCm) : undefined,
      stockMinimo: form.stockMinimo ? parseInt(form.stockMinimo) : undefined,
      bodegaId: parseInt(form.bodegaId),
    }
    try {
      if (editing) {
        await objetoApi.actualizar(editing, data)
      } else {
        await objetoApi.crear(data)
      }
      resetForm()
      loadObjetos()
      toast.success(editing ? 'Objeto actualizado exitosamente' : 'Objeto creado exitosamente')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar objeto')
    }
  }

  const startEdit = (o: ObjetoResponse) => {
    setForm({
      nombre: o.nombre,
      cantidad: String(o.cantidad),
      largoCm: o.largoCm != null ? String(o.largoCm) : '',
      anchoCm: o.anchoCm != null ? String(o.anchoCm) : '',
      altoCm: o.altoCm != null ? String(o.altoCm) : '',
      stockMinimo: o.stockMinimo != null ? String(o.stockMinimo) : '',
      bodegaId: String(o.bodegaId),
    })
    setEditing(o.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este objeto?')) return
    try {
      await objetoApi.eliminar(id)
      loadObjetos()
      toast.success('Objeto eliminado exitosamente')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <Package size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Mis Objetos
          </h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Gestión de tus objetos almacenados.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={16} /> Nuevo Objeto
        </button>
      </div>

      {showForm && (
        <div className="card mb-3">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            {editing ? 'Editar Objeto' : 'Crear Objeto'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div>
                <label className="label">Nombre *</label>
                <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="label">Cantidad *</label>
                <input className="input" type="number" min="0" required value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} />
              </div>
              <div>
                <label className="label">Bodega *</label>
                <select className="input" required value={form.bodegaId} onChange={e => setForm({ ...form, bodegaId: e.target.value })}>
                  <option value="">Seleccionar bodega</option>
                  {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Stock Mínimo</label>
                <input className="input" type="number" min="0" value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: e.target.value })} />
              </div>
              <div>
                <label className="label">Largo (cm)</label>
                <input className="input" type="number" step="0.01" value={form.largoCm} onChange={e => setForm({ ...form, largoCm: e.target.value })} />
              </div>
              <div>
                <label className="label">Ancho (cm)</label>
                <input className="input" type="number" step="0.01" value={form.anchoCm} onChange={e => setForm({ ...form, anchoCm: e.target.value })} />
              </div>
              <div>
                <label className="label">Alto (cm)</label>
                <input className="input" type="number" step="0.01" value={form.altoCm} onChange={e => setForm({ ...form, altoCm: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" type="submit">{editing ? 'Guardar' : 'Crear'}</button>
              <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {objetos.length === 0 ? (
                  <tr><td colSpan={8} className="text-secondary" style={{ textAlign: 'center' }}>No tienes objetos registrados</td></tr>
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
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(o)} title="Editar">
                        <Pencil size={14} />
                      </button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)} title="Eliminar">
                        <Trash2 size={14} />
                      </button>
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
