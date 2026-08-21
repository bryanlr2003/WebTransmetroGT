// Pantalla inicial: solicita credenciales y dirige al usuario según su rol.

// Importaciones de React para guardar los datos escritos en el formulario.
import { useState } from 'react'
// Importaciones para navegar y evitar que un usuario con sesión vea el login otra vez.
import { Navigate, useNavigate } from 'react-router-dom'
// Hooks propios para usar la sesión y comprobar la conexión con los datos.
import { useAutenticacion } from '../../ganchos/useAutenticacion.js'
import { useDatos } from '../../ganchos/useDatos.js'
// Componente para mostrar mensajes, botón que evita envíos repetidos y función para la ruta de cada rol.
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { BotonAccion } from '../../componentes/BotonAccion.jsx'
import { useAccionUnica } from '../../ganchos/useAccionUnica.js'
import { obtenerRutaPorRol } from '../../utilidades/rutasRoles.js'

export function Login() {
  // Navegación, sesión actual y aviso de carga que vienen de los hooks del sistema.
  const navegar = useNavigate()
  const { iniciarSesion, cargandoSesion, usuarioActual } = useAutenticacion()
  const { supabaseConfigurado } = useDatos()

  // Estados controlados para capturar las credenciales y mostrar un posible error.
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')

  // Bloquea el botón de inicio mientras se valida la sesión para evitar varios envíos.
  const { procesando, ejecutar } = useAccionUnica()

  // Envía correo y contraseña una vez, aunque se haga clic rápido sobre el botón.
  async function enviarFormulario(evento) {
    evento.preventDefault()

    await ejecutar(async () => {
      setError('')

      try {
        const usuario = await iniciarSesion(correo, contrasena)
        const rutaInicio = obtenerRutaPorRol(usuario.rol)

        // Si el rol no está permitido, no se deja entrar al sistema.
        if (!rutaInicio) {
          throw new Error('El usuario tiene un rol no permitido en el sistema.')
        }

        navegar(rutaInicio, { replace: true })
      } catch (err) {
        setError(err.message)
      }
    })
  }

  // Si ya hay sesión activa, evita mostrar el login de nuevo.
  if (usuarioActual) {
    const rutaInicio = obtenerRutaPorRol(usuarioActual.rol)

    if (rutaInicio) {
      return <Navigate to={rutaInicio} replace />
    }
  }

  // Estructura visual dividida entre la identidad de la plataforma y el formulario.
  return (
    <main className="pantalla-login">
      <section className="tarjeta-login">
        <div className="row g-0">
          <div className="col-lg-5 bg-success text-white p-4 p-lg-5 d-flex align-items-center justify-content-center text-center">
            <div>
              <span className="bg-white text-success rounded-2 d-inline-flex align-items-center justify-content-center" style={{ width: 52, height: 52 }}>
                <i className="bi bi-bus-front-fill fs-3"></i>
              </span>
              <h1 className="h3 mt-3 mb-1">Transmetro GT</h1>
              <p className="mb-0">Plataforma web</p>
            </div>
          </div>

          <div className="col-lg-7 p-4 p-lg-5">
            <h2 className="h3 fw-bold mb-2">Iniciar sesión</h2>

            {!supabaseConfigurado && (
              <MensajeEstado tipo="warning">
                Falta configurar Supabase en el archivo .env. Ejecute primero el script SQL y coloque las credenciales.
              </MensajeEstado>
            )}

            <MensajeEstado tipo="danger">{error}</MensajeEstado>

            {/* Los campos requeridos evitan enviar el formulario vacio desde el navegador. */}
            <form onSubmit={enviarFormulario}>
              <div className="mb-3">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  className="form-control"
                  value={correo}
                  onChange={(evento) => setCorreo(evento.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={contrasena}
                  onChange={(evento) => setContrasena(evento.target.value)}
                  required
                />
              </div>
              {/* El botón queda bloqueado hasta terminar la validación de las credenciales. */}
              <BotonAccion
                type="submit"
                className="btn btn-primario w-100"
                icono="bi-box-arrow-in-right"
                texto="Entrar al sistema"
                textoProcesando="Validando..."
                procesando={procesando || cargandoSesion}
              />
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
