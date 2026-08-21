// Navigate permite enviar al usuario a otra ruta cuando no tiene acceso.
import { Navigate } from 'react-router-dom'
// Hook que proporciona los datos de la sesión actual.
import { useAutenticacion } from '../ganchos/useAutenticacion.js'
// Función que obtiene la pantalla principal correspondiente a cada rol.
import { obtenerRutaPorRol } from '../utilidades/rutasRoles.js'

// Protege pantallas según el rol del usuario autenticado.
// children es la pantalla a mostrar y rolesPermitidos contiene los roles autorizados.
export function RutaProtegida({ children, rolesPermitidos }) {
  const { usuarioActual } = useAutenticacion()

  // Si no hay sesión, se envía al login.
  if (!usuarioActual) {
    return <Navigate to="/login" replace />
  }

  // Si el rol no tiene permiso, se manda a la pantalla principal de su rol.
  if (!rolesPermitidos.includes(usuarioActual.rol)) {
    return <Navigate to={obtenerRutaPorRol(usuarioActual.rol) || '/login'} replace />
  }

  return children
}
