import { Navigate } from 'react-router-dom'
import { useAutenticacion } from '../ganchos/useAutenticacion.js'
import { obtenerRutaPorRol } from '../utilidades/rutasRoles.js'

// Protege pantallas segun el rol del usuario autenticado.
export function RutaProtegida({ children, rolesPermitidos }) {
  const { usuarioActual } = useAutenticacion()

  // Si no hay sesion, se envia al login.
  if (!usuarioActual) {
    return <Navigate to="/login" replace />
  }

  // Si el rol no tiene permiso, se manda a la pantalla principal de su rol.
  if (!rolesPermitidos.includes(usuarioActual.rol)) {
    return <Navigate to={obtenerRutaPorRol(usuarioActual.rol) || '/login'} replace />
  }

  return children
}
