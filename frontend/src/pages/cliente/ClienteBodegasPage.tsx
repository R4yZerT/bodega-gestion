import { Layout } from '../../components/layout/Layout'

export function ClienteBodegasPage() {
  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mis Bodegas</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Información de las bodegas que tienes asignadas.
        </p>
      </div>
      <div className="card">
        <p>Próximamente: Lista de bodegas</p>
      </div>
    </Layout>
  )
}
