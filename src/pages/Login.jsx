import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos')
      return
    }

    setCargando(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })

      if (authError) throw authError

      // Obtiene el perfil para saber si es admin
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', data.user.id)
        .single()

      if (perfil?.rol === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }

    } catch (err) {
      if (err.message.includes('Invalid login')) {
        setError('Correo o contraseña incorrectos')
      } else if (err.message.includes('Email not confirmed')) {
        setError('Debes confirmar tu correo antes de iniciar sesión')
      } else {
        setError('Error al iniciar sesión: ' + err.message)
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
          <p>Sistema de Reserva de Aulas</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={cargando}
          >
            {cargando
              ? <><div className="loader"></div> Iniciando sesión...</>
              : 'Iniciar Sesión'
            }
          </button>
        </form>

        <div style={{
          textAlign: 'center', margin: '1.5rem 0',
          color: 'var(--gray-400)', fontSize: '0.875rem'
        }}>
          ¿No tienes cuenta?
        </div>

        <Link to="/registro" className="btn btn-outline btn-block">
          Crear cuenta nueva
        </Link>
      </div>
    </div>
  )
}