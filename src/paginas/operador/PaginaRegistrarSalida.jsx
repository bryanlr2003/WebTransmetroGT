// Formulario que cierra un recorrido cuando el bus sale de la estación.

// Hook para controlar el recorrido elegido y los datos de salida.
import { useState } from 'react'
// Componentes reutilizables para mensajes y tabla de recorridos pendientes.
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { TablaDatos } from '../../componentes/TablaDatos.jsx'
import { BotonAccion } from '../../componentes/BotonAccion.jsx'
// Hooks para filtrar los datos por estación y guardar la salida.
import { useAutenticacion } from '../../ganchos/useAutenticacion.js'
import { useAccionUnica } from '../../ganchos/useAccionUnica.js'
import { useDatos } from '../../ganchos/useDatos.js'
// Funciones para mostrar la llegada y cargar la hora actual por defecto.
import { formatearFecha, obtenerFechaHoraLocal } from '../../utilidades/formato.js'
import { obtenerNombre } from '../../utilidades/selectoresDatos.js'

export function PaginaRegistrarSalida() {
  // Usuario, datos y función compartida que actualiza la salida de un recorrido.
  const { usuarioActual } = useAutenticacion()
  const { datos, registrarSalidaRecorrido } = useDatos()

  // Estados del recorrido pendiente elegido, datos de salida y mensajes para el usuario.
  const [recorridoSeleccionado, setRecorridoSeleccionado] = useState(null)
  const [horaSalida, setHoraSalida] = useState(obtenerFechaHoraLocal())
  const [observacionSalida, setObservacionSalida] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  // Control reutilizable que bloquea Registrar salida hasta que termine el envío.
  const { procesando, ejecutar } = useAccionUnica()

  // Solo se listan buses que llegaron a la estación del operador y aún no tienen salida.
  const recorridosPendientes = (datos.recorridos || []).filter(
    (recorrido) =>
      Number(recorrido.estacion_id) === Number(usuarioActual?.estacion_id) &&
      recorrido.estado === 'en_estacion',
  )

  // La salida cierra el registro una sola vez, aunque el botón reciba varios clics.
  async function guardarSalida(evento) {
    evento.preventDefault()

    await ejecutar(async () => {
      setError('')
      setMensaje('')

      if (!recorridoSeleccionado) {
        setError('Seleccione un recorrido pendiente.')
        return
      }

      try {
        await registrarSalidaRecorrido(recorridoSeleccionado.id, horaSalida, observacionSalida)
        setMensaje('Salida registrada correctamente.')
        setRecorridoSeleccionado(null)
        setObservacionSalida('')
        setHoraSalida(obtenerFechaHoraLocal())
      } catch (err) {
        setError(err.message)
      }
    })
  }

  // La tabla permite elegir un recorrido; el formulario confirma su salida.
  return (
    <section>
      <div className="mb-4">
        <h1 className="titulo-seccion mb-1">Registrar salida de bus</h1>
        <p className="texto-suave">Cierre del registro cuando el bus sale de la estación.</p>
      </div>

      <MensajeEstado tipo="danger">{error}</MensajeEstado>
      <MensajeEstado tipo="success">{mensaje}</MensajeEstado>

      <div className="row g-4">
        <div className="col-lg-7">
          {/* La tabla permite elegir un solo recorrido antes de completar su formulario de salida. */}
          <div className="tarjeta-panel p-3">
            <h2 className="h5 mb-3">Recorridos pendientes</h2>
            <TablaDatos
              columnas={[
                {
                  campo: 'bus_id',
                  titulo: 'Bus',
                  render: (recorrido) => obtenerNombre(datos.buses, recorrido.bus_id, 'codigo'),
                },
                { campo: 'pasajeros', titulo: 'Pasajeros' },
                {
                  campo: 'hora_llegada',
                  titulo: 'Llegada',
                  render: (recorrido) => formatearFecha(recorrido.hora_llegada),
                },
              ]}
              datos={recorridosPendientes}
              acciones={(recorrido) => (
                <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => setRecorridoSeleccionado(recorrido)}>
                  Seleccionar
                </button>
              )}
            />
          </div>
        </div>

        <div className="col-lg-5">
          {/* El campo de hora es obligatorio y la función valida que exista un recorrido elegido. */}
          <form className="tarjeta-panel p-3" onSubmit={guardarSalida}>
            <h2 className="h5 mb-3">Datos de salida</h2>
            <div className="mb-3">
              <label className="form-label">Recorrido seleccionado</label>
              <input
                className="form-control"
                value={recorridoSeleccionado ? obtenerNombre(datos.buses, recorridoSeleccionado.bus_id, 'codigo') : 'Seleccione un recorrido'}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Hora de salida</label>
              <input
                type="datetime-local"
                className="form-control"
                value={horaSalida}
                onChange={(evento) => setHoraSalida(evento.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Observación de salida</label>
              <textarea
                className="form-control"
                rows="3"
                value={observacionSalida}
                onChange={(evento) => setObservacionSalida(evento.target.value)}
              />
            </div>
            {/* El botón se deshabilita mientras se registra la salida para no cerrar dos veces el recorrido. */}
            <BotonAccion
              type="submit"
              texto="Registrar salida"
              textoProcesando="Registrando..."
              procesando={procesando}
            />
          </form>
        </div>
      </div>
    </section>
  )
}
