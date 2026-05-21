import { Layout } from '../../components/layout/Layout'

export function ClienteObjetosPage() {
  return (
    <Layout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Mis Objetos</h1>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Gestión de tus objetos almacenados.
        </p>
      </div>
      <div className="card">
        <p>Próximamente: Lista de objetos</p>
      </div>
    </Layout>
  )
}
