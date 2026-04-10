import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const BLOQUES = [
  { inicio: '07:00', fin: '08:30' },
  { inicio: '08:30', fin: '10:00' },
  { inicio: '10:00', fin: '11:30' },
  { inicio: '11:30', fin: '13:00' },
  { inicio: '13:00', fin: '14:30' },
  { inicio: '14:30', fin: '16:00' },
  { inicio: '16:00', fin: '17:30' },
  { inicio: '17:30', fin: '19:00' },
  { inicio: '19:00', fin: '20:30' },
  { inicio: '20:30', fin: '22:00' },
]

export default function NuevaReserva() {
  const { perfil } = useAuth()
  const navigate = useNavigate()

  const [aulas, setAulas] = useState([])
  const [ocupados, setOcupados] = useState([])
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  // Si no hay perfil todavía, muestra loader
  if (!perfil) {
    return (
      <>
        <Navbar />
        <div className="flex-center" style={{ height: '60vh' }}>
          <div className="loader-grande"></div>
        </div>
      </>
    )
  }

  const hoy = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    nombre: '',
    contacto: '',
    motivo: '',
    aula_id: '',
    fecha: hoy,
  })

  useEffect(() => {
    cargarAulas()
    if (perfil) {
      setForm(f => ({
        ...f,
        nombre: perfil.nombre || '',
        contacto: perfil.telefono || ''
      }))
    }
  }, [perfil])

  useEffect(() => {
    if (form.aula_id && form.fecha) verificarDisponibilidad()
  }, [form.aula_id, form.fecha])

  async function cargarAulas() {
    const { data } = await supabase
      .from('aulas')
      .select('*')
      .eq('activa', true)
      .order('nombre')
    setAulas(data || [])
  }

  async function verificarDisponibilidad() {
    setBloqueSeleccionado(null)
    const { data } = await supabase
      .from('reservas')
      .select('hora_inicio')
      .eq('aula_id', form.aula_id)
      .eq('fecha', form.fecha)
      .eq('estado', 'aprobada')

    setOcupados((data || []).map(r => r.hora_inicio))
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!perfil?.id) {
      setError('Error: sesión no válida. Por favor recarga la página.')
      return
    }

    if (!form.nombre || !form.contacto || !form.motivo ||
        !form.aula_id || !form.fecha || !bloqueSeleccionado) {
      setError('Por favor completa todos los campos y selecciona un horario')
      return
    }

    setCargando(true)

    try {
      const { error: err } = await supabase.from('reservas').insert({
        usuario_id: perfil.id,
        aula_id: parseInt(form.aula_id),
        fecha: form.fecha,
        hora_inicio: bloqueSeleccionado.inicio,
        hora_fin: bloqueSeleccionado.fin,
        motivo: form.motivo,
        contacto: form.contacto,
        nombre_solicitante: form.nombre,
        estado: 'pendiente'
      })

      if (err) throw err

      setExito('✅ Reserva enviada. Espera la aprobación del administrador.')
      setTimeout(() => navigate('/mis-reservas'), 2500)

    } catch (err) {
      console.error('Error al crear reserva:', err)
      setError('Error al enviar la reserva: ' + err.message)
    } finally {
      setCargando(false)
    }
  }

  const aulaSeleccionada = aulas.find(a => a.id === parseInt(form.aula_id))

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">📅 Nueva Reserva</h1>
            <p className="page-subtitle">
              Completa el formulario para solicitar un aula
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            ← Volver
          </button>
        </div>

        {error  && <div className="alert alert-danger">{error}</div>}
        {exito  && <div className="alert alert-success">{exito}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">

            {/* Columna izquierda */}
            <div>
              <div className="card mb-2">
                <div className="card-title">👤 Tus datos</div>

                <div className="form-group">
                  <label className="form-label">Nombre completo *</label>
                  <input
                    type="text" name="nombre" className="form-control"
                    placeholder="Tu nombre"
                    value={form.nombre} onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contacto *</label>
                  <input
                    type="text" name="contacto" className="form-control"
                    placeholder="Teléfono o email de contacto"
                    value={form.contacto} onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Motivo de la reserva *</label>
                  <textarea
                    name="motivo" className="form-control"
                    placeholder="¿Para qué necesitas el aula?"
                    value={form.motivo} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-title">🏛️ Seleccionar Aula</div>
                <div className="form-group">
                  <label className="form-label">Aula *</label>
                  <select
                    name="aula_id" className="form-control"
                    value={form.aula_id} onChange={handleChange}
                  >
                    <option value="">-- Selecciona un aula --</option>
                    {aulas.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div>
              <div className="card mb-2">
                <div className="card-title">📆 Fecha</div>
                <div className="form-group">
                  <label className="form-label">Fecha de la reserva *</label>
                  <input
                    type="date" name="fecha" className="form-control"
                    min={hoy} value={form.fecha} onChange={handleChange}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-title">⏰ Bloque Horario</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)',
                            marginBottom: '0.5rem' }}>
                  Bloques de 1 hora y 30 minutos
                </p>

                {!form.aula_id || !form.fecha ? (
                  <p style={{ textAlign: 'center', padding: '2rem',
                              color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                    👆 Selecciona un aula y fecha primero
                  </p>
                ) : (
                  <div className="bloques-grid">
                    {BLOQUES.map(bloque => {
                      const ocupado = ocupados.includes(bloque.inicio)
                      const seleccionado =
                        bloqueSeleccionado?.inicio === bloque.inicio

                      let clase = 'bloque'
                      if (ocupado) clase += ' ocupado'
                      else if (seleccionado) clase += ' seleccionado'

                      return (
                        <div
                          key={bloque.inicio}
                          className={clase}
                          onClick={() => {
                            if (!ocupado) setBloqueSeleccionado(bloque)
                          }}
                        >
                          {bloque.inicio} - {bloque.fin}
                          {ocupado && (
                            <div className="bloque-label"
                                 style={{ color: 'var(--danger)' }}>
                              Ocupado
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {bloqueSeleccionado && (
                  <div style={{
                    marginTop: '1rem', padding: '0.75rem',
                    background: 'var(--primary-light)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #bfdbfe',
                    fontSize: '0.9rem'
                  }}>
                    ✅ Seleccionado: <strong>
                      {bloqueSeleccionado.inicio} — {bloqueSeleccionado.fin}
                    </strong>
                    {aulaSeleccionada && (
                      <span> en <strong>{aulaSeleccionada.nombre}</strong></span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={cargando || !bloqueSeleccionado}
            >
              {cargando
                ? <><div className="loader"></div> Enviando...</>
                : '📤 Enviar Solicitud'
              }
            </button>
          </div>
        </form>
      </div>
    </>
  )
}