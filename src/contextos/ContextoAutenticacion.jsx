// Proveedor encargado de guardar la sesión del usuario y controlar el inicio de sesión.
// Importación del hook para manejar el estado de la sesión.
import { useState } from 'react'
// Importación del servicio que valida al usuario en la base de datos.
import { servicioDatos } from '../servicios/servicioDatos.js'
// Importación del contexto que compartirá los datos de autenticación.
import { ContextoAutenticacion } from './contextosBase.js'
// Importación de la validación de roles permitidos en las rutas.
import { esRolValido } from '../utilidades/rutasRoles.js'

// Nombre usado para guardar la sesión actual en el navegador sin mezclarla con otros datos.
const CLAVE_USUARIO = 'webtransmetrogt_usuario'

export function ProveedorAutenticacion({ children }) {
  // Al abrir la página se intenta recuperar la sesión guardada en el navegador.
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_USUARIO)
    if (!guardado) {
      return null
    }

    try {
      const usuario = JSON.parse(guardado)

      // Control de seguridad: si el rol guardado ya no existe, se limpia la sesión para evitar errores de ruta.
      if (!esRolValido(usuario?.rol)) {
        localStorage.removeItem(CLAVE_USUARIO)
        return null
      }

      return usuario
    } catch {
      localStorage.removeItem(CLAVE_USUARIO)
      return null
    }
  })
  // Indica al botón de inicio de sesión que debe quedar bloqueado mientras se valida la sesión.
  const [cargandoSesion, setCargandoSesion] = useState(false)

  // Valida el correo y contraseña contra la función SQL iniciar_sesion y guarda solo un usuario válido.
  async function iniciarSesion(correo, contrasena) {
    setCargandoSesion(true)
    try {
      const usuario = await servicioDatos.iniciarSesion(correo, contrasena)

      // Control de acceso: solo se permiten los roles definidos para esta fase del proyecto.
      if (!esRolValido(usuario?.rol)) {
        localStorage.removeItem(CLAVE_USUARIO)
        setUsuarioActual(null)
        throw new Error('El usuario tiene un rol no permitido en el sistema.')
      }

      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
      setUsuarioActual(usuario)
      return usuario
    } finally {
      setCargandoSesion(false)
    }
  }

  // Cierra la sesión local del navegador para que otra persona no use la cuenta anterior.
  function cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO)
    setUsuarioActual(null)
  }

  // Información y acciones disponibles para las pantallas que usan la sesión.
  const valor = {
    usuarioActual,
    cargandoSesion,
    iniciarSesion,
    cerrarSesion,
    estaAutenticado: Boolean(usuarioActual),
  }

  // Comparte la sesión actual con los componentes internos de la aplicación.
  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}
