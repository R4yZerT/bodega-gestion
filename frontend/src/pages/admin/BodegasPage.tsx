import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { bodegaApi } from '../../api/services'
import type { Bodega } from '../../types'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useToast } from '../../components/ui/ToastProvider'

const estadoColors: Record<string, string> = {
  LIBRE: 'badge-success',
  RESERVADA: 'badge-warning',
  EN_USO: 'badge-info',
}

const estadoLabels: Record<string, string> = {
  LIBRE: 'Libre',
  RESERVADA: 'Reservada',
  EN_USO: 'En Uso',
}

function BarraOcupacion({ porcentaje }: { porcentaje: number }) {
  const p = Math.min(100, Math.max(0, porcentaje || 0));
  return (
    <div style={{ background: '#e5e7eb', borderRadius: 4, height: 12, width: '100%', marginTop: '4px' }}>
      <div style={{
        width: `${p}%`,
        height: '100%',
        background: p > 90 ? '#ef4444' : p > 70 ? '#f59e0b' : '#22c55e',
        borderRadius: 4,
        transition: 'width 0.3s ease'
      }} />
    </div>
  )
}

export function BodegasPage() {
  const [bodegas, setBodegas] = useState<Bodega[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', ubicacion: '', capacidadM3: '', descripcion: '', estado: 'LIBRE' })
  const toast = useToast()

  const loadBodegas = () => {
    setLoading(true)
    setError(null)
    bodegaApi.listar()
      .then((res) => setBodegas(res.data))
      .catch((err) => setError(err.response?.data?.error || err.response?.data?.message || 'Error al cargar bodegas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadBodegas() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await bodegaApi.crear({
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        capacidadM3: parseFloat(form.capacidadM3),
        descripcion: form.descripcion || undefined,
        estado: form.estado as any,
      })
      setShowForm(false)
      setForm({ nombre: '', ubicacion: '', capacidadM3: '', descripcion: '', estado: 'LIBRE' })
      loadBodegas()
      toast.success('Bodega creada exitosamente')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear bodega')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta bodega?')) return
    try {
      await bodegaApi.eliminar(id)
      loadBodegas()
      toast.success('Bodega eliminada exitosamente')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' }}>Bodegas</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Gestión de infraestructura</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Nueva Bodega
        </button>
      </div>

      {showForm && (
        <div className="card mb-3">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Crear Bodega</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-2">
              <div><label className="label">Nombre *</label><input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
              <div><label className="label">Ubicación *</label><input className="input" required value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} /></div>
              <div><label className="label">Capacidad (m³) *</label><input className="input" type="number" step="0.001" required value={form.capacidadM3} onChange={e => setForm({ ...form, capacidadM3: e.target.value })} /></div>
              <div><label className="label">Estado</label>
                <select className="input" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  <option value="LIBRE">Libre</option>
                  <option value="RESERVADA">Reservada</option>
                  <option value="EN_USO">En Uso</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}><label className="label">Descripción</label><input className="input" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
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
          <button className="btn btn-primary" onClick={loadBodegas}>Reintentar</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Ubicación</th><th>Capacidad</th><th>Ocupado</th><th style={{ minWidth: '100px' }}>%</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bodegas.length === 0 ? (
                  <tr><td colSpan={8} className="text-secondary" style={{ textAlign: 'center' }}>No hay bodegas</td></tr>
                ) : bodegas.map(b => (
                  <tr key={b.id} style={{ background: (b.porcentajeOcupacion || 0) > 90 ? '#fef2f2' : 'inherit' }}>
                    <td>{b.id}</td>
                    <td>{b.nombre}</td>
                    <td>{b.ubicacion}</td>
                    <td>{b.capacidadM3} m³</td>
                    <td>{b.volumenOcupadoM3?.toFixed(2) ?? 0} m³</td>
                    <td>
                      <div>{b.porcentajeOcupacion?.toFixed(1) ?? 0}%</div>
                      <BarraOcupacion porcentaje={b.porcentajeOcupacion || 0} />
                    </td>
                    <td><span className={`badge ${estadoColors[b.estado] || 'badge-info'}`}>{estadoLabels[b.estado] || b.estado}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Eliminar</button>
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