import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { objetoApi, bodegaApi } from '../../api/services'
import type { ObjetoResponse, Bodega } from '../../types'
import { Package, Boxes, Plus, Trash2, Pencil } from 'lucide-react'

export function SeguridadInventarioPage() {
  const [objetos, setObjetos] = useState<ObjetoResponse[]>([])
  const [bodegas, setBodegas] = useState<Bodega[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [bodegaId, setBodegaId] = useState('')
  const [largoCm, setLargoCm] = useState('')
  const [anchoCm, setAnchoCm] = useState('')
  const [altoCm, setAltoCm] = useState('')
  const [stockMinimo, setStockMinimo] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      objetoApi.listarTodos(),
      bodegaApi.listar(),
    ])
      .then(([objRes, bodRes]) => {
        setObjetos(objRes.data)
        setBodegas(bodRes.data)
      })
      .catch(() => setMessage('Error al cargar datos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 5000)
    return () => clearTimeout(t)
  }, [message])

  const resetForm = () => {
    setEditingId(null)
    setNombre('')
    setCantidad('')
    setBodegaId('')
    setLargoCm('')
    setAnchoCm('')
    setAltoCm('')
    setStockMinimo('')
  }

  const startEdit = (o: ObjetoResponse) => {
    setEditingId(o.id)
    setNombre(o.nombre)
    setCantidad(String(o.cantidad))
    setBodegaId(String(o.bodegaId))
    setLargoCm(o.largoCm != null ? String(o.largoCm) : '')
    setAnchoCm(o.anchoCm != null ? String(o.anchoCm) : '')
    setAltoCm(o.altoCm != null ? String(o.altoCm) : '')
    setStockMinimo(o.stockMinimo != null ? String(o.stockMinimo) : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !cantidad || !bodegaId) {
      setMessage('Nombre, cantidad y bodega son obligatorios')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        nombre: nombre.trim(),
        cantidad: Number(cantidad),
        bodegaId: Number(bodegaId),
        largoCm: largoCm ? Number(largoCm) : undefined,
        anchoCm: anchoCm ? Number(anchoCm) : undefined,
        altoCm: altoCm ? Number(altoCm) : undefined,
        stockMinimo: stockMinimo ? Number(stockMinimo) : undefined,
      }
      if (editingId) {
        await objetoApi.actualizar(editingId, payload)
        setMessage('Objeto actualizado correctamente')
      } else {
        await objetoApi.crear(payload)
        setMessage('Objeto creado correctamente')
      }
      resetForm()
      loadData()
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Error al guardar objeto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este objeto?')) return
    try {
      await objetoApi.eliminar(id)
      setMessage('Objeto eliminado')
      loadData()
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Error al eliminar')
    }
  }

  const selectedBodega = bodegas.find((b) => b.id === Number(bodegaId))

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          <Boxes size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Gestión de Inventario
        </h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Registro y consulta de objetos del sistema
        </p>
      </div>

      {message && (
        <div
          style={{
            background: message.includes('Error') || message.includes('obligatorios') ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.includes('Error') || message.includes('obligatorios') ? '#fecaca' : '#bbf7d0'}`,
            color: message.includes('Error') || message.includes('obligatorios') ? '#991b1b' : '#166534',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {message}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            {editingId ? (
              <><Pencil size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Editar Objeto</>
            ) : (
              <><Plus size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Registrar Nuevo Objeto</>
            )}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Nombre del objeto *</label>
              <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej: Taladro Bosch" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">Cantidad / Stock *</label>
                <input className="input" type="number" min="0" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
              </div>
              <div>
                <label className="label">Stock Mínimo</label>
                <input className="input" type="number" min="0" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Bodega *</label>
              <select className="input" value={bodegaId} onChange={(e) => setBodegaId(e.target.value)} required>
                <option value="">Seleccionar bodega...</option>
                {bodegas.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.id} — {b.nombre} ({b.porcentajeOcupacion?.toFixed(0) ?? 0}% ocupado)
                  </option>
                ))}
              </select>
              {selectedBodega && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Libre: {selectedBodega.volumenLibreM3?.toFixed(2) ?? '?'} m³ de {selectedBodega.capacidadM3} m³
                </p>
              )}
            </div>
            <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Dimensiones (cm) — opcional</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label className="label" style={{ fontSize: '0.75rem' }}>Largo</label>
                <input className="input" type="number" step="0.01" min="0" value={largoCm} onChange={(e) => setLargoCm(e.target.value)} placeholder="cm" />
              </div>
              <div>
                <label className="label" style={{ fontSize: '0.75rem' }}>Ancho</label>
                <input className="input" type="number" step="0.01" min="0" value={anchoCm} onChange={(e) => setAnchoCm(e.target.value)} placeholder="cm" />
              </div>
              <div>
                <label className="label" style={{ fontSize: '0.75rem' }}>Alto</label>
                <input className="input" type="number" step="0.01" min="0" value={altoCm} onChange={(e) => setAltoCm(e.target.value)} placeholder="cm" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar Objeto' : 'Registrar Objeto'}
              </button>
              {editingId && (
                <button className="btn btn-secondary" type="button" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            <Package size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Inventario Actual
          </h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
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
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {objetos.length > 0 ? objetos.map((o) => (
                    <tr key={o.id} style={{ background: o.bajoStockMinimo ? '#fef2f2' : 'inherit' }}>
                      <td>{o.id}</td>
                      <td style={{ fontWeight: 500 }}>{o.nombre}</td>
                      <td>
                        {o.bajoStockMinimo ? (
                          <span className="badge badge-danger">{o.cantidad}</span>
                        ) : o.cantidad}
                      </td>
                      <td>{o.largoCm && o.anchoCm && o.altoCm ? `${o.largoCm}x${o.anchoCm}x${o.altoCm}` : '-'}</td>
                      <td>{o.volumenTotalM3?.toFixed(4) ?? '0'}</td>
                      <td>{o.bodegaNombre}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(o)} title="Editar">
                            <Pencil size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)} title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="text-secondary" style={{ textAlign: 'center' }}>
                        No hay objetos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
