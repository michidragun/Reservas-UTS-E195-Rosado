import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import NuevaReserva from './pages/NuevaReserva'
import MisReservas from './pages/MisReservas'
import Notificaciones from './pages/Notificaciones'
import AdminDashboard from './pages/admin/AdminDashboard'

import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta raíz → login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas (requieren login) */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/nueva-reserva" element={
            <ProtectedRoute><NuevaReserva /></ProtectedRoute>
          } />
          <Route path="/mis-reservas" element={
            <ProtectedRoute><MisReservas /></ProtectedRoute>
          } />
          <Route path="/notificaciones" element={
            <ProtectedRoute><Notificaciones /></ProtectedRoute>
          } />

          {/* Rutas solo para admin */}
          <Route path="/admin/dashboard" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />

          {/* Cualquier ruta desconocida → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App