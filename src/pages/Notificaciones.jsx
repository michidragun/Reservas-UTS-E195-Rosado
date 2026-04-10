import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Notificaciones() {
  const { perfil } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (perfil?.id) cargarNotificaciones()
  }, [perfil])

  async function cargarNotificaciones() {
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', perfil.id)
      .order('created_at', { ascending: false })

    setNotificaciones(data || [])
    setCargando(false)
  }

  async function marcarLeida(id) {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id)

    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    )
  }

  async function marcarTodasLeidas() {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', perfil.id)
      .eq('leida', false)

    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
  }

  function formatFecha(ts) {
    if (!ts) return ''
    return new Date(ts).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">🔔 Notificaciones</h1>
            <p className="page-subtitle">
              Respuestas del administrador a tus solicitudes
            </p>
          </div>
          {noLeidas > 0 && (
            <button className="btn btn-outline" onClick={marcarTodasLeidas}>
              ✓ Marcar todas como leídas
            </button>
          )}
        </div>

        {cargando ? (
          <div className="flex-center" style={{ padding: '4rem' }}>
            <div className="loader-grande"></div>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔕</p>
            <p style={{ fontSize: '1.1rem', color: 'var(--gray-600)' }}>
              No tienes notificaciones aún
            </p>
            <p className="text-muted">
              Aquí aparecerán las respuestas a tus reservas.
            </p>
          </div>
        ) : (
          <div>
            {notificaciones.map(n => (
              <div
                key={n.id}
                className={`notif-item ${!n.leida ? 'no-leida' : ''}`}
              >
                <div className={`notif-icon ${n.tipo}`}>
                  {n.tipo === 'aprobada' ? '✅' : '❌'}
                </div>

                <div className="notif-content">
                  <div className="notif-titulo">{n.titulo}</div>
                  <div className="notif-mensaje">{n.mensaje}</div>
                  <div className="notif-fecha">{formatFecha(n.created_at)}</div>
                </div>

                {!n.leida && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => marcarLeida(n.id)}
                  >
                    ✓ Leída
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}