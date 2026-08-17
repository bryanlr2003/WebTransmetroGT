// Formulario usado por el operador para registrar la llegada de un bus.

// Hooks de React para guardar los valores del formulario y calcular listas relacionadas.
import { useMemo, useState } from 'react'
// Mensaje reutilizable para mostrar errores, confirmaciones y alertas de capacidad.
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { BotonAccion } from '../../componentes/BotonAccion.jsx'
// Hooks propios para conocer al usuario actual y guardar el recorrido.
import { useAutenticacion } from '../../ganchos/useAutenticacion.js'
import { useAccionUnica } from '../../ganchos/useAccionUnica.js'
import { useDatos } from '../../ganchos/useDatos.js'
// Funciones para la hora local, reglas de capacidad y búsqueda de registros.
import { obtenerFechaHoraLocal } from '../../utilidades/formato.js'
import { evaluarCapacidadBus } from '../../utilidades/reglasCapacidad.js'
import { buscarPorId, estacionesDeLinea, obtenerEstacionOperador } from '../../utilidades/selectoresDatos.js'

export function PaginaRegistrarLlegada() {
  // Usuario, datos y función que registra la llegada en la base de datos.
  const { usuarioActual } = useAutenticacion()
  const { datos, registrarRecorrido } = useDatos()

  // El operador trabaja únicamente con la estación asignada por el administrador.
  const estacion = obtenerEstacionOperador(datos, usuarioActual)

  // Estados de los campos del formulario y mensajes que se muestran después de guardar.
  const [lineaId, setLineaId] = useState('')
  const [busId, setBusId] = useState('')
  const [pasajeros, setPasajeros] = useState('')
  const [horaLlegada, setHoraLlegada] = useState(obtenerFechaHoraLocal())
  const [observacion, setObservacion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  // Control reutilizable que desactiva Guardar mientras se envía la llegada.
  const { procesando, ejecutar } = useAccionUnica()

  // Muestra solo las líneas que pasan por la estación del operador.
  const lineasDeEstacion = useMemo(() => {
    const relaciones = (datos.linea_estacion || []).filter(
      (item) => Number(item.estacion_id) === Number(estacion?.id),
    )
    return relaciones
      .map((relacion) => buscarPorId(datos.lineas || [], relacion.linea_id))
      .filter(Boolean)
  }, [datos, estacion])

  // Al escoger línea, se muestran solo buses activos de esa línea.
  const busesDisponibles = (datos.buses || []).filter(
    (bus) => Number(bus.linea_id) === Number(lineaId) && bus.estado === 'activo',
  )

  const busSeleccionado = buscarPorId(datos.buses || [], busId)

  // Evaluación previa para que el operador vea si hay alerta antes de guardar.
  const resultadoCapacidad = evaluarCapacidadBus(busSeleccionado, pasajeros)

  // Orden de estaciones de la línea seleccionada, usado como referencia visual.
  const rutaLinea = estacionesDeLinea(datos, lineaId)

  // Guarda una llegada una sola vez y genera alerta si aplica.
  async function enviarFormulario(evento) {
    evento.preventDefault()

    await ejecutar(async () => {
      setError('')
      setMensaje('')

      if (!estacion) {
        setError('El operador no tiene estación asignada.')
        return
      }

      try {
        const resultado = await registrarRecorrido({
          bus_id: Number(busId),
          linea_id: Number(lineaId),
          estacion_id: Number(estacion.id),
          usuario_id: Number(usuarioActual.id),
          pasajeros: Number(pasajeros),
          hora_llegada: horaLlegada,
          observacion,
        })

        setMensaje(resultado?.mensaje_alerta || 'Llegada registrada correctamente.')
        setPasajeros('')
        setObservacion('')
        setHoraLlegada(obtenerFechaHoraLocal())
      } catch (err) {
        setError(err.message)
      }
    })
  }

  // Formulario de llegada y panel lateral de evaluación de capacidad.
  return (
    <section>
      <div className="mb-4">
        <h1 className="titulo-seccion mb-1">Registrar llegada de bus</h1>
        <p className="texto-suave">
          El sistema evaluará automáticamente la capacidad del bus registrado.
        </p>
      </div>

      <MensajeEstado tipo="danger">{error}</MensajeEstado>
      <MensajeEstado tipo="success">{mensaje}</MensajeEstado>

      <div className="row g-4">
        <div className="col-lg-7">
          {/* El navegador valida los campos requeridos antes de llamar al envío del formulario. */}
          <form className="tarjeta-panel p-3" onSubmit={enviarFormulario}>
            <div className="mb-3">
              <label className="form-label">Estación</label>
              <input className="form-control" value={estacion?.nombre || 'Sin estación asignada'} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label">Línea</label>
              <select className="form-select" value={lineaId} onChange={(evento) => setLineaId(evento.target.value)} required>
                <option value="">Seleccione...</option>
                {lineasDeEstacion.map((linea) => (
                  <option key={linea.id} value={linea.id}>
                    {linea.codigo} - {linea.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Bus</label>
              <select className="form-select" value={busId} onChange={(evento) => setBusId(evento.target.value)} required>
                <option value="">Seleccione...</option>
                {busesDisponibles.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.codigo} - Capacidad {bus.capacidad_maxima}
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Cantidad de pasajeros</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={pasajeros}
                  onChange={(evento) => setPasajeros(evento.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Hora de llegada</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={horaLlegada}
                  onChange={(evento) => setHoraLlegada(evento.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="form-label">Observación</label>
              <textarea
                className="form-control"
                rows="3"
                value={observacion}
                onChange={(evento) => setObservacion(evento.target.value)}
              />
            </div>

            {/* El botón queda bloqueado hasta que termine de guardar para evitar llegadas duplicadas. */}
            <BotonAccion
              type="submit"
              className="btn btn-primario mt-4"
              texto="Guardar llegada"
              textoProcesando="Guardando..."
              procesando={procesando}
            />
          </form>
        </div>

        <div className="col-lg-5">
          {/* Panel informativo que avisa si la cantidad de pasajeros genera una alerta. */}
          <div className="tarjeta-panel p-3 mb-3">
            <h2 className="h5">Evaluación de capacidad</h2>
            {resultadoCapacidad ? (
              <MensajeEstado tipo={resultadoCapacidad.nivel}>{resultadoCapacidad.mensaje}</MensajeEstado>
            ) : (
              <p className="texto-suave mb-0">Seleccione bus e ingrese pasajeros para ver la evaluación.</p>
            )}
          </div>
          <div className="tarjeta-panel p-3">
            <h2 className="h5">Orden de estaciones de la línea</h2>
            <ol className="mb-0">
              {rutaLinea.map((item) => (
                <li key={item.id}>
                  {buscarPorId(datos.estaciones || [], item.estacion_id)?.nombre}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
