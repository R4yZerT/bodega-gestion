import { useState, useEffect, useRef } from 'react'
import { Layout } from '../../components/layout/Layout'
import { accesoApi, bodegaApi, objetoApi } from '../../api/services'
import type { AccesoPersona, ObjetoResponse } from '../../types'
import { LogIn, LogOut, Search, CheckCircle2, XCircle, Package, AlertTriangle, ArrowUpFromLine } from 'lucide-react'

type LookupState = 'idle' | 'loading' | 'found' | 'notfound'

interface ItemSeleccionado {
  objetoId: number
  objetoNombre: string
  cantidad: number
  volumenM3: number
  stockActual: number
}

export function SeguridadDashboard() {
  const [nombrePersona, setNombrePersona] = useState('')
  const [identificacion, setIdentificacion] = useState('')
  const [bodegaId, setBodegaId] = useState('')
  const [bodegaNombre, setBodegaNombre] = useState('')
  const [bodegaLookup, setBodegaLookup] = useState<LookupState>('idle')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [accesos, setAccesos] = useState<AccesoPersona[]>([])
  const [objetosBodega, setObjetosBodega] = useState<ObjetoResponse[]>([])
  const [itemsEntrada, setItemsEntrada] = useState<ItemSeleccionado[]>([])
  const [errorModal, setErrorModal] = useState<{ titulo: string; mensaje: string } | null>(null)
  const [salidaModal, setSalidaModal] = useState<{ acceso: AccesoPersona; objetos: ObjetoResponse[] } | null>(null)
  const [itemsSalida, setItemsSalida] = useState<Record<number, number>>({})

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const id = Number(bodegaId)

    if (!bodegaId || !Number.isFinite(id) || id <= 0) {
      setBodegaNombre('')
      setBodegaLookup('idle')
      setObjetosBodega([])
      setItemsEntrada([])
      return
    }

    setBodegaLookup('loading')

    debounceRef.current = setTimeout(() => {
      bodegaApi.obtener(id)
        .then((res) => {
          setBodegaNombre(res.data.nombre)
          setBodegaLookup('found')
          objetoApi.porBodega(id)
            .then((objRes) => {
              setObjetosBodega(objRes.data)
              setItemsEntrada(
                objRes.data.map((o) => ({
                  objetoId: o.id,
                  objetoNombre: o.nombre,
                  cantidad: 0,
                  volumenM3: o.volumenTotalM3,
                  stockActual: o.cantidad,
                }))
              )
            })
            .catch(() => setObjetosBodega([]))
        })
        .catch(() => {
          setBodegaNombre('')
          setBodegaLookup('notfound')
          setObjetosBodega([])
          setItemsEntrada([])
        })
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [bodegaId])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 5000)
    return () => clearTimeout(t)
  }, [message])

  const resetForm = () => {
    setNombrePersona('')
    setIdentificacion('')
    setBodegaId('')
    setBodegaNombre('')
    setBodegaLookup('idle')
    setObservaciones('')
    setObjetosBodega([])
    setItemsEntrada([])
  }

  const updateCantidad = (objetoId: number, cantidad: number) => {
    setItemsEntrada((prev) =>
      prev.map((item) => (item.objetoId === objetoId ? { ...item, cantidad: Math.max(0, cantidad) } : item))
    )
  }

  const volumenTotalEntrada = itemsEntrada
    .filter((i) => i.cantidad > 0 && i.volumenM3 > 0)
    .reduce((sum, i) => {
      const unitario = i.stockActual > 0 ? i.volumenM3 / i.stockActual : 0
      return sum + unitario * i.cantidad
    }, 0)

  const handleEntrada = async (e: React.FormEvent) => {
    e.preventDefault()
    const seleccionados = itemsEntrada.filter((i) => i.cantidad > 0)
    if (seleccionados.length === 0) {
      setMessage('Selecciona al menos un objeto con cantidad mayor a 0')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await accesoApi.registrarEntrada({
        nombrePersona,
        identificacion,
        bodegaId: Number(bodegaId),
        observaciones: observaciones || undefined,
        items: seleccionados.map((i) => ({ objetoId: i.objetoId, cantidad: i.cantidad })),
      })
      setMessage('Entrada registrada correctamente')
      resetForm()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al registrar entrada'
      if (errorMsg.includes('Capacidad') || errorMsg.includes('capacidad')) {
        setErrorModal({ titulo: 'Capacidad insuficiente', mensaje: errorMsg })
      } else {
        setMessage(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  const openSalidaModal = async (acceso: AccesoPersona) => {
    try {
      const res = await objetoApi.porBodega(acceso.bodegaId)
      const objetos = res.data
      if (objetos.length === 0) {
        await confirmarSalida(acceso.id, [])
        return
      }
      const inicial: Record<number, number> = {}
      objetos.forEach((o) => { inicial[o.id] = 0 })
      setItemsSalida(inicial)
      setSalidaModal({ acceso, objetos })
    } catch {
      confirmarSalida(acceso.id, [])
    }
  }

  const confirmarSalida = async (accesoId: number, items: { objetoId: number; cantidad: number }[]) => {
    try {
      await accesoApi.registrarSalida(accesoId, { items })
      setMessage('Salida registrada correctamente')
      if (bodegaId) loadAccesos()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al registrar salida'
      if (errorMsg.includes('Stock') || errorMsg.includes('stock') || errorMsg.includes('Insuficiente')) {
        setErrorModal({ titulo: 'Stock insuficiente', mensaje: errorMsg })
      } else {
        setMessage(errorMsg)
      }
    }
    setSalidaModal(null)
  }

  const handleSalidaSubmit = () => {
    if (!salidaModal) return
    const items = Object.entries(itemsSalida)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([objetoId, cantidad]) => ({ objetoId: Number(objetoId), cantidad }))
    if (items.length === 0) {
      confirmarSalida(salidaModal.acceso.id, [])
      return
    }
    confirmarSalida(salidaModal.acceso.id, items)
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

  const formatoFecha = (f: string) => new Date(f).toLocaleString('es-CO')
  const activos = accesos.filter((a) => !a.horaSalida)

  return (
    <Layout>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon { animation: spin 0.8s linear infinite; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.3s ease; }
      `}</style>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Control de Accesos</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Registro de entradas y salidas de personas con objetos
        </p>
      </div>

      {message && (
        <div
          style={{
            background: message.includes('Error') || message.includes('Selecciona') ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.includes('Error') || message.includes('Selecciona') ? '#fecaca' : '#bbf7d0'}`,
            color: message.includes('Error') || message.includes('Selecciona') ? '#991b1b' : '#166534',
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
              <div style={{ position: 'relative' }}>
                <input className="input" type="number" value={bodegaId} onChange={(e) => setBodegaId(e.target.value)} required />
                {bodegaLookup === 'loading' && (
                  <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <Search size={14} className="spin-icon" style={{ color: 'var(--text-secondary)' }} />
                  </span>
                )}
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Nombre de la Bodega</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  value={bodegaNombre}
                  readOnly
                  tabIndex={-1}
                  style={{
                    background: bodegaLookup === 'loading' ? '#f9fafb' : bodegaLookup === 'found' ? '#f0fdf4' : bodegaLookup === 'notfound' ? '#fef2f2' : '#f9fafb',
                    borderColor: bodegaLookup === 'found' ? '#86efac' : bodegaLookup === 'notfound' ? '#fecaca' : undefined,
                    transition: 'background 0.3s ease, border-color 0.3s ease',
                    cursor: 'default',
                    color: bodegaLookup === 'notfound' ? 'var(--text-secondary)' : undefined,
                  }}
                  placeholder={bodegaLookup === 'idle' ? 'Escribe un ID para buscar...' : bodegaLookup === 'loading' ? 'Buscando...' : bodegaLookup === 'notfound' ? 'Bodega no encontrada' : ''}
                />
                {bodegaLookup === 'found' && (
                  <CheckCircle2 size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', pointerEvents: 'none' }} />
                )}
                {bodegaLookup === 'notfound' && (
                  <XCircle size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', pointerEvents: 'none' }} />
                )}
              </div>
            </div>

            {bodegaLookup === 'found' && itemsEntrada.length > 0 && (
              <div className="fade-in" style={{ marginBottom: '1rem' }}>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Package size={14} /> Objetos que ingresan
                </label>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  marginTop: '0.25rem',
                  maxHeight: '240px',
                  overflowY: 'auto',
                }}>
                  <table style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Objeto</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', width: '60px' }}>Stock</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', width: '80px' }}>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsEntrada.map((item) => (
                        <tr key={item.objetoId} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.5rem' }}>{item.objetoNombre}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {item.stockActual}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              value={item.cantidad || ''}
                              onChange={(e) => updateCantidad(item.objetoId, parseInt(e.target.value) || 0)}
                              style={{
                                width: '70px',
                                padding: '0.25rem 0.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontSize: '0.8125rem',
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Volumen a ocupar: <strong>{volumenTotalEntrada.toFixed(2)} m³</strong></span>
                  <span>Objetos seleccionados: <strong>{itemsEntrada.filter((i) => i.cantidad > 0).length}</strong></span>
                </div>
              </div>
            )}

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
                {activos.length > 0 ? activos.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nombrePersona}</td>
                    <td>{a.identificacion}</td>
                    <td>{formatoFecha(a.horaEntrada)}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => openSalidaModal(a)}>
                        Registrar Salida
                      </button>
                    </td>
                  </tr>
                )) : (
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

      {errorModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setErrorModal(null)}>
          <div
            className="card fade-in"
            style={{ maxWidth: '460px', width: '90%', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={28} style={{ color: '#ef4444' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{errorModal.titulo}</h3>
            </div>
            <pre style={{
              whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: 'var(--text-secondary)',
              background: '#fef2f2', padding: '0.75rem', borderRadius: 'var(--radius)',
              marginBottom: '1.5rem', border: '1px solid #fecaca',
            }}>
              {errorModal.mensaje}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setErrorModal(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {salidaModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setSalidaModal(null)}>
          <div
            className="card fade-in"
            style={{ maxWidth: '520px', width: '90%', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <ArrowUpFromLine size={24} style={{ color: '#f59e0b' }} />
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Registrar Salida</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {salidaModal.acceso.nombrePersona} — {salidaModal.acceso.identificacion}
                </p>
              </div>
            </div>

            {salidaModal.objetos.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label" style={{ fontSize: '0.8125rem' }}>
                  <Package size={12} style={{ display: 'inline' }} /> Objetos en bodega — indique los que salen
                </label>
                <div style={{
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                  maxHeight: '260px', overflowY: 'auto', marginTop: '0.25rem',
                }}>
                  <table style={{ width: '100%', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Objeto</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', width: '60px' }}>Stock</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', width: '70px' }}>Sale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salidaModal.objetos.map((o) => (
                        <tr key={o.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.5rem' }}>{o.nombre}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {o.cantidad}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              value={itemsSalida[o.id] || ''}
                              onChange={(e) => setItemsSalida((prev) => ({ ...prev, [o.id]: parseInt(e.target.value) || 0 }))}
                              style={{
                                width: '70px', padding: '0.25rem 0.5rem',
                                border: '1px solid var(--border)', borderRadius: '4px',
                                textAlign: 'center', fontSize: '0.8125rem',
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setSalidaModal(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSalidaSubmit}>
                Confirmar Salida
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
