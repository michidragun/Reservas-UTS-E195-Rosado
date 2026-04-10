import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { perfil } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    if (perfil?.id) cargarNoLeidas()
  }, [perfil])

  async function cargarNoLeidas() {
    const { count } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', perfil.id)
      .eq('leida', false)
    setNoLeidas(count || 0)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const esAdmin = perfil?.rol === 'admin'
  const base = esAdmin ? '/admin/dashboard' : '/dashboard'

  function activo(path) {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  return (
    <nav className="navbar">
      <Link to={base} className="navbar-brand">
        🏫 ReservaAulas
        {esAdmin && (
          <span style={{
            fontSize: '0.65rem', background: 'var(--primary)',
            color: 'white', padding: '0.1rem 0.5rem',
            borderRadius: '999px', marginLeft: '0.5rem'
          }}>
            ADMIN
          </span>
        )}
      </Link>

      <ul className="navbar-nav">
        {esAdmin ? (
          // Nav del administrador
          <li>
            <Link to="/admin/dashboard" className={activo('/admin/dashboard')}>
              📊 Panel
            </Link>
          </li>
        ) : (
          // Nav del usuario normal
          <>
            <li>
              <Link to="/dashboard" className={activo('/dashboard')}>
                🏠 <span>Inicio</span>
              </Link>
            </li>
            <li>
              <Link to="/nueva-reserva" className={activo('/nueva-reserva')}>
                📅 <span>Nueva Reserva</span>
              </Link>
            </li>
            <li>
              <Link to="/mis-reservas" className={activo('/mis-reservas')}>
                📋 <span>Mis Reservas</span>
              </Link>
            </li>
            <li>
              <Link to="/notificaciones" className={activo('/notificaciones')}>
                🔔 <span>Notificaciones</span>
                {noLeidas > 0 && (
                  <span className="nav-badge">{noLeidas}</span>
                )}
              </Link>
            </li>
          </>
        )}

        <li>
          <button className="nav-link danger" onClick={cerrarSesion}>
            🚪 <span>Salir</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}