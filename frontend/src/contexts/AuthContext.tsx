import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthSession, AuthUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { authApi } from '../api/services'
import type { RolUsuario, Usuario } from '../types'

interface AuthContextType {
  user: AuthUser | null
  perfil: Usuario | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, nombreCompleto: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isSeguridad: boolean
  isUsuario: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Usuario | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const syncProfile = async (sessionUser: User | null) => {
    if (!sessionUser) {
      setPerfil(null)
      return
    }
    try {
      const { data } = await authApi.me()
      setPerfil(data.data)
    } catch {
      setPerfil(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s) {
        localStorage.setItem('sb-access-token', s.access_token)
        syncProfile(s.user)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s) {
          localStorage.setItem('sb-access-token', s.access_token)
          syncProfile(s.user)
        } else {
          localStorage.removeItem('sb-access-token')
          setPerfil(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, nombreCompleto: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await authApi.sync({ nombreCompleto })
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('sb-access-token')
    setUser(null)
    setPerfil(null)
    setSession(null)
  }

  const rol: RolUsuario = (perfil?.rol as RolUsuario)
    || (user?.app_metadata?.role as RolUsuario)
    || 'USUARIO'

  const value: AuthContextType = {
    user,
    perfil,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: rol === 'ADMIN',
    isSeguridad: rol === 'SEGURIDAD',
    isUsuario: rol === 'USUARIO',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}