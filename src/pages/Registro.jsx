import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    password: '', password2: ''
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.nombre || !form.email || !form.password || !form.password2) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setCargando(true)

    try {
      // 1. Crea el usuario en Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          // Desactiva confirmación por email para desarrollo
          emailRedirectTo: undefined
        }
      })

      if (authError) throw authError

      // 2. Guarda el perfil en la tabla usuarios
      const { error: perfilError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
          rol: 'user'
        })

      if (perfilError) throw perfilError

      navigate('/dashboard')

    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('Ya existe una cuenta con ese correo')
      } else {
        setError('Error al crear cuenta: ' + err.message)
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🏫 ReservaAulas</h1>
          <p>Crear cuenta nueva</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre completo *</label>
            <input
              type="text" name="nombre" className="form-control"
              placeholder="Tu nombre completo"
              value={form.nombre} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo electrónico *</label>
            <input
              type="email" name="email" className="form-control"
              placeholder="tu@email.com"
              value={form.email} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel" name="telefono" className="form-control"
              placeholder="Ej: 3001234567"
              value={form.telefono} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña *</label>
            <input
              type="password" name="password" className="form-control"
              placeholder="Mínimo 6 caracteres"
              value={form.password} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar contraseña *</label>
            <input
              type="password" name="password2" className="form-control"
              placeholder="Repite la contraseña"
              value={form.password2} onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={cargando}
          >
            {cargando
              ? <><div className="loader"></div> Creando cuenta...</>
              : 'Crear Cuenta'
            }
          </button>
        </form>

        <div style={{
          textAlign: 'center', margin: '1.5rem 0',
          color: 'var(--gray-400)', fontSize: '0.875rem'
        }}>
          ¿Ya tienes cuenta?
        </div>

        <Link to="/login" className="btn btn-outline btn-block">
          Iniciar sesión
        </Link>
      </div>
    </div>
  )
}