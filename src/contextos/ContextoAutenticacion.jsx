import { useState } from 'react'
import { servicioDatos } from '../servicios/servicioDatos.js'
import { ContextoAutenticacion } from './contextosBase.js'
import { esRolValido } from '../utilidades/rutasRoles.js'

const CLAVE_USUARIO = 'webtransmetrogt_usuario'

export function ProveedorAutenticacion({ children }) {
  // Al abrir la pagina se intenta recuperar la sesion guardada en el navegador.
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_USUARIO)
    if (!guardado) {
      return null
    }

    try {
      const usuario = JSON.parse(guardado)

      // Si el rol guardado ya no existe, se limpia la sesion para evitar errores de ruta.
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
  const [cargandoSesion, setCargandoSesion] = useState(false)

  // Valida el correo y contrasena contra la funcion SQL iniciar_sesion.
  async function iniciarSesion(correo, contrasena) {
    setCargandoSesion(true)
    try {
      const usuario = await servicioDatos.iniciarSesion(correo, contrasena)

      // Solo se permiten los roles definidos para esta fase del proyecto.
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

  // Cierra la sesion local del navegador.
  function cerrarSesion() {
    localStorage.removeItem(CLAVE_USUARIO)
    setUsuarioActual(null)
  }

  const valor = {
    usuarioActual,
    cargandoSesion,
    iniciarSesion,
    cerrarSesion,
    estaAutenticado: Boolean(usuarioActual),
  }

  return (
    <ContextoAutenticacion.Provider value={valor}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}
