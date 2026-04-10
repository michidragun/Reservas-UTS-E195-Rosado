import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function MisReservas() {
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (perfil?.id) cargarReservas()
  }, [perfil])

  async function cargarReservas() {
    const { data } = await supabase
      .from('reservas')
      .select(`
        *,
        aulas ( nombre )
      `)
      .eq('usuario_id', perfil.id)
      .order('created_at', { ascending: false })

    setReservas(data || [])
    setCargando(false)
  }

  function badgeEstado(estado) {
    const clases = {
      pendiente: 'badge badge-pendiente',
      aprobada:  'badge badge-aprobada',
      rechazada: 'badge badge-rechazada',
    }
    return clases[estado] || 'badge'
  }

  function formatFecha(fecha) {
    if (!fecha) return '-'
    const [y, m, d] = fecha.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">📋 Mis Reservas</h1>
            <p className="page-subtitle">Historial de tus solicitudes</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/nueva-reserva')}
          >
            + Nueva Reserva
          </button>
        </div>

        {cargando ? (
          <div className="flex-center" style={{ padding: '4rem' }}>
            <div className="loader-grande"></div>
          </div>
        ) : reservas.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
            <p style={{ fontSize: '1.1rem', color: 'var(--gray-600)' }}>
              Aún no tienes reservas
            </p>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              ¡Solicita tu primera reserva ahora!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/nueva-reserva')}
            >
              Hacer mi primera reserva
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Aula</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Motivo</th>
                  <th>Mensaje del Admin</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => (
                  <tr key={r.id}>
                    <td>
                      <span className={badgeEstado(r.estado)}>
                        {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                      </span>
                    </td>
                    <td><strong>{r.aulas?.nombre || '-'}</strong></td>
                    <td>{formatFecha(r.fecha)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {r.hora_inicio?.slice(0,5)} - {r.hora_fin?.slice(0,5)}
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '0.875rem' }}>
                      {r.motivo}
                    </td>
                    <td style={{ fontSize: '0.875rem',
                                 color: 'var(--gray-600)' }}>
                      {r.mensaje_admin || (
                        <span className="text-muted">Sin mensaje</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}