import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'

export default function AdminDashboard() {
  const { perfil } = useAuth()
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [modal, setModal] = useState(null) // { reserva, accion }
  const [mensaje, setMensaje] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    cargarReservas()
  }, [])

  async function cargarReservas() {
    const { data } = await supabase
      .from('reservas')
      .select(`*, aulas(nombre), usuarios(nombre, email)`)
      .order('created_at', { ascending: false })

    setReservas(data || [])
    setCargando(false)
  }

  async function procesarReserva() {
    if (!modal) return
    setProcesando(true)

    try {
      // 1. Actualiza el estado de la reserva
      const { error } = await supabase
        .from('reservas')
        .update({
          estado: modal.accion,
          mensaje_admin: mensaje
        })
        .eq('id', modal.reserva.id)

      if (error) throw error

      // 2. Crea la notificación para el usuario
      const titulo = modal.accion === 'aprobada'
        ? '✅ Reserva Aprobada'
        : '❌ Reserva Rechazada'

      const cuerpo = modal.accion === 'aprobada'
        ? `Tu reserva del ${formatFecha(modal.reserva.fecha)} en ${modal.reserva.aulas?.nombre} (${modal.reserva.hora_inicio?.slice(0,5)} - ${modal.reserva.hora_fin?.slice(0,5)}) fue APROBADA.${mensaje ? ' Mensaje: ' + mensaje : ''}`
        : `Tu reserva del ${formatFecha(modal.reserva.fecha)} en ${modal.reserva.aulas?.nombre} (${modal.reserva.hora_inicio?.slice(0,5)} - ${modal.reserva.hora_fin?.slice(0,5)}) fue RECHAZADA.${mensaje ? ' Motivo: ' + mensaje : ''}`

      await supabase.from('notificaciones').insert({
        usuario_id: modal.reserva.usuario_id,
        reserva_id: modal.reserva.id,
        titulo,
        mensaje: cuerpo,
        tipo: modal.accion,
        leida: false
      })

      // 3. Actualiza la lista localmente
      setReservas(prev => prev.map(r =>
        r.id === modal.reserva.id
          ? { ...r, estado: modal.accion, mensaje_admin: mensaje }
          : r
      ))

      setToast(modal.accion === 'aprobada'
        ? '✅ Reserva aprobada — usuario notificado'
        : '❌ Reserva rechazada — usuario notificado'
      )
      setTimeout(() => setToast(''), 3500)
      setModal(null)
      setMensaje('')

    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setProcesando(false)
    }
  }

  function formatFecha(fecha) {
    if (!fecha) return '-'
    const [y, m, d] = fecha.split('-')
    return `${d}/${m}/${y}`
  }

  const reservasFiltradas = filtro === 'todos'
    ? reservas
    : reservas.filter(r => r.estado === filtro)

  const stats = {
    total:     reservas.length,
    pendiente: reservas.filter(r => r.estado === 'pendiente').length,
    aprobada:  reservas.filter(r => r.estado === 'aprobada').length,
    rechazada: reservas.filter(r => r.estado === 'rechazada').length,
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">📊 Panel de Administrador</h1>
            <p className="page-subtitle">
              Bienvenido, <strong>{perfil?.nombre}</strong>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Total', valor: stats.total,     color: 'var(--primary)' },
            { label: '⏳ Pendientes', valor: stats.pendiente, color: 'var(--warning)' },
            { label: '✅ Aprobadas',  valor: stats.aprobada,  color: 'var(--success)' },
            { label: '❌ Rechazadas', valor: stats.rechazada, color: 'var(--danger)'  },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-number" style={{ color: s.color }}>
                {s.valor}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="card mb-2" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--gray-600)',
                           alignSelf: 'center' }}>
              Filtrar:
            </span>
            {[
              { valor: 'todos',     label: 'Todos' },
              { valor: 'pendiente', label: '⏳ Pendientes' },
              { valor: 'aprobada',  label: '✅ Aprobadas' },
              { valor: 'rechazada', label: '❌ Rechazadas' },
            ].map(f => (
              <button
                key={f.valor}
                className={`btn btn-sm ${filtro === f.valor ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFiltro(f.valor)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        {cargando ? (
          <div className="flex-center" style={{ padding: '4rem' }}>
            <div className="loader-grande"></div>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <p style={{ fontSize: '2rem' }}>📭</p>
            <p className="text-muted">No hay reservas para mostrar</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Solicitante</th>
                  <th>Contacto</th>
                  <th>Aula</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map(r => (
                  <tr key={r.id}>
                    <td>
                      <span className={`badge badge-${r.estado}`}>
                        {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {r.usuarios?.nombre || r.nombre_solicitante}
                      </div>
                      <div style={{ fontSize: '0.8rem',
                                   color: 'var(--gray-400)' }}>
                        {r.usuarios?.email}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{r.contacto}</td>
                    <td><strong>{r.aulas?.nombre}</strong></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatFecha(r.fecha)}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      {r.hora_inicio?.slice(0,5)} - {r.hora_fin?.slice(0,5)}
                    </td>
                    <td style={{ fontSize: '0.875rem', maxWidth: '180px' }}>
                      {r.motivo}
                    </td>
                    <td>
                      {r.estado === 'pendiente' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => {
                              setModal({ reserva: r, accion: 'aprobada' })
                              setMensaje('')
                            }}
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              setModal({ reserva: r, accion: 'rechazada' })
                              setMensaje('')
                            }}
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted"
                              style={{ fontSize: '0.8rem' }}>
                          {r.mensaje_admin || 'Procesada'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => {
          if (e.target.className === 'modal-overlay') setModal(null)
        }}>
          <div className="modal">
            <div className="modal-title">
              {modal.accion === 'aprobada'
                ? '✅ Aprobar Reserva'
                : '❌ Rechazar Reserva'
              }
            </div>
            <p style={{ color: 'var(--gray-600)', marginBottom: '1rem',
                        fontSize: '0.9rem' }}>
              {modal.reserva.aulas?.nombre} —{' '}
              {formatFecha(modal.reserva.fecha)} —{' '}
              {modal.reserva.hora_inicio?.slice(0,5)} a{' '}
              {modal.reserva.hora_fin?.slice(0,5)}
            </p>

            <div className="form-group">
              <label className="form-label">
                Mensaje para el usuario (opcional)
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder={
                  modal.accion === 'aprobada'
                    ? 'Ej: Todo en orden, el aula estará lista.'
                    : 'Ej: El aula ya está reservada para ese día.'
                }
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setModal(null)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                className={`btn ${modal.accion === 'aprobada'
                  ? 'btn-success' : 'btn-danger'}`}
                onClick={procesarReserva}
                disabled={procesando}
              >
                {procesando
                  ? <><div className="loader"></div> Procesando...</>
                  : 'Confirmar'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast alert alert-success">{toast}</div>
      )}
    </>
  )
}