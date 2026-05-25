import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { contratoApi, bodegaApi, zonaApi } from '../../api/services'
import type { ContratoResponse, Bodega, Zona, ObjetoResponse } from '../../types'
import { Warehouse, MapPin, LayoutGrid } from 'lucide-react'

function BarraOcupacion({ porcentaje }: { porcentaje: number }) {
  const p = Math.min(100, Math.max(0, porcentaje || 0))
  return (
    <div style={{ background: '#e5e7eb', borderRadius: 4, height: 14, width: '100%', marginTop: '4px' }}>
      <div style={{
        width: `${p}%`,
        height: '100%',
        background: p > 90 ? '#ef4444' : p > 70 ? '#f59e0b' : '#22c55e',
        borderRadius: 4,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

function PlanoBodega({ zonas, width, height }: { zonas: Zona[]; width: number; height: number }) {
  if (zonas.length === 0) return null
  const maxX = Math.max(...zonas.map(z => z.posicionX + z.ancho), 1)
  const maxY = Math.max(...zonas.map(z => z.posicionY + z.alto), 1)
  const escalaX = width / maxX
  const escalaY = height / maxY
  const escala = Math.min(escalaX, escalaY)

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 200,
      background: '#f1f5f9',
      borderRadius: 8,
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {zonas.map(z => {
        const pct = z.porcentajeOcupacion || 0
        const color = pct > 90 ? 'rgba(239,68,68,0.6)' : pct > 70 ? 'rgba(245,158,11,0.6)' : 'rgba(34,197,94,0.5)'
        return (
          <div key={z.id} title={`${z.nombre}: ${pct.toFixed(1)}%`}
            style={{
              position: 'absolute',
              left: z.posicionX * escala,
              top: z.posicionY * escala,
              width: z.ancho * escala - 2,
              height: z.alto * escala - 2,
              background: color,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: '#1e293b',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.15)',
              cursor: 'pointer',
            }}
          >
            {z.ancho * escala > 40 ? z.nombre : ''}
          </div>
        )
      })}
    </div>
  )
}

export function ClienteBodegasPage() {
  const [contratos, setContratos] = useState<ContratoResponse[]>([])
  const [bodegas, setBodegas] = useState<Map<number, Bodega>>(new Map())
  const [zonas, setZonas] = useState<Map<number, Zona[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    contratoApi.misContratos()
      .then(async (res) => {
        setContratos(res.data)
        const bodegasMap = new Map<number, Bodega>()
        const zonasMap = new Map<number, Zona[]>()
        for (const c of res.data) {
          if (!bodegasMap.has(c.bodegaId)) {
            try {
              const bRes = await bodegaApi.obtener(c.bodegaId)
              bodegasMap.set(c.bodegaId, bRes.data)
            } catch { /* skip */ }
          }
          if (!zonasMap.has(c.bodegaId)) {
            try {
              const zRes = await zonaApi.listarPorBodega(c.bodegaId)
              zonasMap.set(c.bodegaId, zRes.data)
            } catch { zonasMap.set(c.bodegaId, []) }
          }
        }
        setBodegas(bodegasMap)
        setZonas(zonasMap)
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar bodegas'))
      .finally(() => setLoading(false))
  }, [])

  const formatoFecha = (d: string) => new Date(d).toLocaleDateString('es-CO')
  const formatoDinero = (v: number) => '$' + Number(v).toLocaleString('es-CO')

  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          <Warehouse size={24} style={{ display: 'inline', verticalAlign: 'middle' }} /> Mis Bodegas
        </h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Información de las bodegas que tienes asignadas.
        </p>
      </div>

      {loading ? <p>Cargando...</p> : error ? (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <p className="text-danger">{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      ) : contratos.length === 0 ? (
        <div className="card">
          <p className="text-secondary">No tienes bodegas asignadas actualmente.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {contratos.map(c => {
            const b = bodegas.get(c.bodegaId)
            const zs = zonas.get(c.bodegaId) || []
            return (
              <div key={c.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Warehouse size={18} />
                      {b?.nombre || `Bodega #${c.bodegaId}`}
                      <span className={`badge ${b?.estado === 'LIBRE' ? 'badge-success' : b?.estado === 'EN_USO' ? 'badge-info' : 'badge-warning'}`}>
                        {b?.estado === 'LIBRE' ? 'Libre' : b?.estado === 'EN_USO' ? 'En Uso' : 'Reservada'}
                      </span>
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {b?.ubicacion || 'Sin ubicación'}
                    </p>
                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div>
                        <span className="stat-label">Capacidad Total</span>
                        <div style={{ fontWeight: 600 }}>{b?.capacidadM3 || 0} m³</div>
                      </div>
                      <div>
                        <span className="stat-label">Volumen Ocupado</span>
                        <div style={{ fontWeight: 600 }}>{b?.volumenOcupadoM3?.toFixed(2) || 0} m³</div>
                      </div>
                      <div>
                        <span className="stat-label">Volumen Libre</span>
                        <div style={{ fontWeight: 600, color: 'var(--success)' }}>{b?.volumenLibreM3?.toFixed(2) || 0} m³</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                        <span>Ocupación</span>
                        <span className={((b?.porcentajeOcupacion || 0) > 80 ? 'text-danger' : (b?.porcentajeOcupacion || 0) > 60 ? 'text-warning' : 'text-success')}>
                          {b?.porcentajeOcupacion?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <BarraOcupacion porcentaje={b?.porcentajeOcupacion || 0} />
                    </div>
                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8125rem' }}>
                        <div>
                          <span className="text-secondary">Contrato:</span> {formatoFecha(c.fechaInicio)} - {formatoFecha(c.fechaFin)}
                        </div>
                        <div>
                          <span className="text-secondary">Canon:</span> {formatoDinero(c.canonMensual)}/mes
                        </div>
                      </div>
                    </div>
                  </div>

                  {zs.length > 0 && (
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <LayoutGrid size={16} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Plano de Zonas</span>
                      </div>
                      <PlanoBodega zonas={zs} width={400} height={200} />
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {zs.map(z => (
                          <div key={z.id} style={{
                            padding: '0.25rem 0.75rem',
                            background: 'var(--bg-primary)',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.75rem',
                            border: '1px solid var(--border)',
                          }}>
                            {z.nombre}: {z.porcentajeOcupacion?.toFixed(0) || 0}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
