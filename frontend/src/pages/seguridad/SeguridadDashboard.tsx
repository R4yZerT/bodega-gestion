import { useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { accesoApi } from '../../api/services'
import type { AccesoPersona } from '../../types'
import { LogIn, LogOut } from 'lucide-react'

export function SeguridadDashboard() {
  const [nombrePersona, setNombrePersona] = useState('')
  const [identificacion, setIdentificacion] = useState('')
  const [bodegaId, setBodegaId] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [accesos, setAccesos] = useState<AccesoPersona[]>([])

  const handleEntrada = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await accesoApi.registrarEntrada({
        nombrePersona,
        identificacion,
        bodegaId: Number(bodegaId),
        observaciones: observaciones || undefined,
      })
      setMessage('Entrada registrada correctamente')
      setNombrePersona('')
      setIdentificacion('')
      setObservaciones('')
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Error al registrar entrada')
    } finally {
      setLoading(false)
    }
  }

  const handleSalida = async (id: number) => {
    try {
      await accesoApi.registrarSalida(id)
      setMessage('Salida registrada correctamente')
      if (bodegaId) loadAccesos()
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Error al registrar salida')
    }
  }

  const loadAccesos = async () => {
    if (!bodegaId) return
    try {
      const res = await accesoApi.porBodega(Number(bodegaId))
      setAccesos(res.data)
    } catch {
      setAccesos([])
    }
  }

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Control de Accesos
        </h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Registro de entradas y salidas de personas
        </p>
      </div>

      {message && (
        <div
          style={{
            background: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`,
            color: message.includes('Error') ? '#991b1b' : '#166534',
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
            <LogIn size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Registrar Entrada
          </h2>
          <form onSubmit={handleEntrada}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Nombre de la persona</label>
              <input className="input" value={nombrePersona} onChange={(e) => setNombrePersona(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Identificación</label>
              <input className="input" value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">ID de Bodega</label>
              <input className="input" type="number" value={bodegaId} onChange={(e) => setBodegaId(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Observaciones</label>
              <input className="input" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Entrada'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            <LogOut size={20} style={{ display: 'inline', verticalAlign: 'middle' }} /> Accesos Activos
          </h2>
          <button className="btn btn-secondary mb-2" onClick={loadAccesos}>
            Cargar accesos
          </button>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Identificación</th>
                  <th>Entrada</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {accesos.filter((a) => !a.horaSalida).map((a) => (
                  <tr key={a.id}>
                    <td>{a.nombrePersona}</td>
                    <td>{a.identificacion}</td>
                    <td>{new Date(a.horaEntrada).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleSalida(a.id)}>
                        Registrar Salida
                      </button>
                    </td>
                  </tr>
                ))}
                {accesos.filter((a) => !a.horaSalida).length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-secondary" style={{ textAlign: 'center' }}>
                      No hay accesos activos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}