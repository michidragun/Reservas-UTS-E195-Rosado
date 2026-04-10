import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0, pendientes: 0, aprobadas: 0, noLeidas: 0
  })

  useEffect(() => {
    if (perfil?.id) cargarStats()
  }, [perfil])

  async function cargarStats() {
    const [reservas, notifs] = await Promise.all([
      supabase.from('reservas').select('estado').eq('usuario_id', perfil.id),
      supabase.from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', perfil.id).eq('leida', false)
    ])

    const lista = reservas.data || []
    setStats({
      total: lista.length,
      pendientes: lista.filter(r => r.estado === 'pendiente').length,
      aprobadas: lista.filter(r => r.estado === 'aprobada').length,
      noLeidas: notifs.count || 0
    })
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              👋 Hola, {perfil?.nombre || 'Usuario'}
            </h1>
            <p className="page-subtitle">¿Qué necesitas hacer hoy?</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => navigate('/nueva-reserva')}>
            <div className="stat-number" style={{ color: 'var(--primary)' }}>
              📅
            </div>
            <div className="stat-label">Nueva Reserva</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
              Reservar un aula
            </p>
          </div>

          <div className="stat-card" onClick={() => navigate('/mis-reservas')}>
            <div className="stat-number" style={{ color: 'var(--success)' }}>
              {stats.total}
            </div>
            <div className="stat-label">Mis Reservas</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
              {stats.pendientes} pendientes · {stats.aprobadas} aprobadas
            </p>
          </div>

          <div className="stat-card" onClick={() => navigate('/notificaciones')}>
            <div className="stat-number" style={{ color: 'var(--warning)' }}>
              {stats.noLeidas > 0 ? stats.noLeidas : '🔔'}
            </div>
            <div className="stat-label">Notificaciones</div>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem',
              color: stats.noLeidas > 0 ? 'var(--danger)' : 'var(--gray-400)',
              fontWeight: stats.noLeidas > 0 ? '700' : 'normal'
            }}>
              {stats.noLeidas > 0
                ? `${stats.noLeidas} sin leer`
                : 'Sin notificaciones nuevas'
              }
            </p>
          </div>

          <div className="stat-card" onClick={() => navigate('/configuracion')}>
            <div className="stat-number" style={{ color: 'var(--gray-600)' }}>
              ⚙️
            </div>
            <div className="stat-label">Configuración</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>
              Editar mis datos
            </p>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="card">
          <div className="card-title">ℹ️ Cómo funciona</div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              ['1️⃣', 'Haz tu reserva',
               'Elige el aula, fecha y horario que necesitas.'],
              ['2️⃣', 'Espera la aprobación',
               'El administrador revisará y aprobará o rechazará tu solicitud.'],
              ['3️⃣', 'Recibe la notificación',
               'Te avisaremos con el resultado en tu feed de notificaciones.'],
            ].map(([emoji, titulo, desc]) => (
              <div key={titulo} style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                <div>
                  <strong>{titulo}</strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}