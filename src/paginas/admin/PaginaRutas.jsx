// Administración del orden de estaciones y distancias de cada línea.

// Hooks de React para guardar la línea elegida y el estado del modal.
import { useMemo, useState } from 'react'
// Componentes visuales reutilizables de formulario, mensajes y tabla.
import { FormularioModal } from '../../componentes/FormularioModal.jsx'
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { TablaDatos } from '../../componentes/TablaDatos.jsx'
// Hook para leer y modificar las relaciones entre líneas y estaciones.
import { useDatos } from '../../ganchos/useDatos.js'
// Funciones auxiliares para buscar registros, contar buses y calcular distancias.
import {
  buscarPorId,
  calcularDistanciaLinea,
  contarBusesLinea,
  estacionesDeLinea,
  obtenerNombre,
  opcionesDesdeLista,
} from '../../utilidades/selectoresDatos.js'
// Formatea la distancia con decimales para mostrarla en la pantalla.
import { formatearNumero } from '../../utilidades/formato.js'

export function PaginaRutas() {
  // Operaciones de datos usadas para guardar cambios en las relaciones de cada ruta.
  const { datos, crearRegistro, actualizarRegistro, eliminarRegistro, errorDatos } = useDatos()
  // Estados para controlar la línea elegida, el modal, la edición y los mensajes mostrados.
  const [lineaSeleccionada, setLineaSeleccionada] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [registroEditando, setRegistroEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const lineas = datos.lineas || []
  // Ordena las estaciones que ya pertenecen a la línea seleccionada.
  const ruta = useMemo(
    () => estacionesDeLinea(datos, lineaSeleccionada),
    [datos, lineaSeleccionada],
  )
  // Se busca la línea elegida para saber a qué municipalidad pertenece.
  const lineaActual = buscarPorId(datos.lineas || [], lineaSeleccionada)

  // Solo se muestran estaciones de la misma municipalidad de la línea.
  const estacionesDisponibles = (datos.estaciones || []).filter(
    (estacion) => Number(estacion.municipalidad_id) === Number(lineaActual?.municipalidad_id),
  )

  // Campos del modal para agregar o editar una estación dentro de la ruta.
  const campos = useMemo(
    () => [
      {
        nombre: 'estacion_id',
        etiqueta: 'Estación',
        tipo: 'select',
        opciones: opcionesDesdeLista(estacionesDisponibles, (item) => item.nombre),
        requerido: true,
      },
      { nombre: 'orden', etiqueta: 'Orden en la ruta', tipo: 'number', min: 1, requerido: true },
      {
        nombre: 'distancia_km',
        etiqueta: 'Distancia desde la estación anterior',
        tipo: 'number',
        min: 0,
        step: '0.01',
        requerido: true,
        ayuda: 'Para la primera estación puede colocar 0.',
      },
    ],
    [estacionesDisponibles],
  )

  const totalEstaciones = ruta.length
  const totalBuses = contarBusesLinea(datos, lineaSeleccionada)
  const minimoBuses = totalEstaciones
  const maximoBuses = totalEstaciones * 2

  // Regla del enunciado: una línea debe tener entre 1 y 2 buses por estación.
  const busesCorrectos =
    totalEstaciones === 0 || (totalBuses >= minimoBuses && totalBuses <= maximoBuses)

  // Abre el modal sin un registro previo para agregar una estación a la ruta.
  function abrirNuevo() {
    setRegistroEditando(null)
    setModalVisible(true)
  }

  // Abre el modal con los datos de la estación seleccionada para modificarla.
  function abrirEdicion(registro) {
    setRegistroEditando(registro)
    setModalVisible(true)
  }

  // Convierte los valores del formulario y crea o actualiza la relación línea-estación.
  async function guardar(valores) {
    try {
      // La relación linea_estacion une una línea con sus estaciones, orden y distancia.
      const datosFormulario = {
        linea_id: Number(lineaSeleccionada),
        estacion_id: Number(valores.estacion_id),
        orden: Number(valores.orden),
        distancia_km: Number(valores.distancia_km || 0),
      }

      if (registroEditando) {
        await actualizarRegistro('linea_estacion', registroEditando.id, datosFormulario)
      } else {
        await crearRegistro('linea_estacion', datosFormulario)
      }

      setMensaje('Ruta actualizada correctamente.')
      setError('')
      setModalVisible(false)
    } catch (err) {
      setError(err.message)
    }
  }

  // Quita la estación de la línea, sin eliminar la estación del catálogo general.
  async function eliminar(registro) {
    const confirmado = window.confirm('¿Desea quitar esta estación de la ruta?')
    if (!confirmado) return

    try {
      await eliminarRegistro('linea_estacion', registro.id)
      setMensaje('Estación eliminada de la ruta.')
    } catch (err) {
      setError(err.message)
    }
  }

  // La pantalla primero deja seleccionar una línea y luego muestra su ruta.
  return (
    <section>
      <div className="mb-4">
        <h1 className="titulo-seccion mb-1">Orden de ruta y distancias</h1>
        <p className="texto-suave">
          Define el orden de estaciones por línea y la distancia entre una estación y otra.
        </p>
      </div>

      <MensajeEstado tipo="danger">{error || errorDatos}</MensajeEstado>
      <MensajeEstado tipo="success">{mensaje}</MensajeEstado>

      {/* Selector que define la ruta que se va a consultar o modificar. */}
      <div className="tarjeta-panel p-3 mb-4">
        <label className="form-label">Seleccione una línea</label>
        <select
          className="form-select"
          value={lineaSeleccionada}
          onChange={(evento) => setLineaSeleccionada(evento.target.value)}
        >
          <option value="">Seleccione...</option>
          {lineas.map((linea) => (
            <option key={linea.id} value={linea.id}>
              {linea.codigo} - {linea.nombre}
            </option>
          ))}
        </select>
      </div>

      {lineaSeleccionada && (
        <>
          {estacionesDisponibles.length === 0 && (
            <MensajeEstado tipo="warning">
              La municipalidad de esta línea aún no tiene estaciones registradas. Cree primero las estaciones correspondientes.
            </MensajeEstado>
          )}

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="tarjeta-panel p-3">
                <small className="texto-suave">Estaciones en ruta</small>
                <div className="fs-4 fw-bold">{totalEstaciones}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="tarjeta-panel p-3">
                <small className="texto-suave">Distancia total</small>
                <div className="fs-4 fw-bold">{formatearNumero(calcularDistanciaLinea(datos, lineaSeleccionada))} km</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="tarjeta-panel p-3">
                <small className="texto-suave">Buses asignados</small>
                <div className="fs-4 fw-bold">
                  <span className={`badge text-bg-${busesCorrectos ? 'success' : 'warning'}`}>
                    {totalBuses} / {minimoBuses}-{maximoBuses}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón para abrir el formulario de una nueva estación en la ruta seleccionada. */}
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-primario" type="button" onClick={abrirNuevo}>
              <i className="bi bi-plus-lg me-1"></i>
              Agregar estación
            </button>
          </div>

          {/* Tabla con acciones para editar o quitar solamente la relación de la ruta. */}
          <div className="tarjeta-panel">
            <TablaDatos
              columnas={[
                { campo: 'orden', titulo: 'Orden' },
                {
                  campo: 'estacion_id',
                  titulo: 'Estación',
                  render: (registro) => obtenerNombre(datos.estaciones, registro.estacion_id),
                },
                {
                  campo: 'distancia_km',
                  titulo: 'Distancia desde anterior',
                  render: (registro) => `${formatearNumero(registro.distancia_km)} km`,
                },
              ]}
              datos={ruta}
              acciones={(registro) => (
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-primary" type="button" onClick={() => abrirEdicion(registro)}>
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button className="btn btn-outline-danger" type="button" onClick={() => eliminar(registro)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              )}
            />
          </div>
        </>
      )}

      {/* El modal reutilizable bloquea Guardar hasta completar el envío y evita duplicados. */}
      <FormularioModal
        visible={modalVisible}
        titulo={registroEditando ? 'Editar estación en ruta' : 'Agregar estación a ruta'}
        campos={campos}
        registro={registroEditando}
        onCerrar={() => setModalVisible(false)}
        onGuardar={guardar}
      />
    </section>
  )
}
