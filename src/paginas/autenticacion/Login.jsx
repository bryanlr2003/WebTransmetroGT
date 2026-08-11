import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAutenticacion } from '../../ganchos/useAutenticacion.js'
import { useDatos } from '../../ganchos/useDatos.js'
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { obtenerRutaPorRol } from '../../utilidades/rutasRoles.js'

export function Login() {
  const navegar = useNavigate()
  const { iniciarSesion, cargandoSesion, usuarioActual } = useAutenticacion()
  const { supabaseConfigurado } = useDatos()

  // Estados controlados para capturar las credenciales del formulario.
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')

  // Envia correo y contrasena al proveedor de autenticacion.
  async function enviarFormulario(evento) {
    evento.preventDefault()
    setError('')

    try {
      const usuario = await iniciarSesion(correo, contrasena)
      const rutaInicio = obtenerRutaPorRol(usuario.rol)

      // Si el rol no esta permitido, no se deja entrar al sistema.
      if (!rutaInicio) {
        throw new Error('El usuario tiene un rol no permitido en el sistema.')
      }

      navegar(rutaInicio, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  // Si ya hay sesion activa, evita mostrar el login de nuevo.
  if (usuarioActual) {
    const rutaInicio = obtenerRutaPorRol(usuarioActual.rol)

    if (rutaInicio) {
      return <Navigate to={rutaInicio} replace />
    }
  }

  return (
    <main className="pantalla-login">
      <section className="tarjeta-login">
        <div className="row g-0">
          <div className="col-lg-5 bg-success text-white p-4 p-lg-5 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className="bg-white text-success rounded-2 d-inline-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                  <i className="bi bi-bus-front-fill fs-4"></i>
                </span>
                <div>
                  <h1 className="h4 mb-0">Transmetro GT</h1>
                  <small>Control administrativo</small>
                </div>
              </div>
              <p className="lead mb-0">
                Sistema web para administrar lineas, estaciones, buses, recorridos y alertas de capacidad.
              </p>
            </div>
            <small className="opacity-75 mt-4">
              Proyecto privado del area de analisis, diseno y desarrollo de sistemas.
            </small>
          </div>

          <div className="col-lg-7 p-4 p-lg-5">
            <h2 className="h3 fw-bold mb-2">Iniciar sesion</h2>
            <p className="texto-suave mb-4">
              Ingrese las credenciales registradas en Supabase.
            </p>

            {!supabaseConfigurado && (
              <MensajeEstado tipo="warning">
                Falta configurar Supabase en el archivo .env. Ejecute primero el script SQL y coloque las credenciales.
              </MensajeEstado>
            )}

            <MensajeEstado tipo="danger">{error}</MensajeEstado>

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
                <label className="form-label">Contrasena</label>
                <input
                  type="password"
                  className="form-control"
                  value={contrasena}
                  onChange={(evento) => setContrasena(evento.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primario w-100" type="submit" disabled={cargandoSesion}>
                {cargandoSesion ? 'Validando...' : 'Entrar al sistema'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
