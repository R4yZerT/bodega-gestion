import { Layout } from '../../components/layout/Layout'

export function ClienteMovimientosPage() {
  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Movimientos</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Historial de movimientos de tus objetos.
        </p>
      </div>
      <div className="card">
        <p>Próximamente: Historial de movimientos</p>
      </div>
    </Layout>
  )
}
