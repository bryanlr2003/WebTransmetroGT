// Hook para obtener el usuario actual y cerrar su sesión.
import { useAutenticacion } from '../ganchos/useAutenticacion.js'
// Hook que indica si la aplicación está conectada a Supabase.
import { useDatos } from '../ganchos/useDatos.js'

// Barra superior con nombre del usuario, rol y botón para cerrar sesión.
export function BarraSuperior() {
  const { usuarioActual, cerrarSesion } = useAutenticacion()
  const { supabaseConfigurado } = useDatos()

  return (
    <header className="barra-superior px-3 px-lg-4 py-3 d-flex justify-content-between align-items-center">
      <div>
        <div className="fw-semibold">Plataforma Web Transmetro GT</div>
        <small className="texto-suave">Control administrativo y operativo</small>
      </div>
      <div className="d-flex align-items-center gap-3">
        {/* Aviso visible solo si falta configurar la conexión de Supabase. */}
        {!supabaseConfigurado && (
          <span className="badge text-bg-warning d-none d-md-inline">
            Supabase pendiente de conexión
          </span>
        )}
        {/* Datos del usuario que mantiene la sesión activa. */}
        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold">{usuarioActual?.nombre}</div>
          <small className="text-capitalize texto-suave">{usuarioActual?.rol}</small>
        </div>
        {/* Ejecuta la función del contexto para finalizar la sesión. */}
        <button className="btn btn-outline-danger btn-sm" type="button" onClick={cerrarSesion}>
          <i className="bi bi-box-arrow-right me-1"></i>
          Salir
        </button>
      </div>
    </header>
  )
}
