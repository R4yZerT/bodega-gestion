import { useState } from 'react'
import { useAuth } from '../../contexts'
import { Warehouse, LogIn, UserPlus } from 'lucide-react'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await signUp(email, password, nombre)
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <div className="card" style={{ maxWidth: '420px', width: '100%', margin: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Warehouse size={48} color="var(--primary)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.75rem' }}>
            BodegaGestión
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {isRegister ? 'Crear una cuenta' : 'Iniciar sesión'}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Nombre completo</label>
              <input
                className="input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                required={isRegister}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Correo electrónico</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              'Procesando...'
            ) : isRegister ? (
              <>
                <UserPlus size={18} /> Crear cuenta
              </>
            ) : (
              <>
                <LogIn size={18} /> Iniciar sesión
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setIsRegister(!isRegister)
              setError('')
            }}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </a>
        </p>
      </div>
    </div>
  )
}