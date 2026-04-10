import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Loader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      height: '100vh', gap: '1rem'
    }}>
      <div className="loader-grande"></div>
      <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>
        Cargando...
      </p>
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

export function AdminRoute({ children }) {
  const { user, perfil, loading } = useAuth()
  if (loading)               return <Loader />
  if (!user)                 return <Navigate to="/login" replace />
  if (perfil?.rol !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}