import { useEffect, useState } from 'react'
import { Layout } from '../../components/layout/Layout'
import { contratoApi, bodegaApi, zonaApi } from '../../api/services'
import type { ContratoResponse, Bodega, Zona } from '../../types'
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

function OcupacionBadge({ pct }: { pct: number }) {
  const bg = pct > 90 ? '#fef2f2' : pct > 70 ? '#fffbeb' : '#f0fdf4'
  const fg = pct > 90 ? '#dc2626' : pct > 70 ? '#d97706' : '#16a34a'
  return (
    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: fg, background: bg, borderRadius: 3, padding: '0 3px', whiteSpace: 'nowrap' }}>
      {pct.toFixed(0)}%
    </span>
  )
}

function PlanoBodega({ zonas }: { zonas: Zona[] }) {
  if (zonas.length === 0) return null

  const maxX = Math.max(...zonas.map(z => z.posicionX + z.ancho), 1)
  const maxY = Math.max(...zonas.map(z => z.posicionY + z.alto), 1)

  return (
    <div style={{
      width: '100%',
      background: '#f1f5f9',
      borderRadius: 12,
      border: '1px solid var(--border)',
      padding: 8,
      boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${maxX}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${maxY}, minmax(36px, 1fr))`,
        gap: 4,
        maxHeight: 320,
        overflow: 'auto',
      }}>
        {zonas.map(z => {
          const pct = z.porcentajeOcupacion || 0
          const bgColor = pct > 90 ? '#fee2e2' : pct > 70 ? '#fef3c7' : '#dcfce7'
          const borderColor = pct > 90 ? '#fecaca' : pct > 70 ? '#fde68a' : '#bbf7d0'

          return (
            <div key={z.id}
              title={`${z.nombre}: ${pct.toFixed(1)}% ocupado`}
              style={{
                gridColumn: `${z.posicionX + 1} / span ${z.ancho}`,
                gridRow: `${z.posicionY + 1} / span ${z.alto}`,
                background: bgColor,
                borderRadius: 6,
                border: `2px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '2px 6px',
                cursor: 'default',
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#1e293b',
                lineHeight: 1.2,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}>
                {z.nombre}
              </span>
              <OcupacionBadge pct={pct} />
            </div>
          )
        })}
      </div>
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
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' }}>
          Mis Bodegas
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
                      <Warehouse size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                      {b?.nombre || `Bodega #${c.bodegaId}`}
                      <span className={`badge ${b?.estado === 'LIBRE' ? 'badge-success' : b?.estado === 'EN_USO' ? 'badge-info' : 'badge-warning'}`}>
                        {b?.estado === 'LIBRE' ? 'Libre' : b?.estado === 'EN_USO' ? 'En Uso' : 'Reservada'}
                      </span>
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <MapPin size={14} style={{ flexShrink: 0 }} /> {b?.ubicacion || 'Sin ubicación'}
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
                      <PlanoBodega zonas={zs} />
                      <div style={{
                        marginTop: '0.75rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                        gap: '0.375rem',
                      }}>
                        {zs.map(z => {
                          const pct = z.porcentajeOcupacion || 0
                          const dotColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e'
                          return (
                            <div key={z.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              padding: '0.3rem 0.6rem',
                              background: 'var(--bg-primary)',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              border: '1px solid var(--border)',
                            }}>
                              <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: dotColor, flexShrink: 0,
                              }} />
                              <span style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                              }}>{z.nombre}</span>
                              <span style={{
                                fontWeight: 600,
                                color: '#475569',
                                fontSize: '0.7rem',
                                whiteSpace: 'nowrap',
                              }}>{pct.toFixed(0)}%</span>
                            </div>
                          )
                        })}
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
