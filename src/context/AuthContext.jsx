import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [perfil, setPerfil]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carga la sesión una sola vez al inicio
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        cargarPerfil(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Escucha solo LOGIN y LOGOUT
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          cargarPerfil(session.user.id)
        }
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setPerfil(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function cargarPerfil(uid) {
    console.log('🔍 Buscando perfil uid:', uid)
    setLoading(true)

    // Intento 1: buscar perfil existente
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', uid)
      .maybeSingle()

    console.log('📦 Resultado:', data, error)

    if (data) {
      setPerfil(data)
      setLoading(false)
      return
    }

    // Intento 2: crear perfil si no existe
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const nombre = authUser?.user_metadata?.full_name
      || authUser?.email?.split('@')[0]
      || 'Usuario'

    const { data: nuevo, error: errCreate } = await supabase
      .from('usuarios')
      .insert({
        id:       uid,
        nombre,
        email:    authUser?.email || '',
        telefono: '',
        rol:      'user'
      })
      .select()
      .single()

    console.log('➕ Perfil creado:', nuevo, errCreate)

    if (nuevo) setPerfil(nuevo)
    setLoading(false)
  }

  async function recargarPerfil() {
    if (user?.id) await cargarPerfil(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, recargarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}