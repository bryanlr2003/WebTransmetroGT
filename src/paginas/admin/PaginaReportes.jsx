// Reportes de consulta para líneas, estaciones, accesos, buses, alertas y recorridos.

// Estado de React para cambiar el reporte visible desde el selector.
import { useState } from 'react'
// Componentes reutilizables para avisos y tablas de información.
import { BotonAccion } from '../../componentes/BotonAccion.jsx'
import { FiltroMunicipalidad } from '../../componentes/FiltroMunicipalidad.jsx'
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { TablaDatos } from '../../componentes/TablaDatos.jsx'
import { TarjetaResumen } from '../../componentes/TarjetaResumen.jsx'
// Hooks que entregan datos, actualizan una alerta y evitan clics repetidos.
import { useDatos } from '../../ganchos/useDatos.js'
import { useAccionUnica } from '../../ganchos/useAccionUnica.js'
// Funciones de apoyo para relacionar registros y calcular valores por línea.
import {
  calcularDistanciaLinea,
  estacionesDeLinea,
  obtenerMunicipalidadRegistro,
  obtenerNombre,
} from '../../utilidades/selectoresDatos.js'
// Formato visual de fechas y cantidades dentro de las tablas.
import { formatearFecha, formatearNumero } from '../../utilidades/formato.js'

// Barra sencilla de Bootstrap para comparar valores dentro del reporte de líneas.
function BarraReporteLinea({ etiqueta, valor, maximo, unidad }) {
  // Convierte el dato en porcentaje para el ancho de la barra visual.
  const porcentaje = maximo > 0 ? Math.round((Number(valor) / maximo) * 100) : 0

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-semibold">{etiqueta}</span>
        <small className="texto-suave">
          {formatearNumero(valor, unidad === 'km' ? 2 : 0)} {unidad}
        </small>
      </div>
      <div className="progress" role="progressbar" aria-label={etiqueta} aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100">
        <div className="progress-bar bg-success" style={{ width: `${porcentaje}%` }}></div>
      </div>
    </div>
  )
}

// Resume las líneas registradas, estaciones asignadas y distancia acumulada.
function ResumenReporteLineas({ datos, lineas }) {
  // Prepara una lista resumida para contar estaciones y sumar distancias.
  const estadisticas = lineas.map((linea) => ({
    id: linea.id,
    nombre: `${linea.codigo} - ${linea.nombre}`,
    estaciones: estacionesDeLinea(datos, linea.id).length,
    distancia: calcularDistanciaLinea(datos, linea.id),
  }))
  const totalEstaciones = estadisticas.reduce((total, linea) => total + linea.estaciones, 0)
  const distanciaTotal = estadisticas.reduce((total, linea) => total + linea.distancia, 0)
  const maximoEstaciones = Math.max(...estadisticas.map((linea) => linea.estaciones), 1)
  const maximoDistancia = Math.max(...estadisticas.map((linea) => linea.distancia), 1)

  // Bloque visual con tarjetas y barras comparativas por línea.
  return (
    <div className="mb-4">
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="border rounded-2 p-3 h-100">
            <small className="texto-suave">Total de líneas</small>
            <div className="fs-3 fw-bold">{lineas.length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="border rounded-2 p-3 h-100">
            <small className="texto-suave">Estaciones asignadas</small>
            <div className="fs-3 fw-bold">{totalEstaciones}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="border rounded-2 p-3 h-100">
            <small className="texto-suave">Distancia acumulada</small>
            <div className="fs-3 fw-bold">{formatearNumero(distanciaTotal)} km</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="border rounded-2 p-3 h-100">
            <h3 className="h6 mb-3">Estaciones por línea</h3>
            {estadisticas.length === 0 ? (
              <p className="texto-suave mb-0">No hay líneas registradas.</p>
            ) : (
              estadisticas.map((linea) => (
                <BarraReporteLinea
                  key={linea.id}
                  etiqueta={linea.nombre}
                  valor={linea.estaciones}
                  maximo={maximoEstaciones}
                  unidad="estaciones"
                />
              ))
            )}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="border rounded-2 p-3 h-100">
            <h3 className="h6 mb-3">Distancia por línea</h3>
            {estadisticas.length === 0 ? (
              <p className="texto-suave mb-0">No hay líneas registradas.</p>
            ) : (
              estadisticas.map((linea) => (
                <BarraReporteLinea
                  key={linea.id}
                  etiqueta={linea.nombre}
                  valor={linea.distancia}
                  maximo={maximoDistancia}
                  unidad="km"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PaginaReportes({ soloLectura = false }) {
  // Datos y posibles errores que se usan para construir todas las consultas de la página.
  const { datos, errorDatos, actualizarRegistro } = useDatos()
  // El reporte de líneas se muestra primero al abrir la página.
  const [reporteSeleccionado, setReporteSeleccionado] = useState('lineas')
  // Mantiene la municipalidad elegida para aplicar el mismo filtro a cada reporte.
  const [municipalidadSeleccionada, setMunicipalidadSeleccionada] = useState('')
  // Mensajes exclusivos para avisar el resultado al revisar una alerta.
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  // Bloquea el botón mientras Supabase actualiza el estado para evitar solicitudes repetidas.
  const { procesando, ejecutar } = useAccionUnica()

  // Listas consultadas desde el contexto para armar los reportes solicitados.
  const lineas = datos.lineas || []
  const estaciones = datos.estaciones || []
  const buses = datos.buses || []
  const alertas = datos.alertas || []
  const recorridos = datos.recorridos || []

  // Filtra una lista sin hacer nuevas consultas ni modificar la información guardada.
  function filtrarPorMunicipalidad(lista, tipo) {
    if (!municipalidadSeleccionada) return lista

    return lista.filter((registro) => {
      // Los datos preparados para reportes pueden incluir el id directamente.
      const municipalidadId = registro.municipalidad_id
        ?? obtenerMunicipalidadRegistro(tipo, registro, datos)

      return Number(municipalidadId) === Number(municipalidadSeleccionada)
    })
  }

  // Combina las líneas, sus estaciones y los accesos ya registrados.
  const accesosPorLinea = (datos.linea_estacion || [])
    .slice()
    .sort((a, b) => Number(a.linea_id) - Number(b.linea_id) || Number(a.orden) - Number(b.orden))
    .flatMap((relacion) => {
      const linea = lineas.find((item) => Number(item.id) === Number(relacion.linea_id))
      const estacion = estaciones.find((item) => Number(item.id) === Number(relacion.estacion_id))

      return (datos.accesos || [])
        .filter((acceso) => Number(acceso.estacion_id) === Number(relacion.estacion_id))
        .map((acceso) => ({
          ...acceso,
          id: `${relacion.id}-${acceso.id}`,
          codigoLinea: linea?.codigo || 'Sin código',
          linea: linea?.nombre || 'Sin asignar',
          estacion: estacion?.nombre || 'Sin asignar',
          // La estación define la municipalidad operativa del acceso.
          municipalidad_id: estacion?.municipalidad_id ?? linea?.municipalidad_id,
        }))
    })

  // Se agregan nombres de línea y parqueo para que el reporte sea más legible.
  const reporteBuses = buses.map((bus) => {
    const linea = lineas.find((item) => Number(item.id) === Number(bus.linea_id))
    const parqueo = (datos.parqueos || []).find((item) => Number(item.id) === Number(bus.parqueo_id))

    return {
      ...bus,
      linea: linea?.nombre || 'Sin asignar',
      parqueo: parqueo?.nombre || 'Sin asignar',
      // Si no tiene línea, el parqueo conserva la municipalidad correcta del bus.
      municipalidad_id: linea?.municipalidad_id ?? parqueo?.municipalidad_id,
    }
  })

  // Cada reporte recibe solo la información de la municipalidad elegida por el administrador.
  const lineasFiltradas = filtrarPorMunicipalidad(lineas, 'lineas')
  const estacionesFiltradas = filtrarPorMunicipalidad(estaciones, 'estaciones')
  const accesosPorLineaFiltrados = filtrarPorMunicipalidad(accesosPorLinea, 'accesos')
  const reporteBusesFiltrado = filtrarPorMunicipalidad(reporteBuses, 'buses')
  const alertasFiltradas = filtrarPorMunicipalidad(alertas, 'alertas')
  const recorridosFiltrados = filtrarPorMunicipalidad(recorridos, 'recorridos')

  // Cuenta los registros que necesitan seguimiento dentro del dashboard de reportes.
  const alertasPendientes = alertasFiltradas.filter((alerta) => alerta.estado === 'pendiente')
  const alertasRevisadas = alertasFiltradas.filter((alerta) => alerta.estado === 'revisada')
  const recorridosPendientes = recorridosFiltrados.filter((recorrido) => recorrido.estado === 'en_estacion')

  // El administrador confirma que atendió el caso y cambia su estado a revisada.
  async function marcarAlertaRevisada(alerta) {
    await ejecutar(async () => {
      // La confirmación evita marcar una alerta por error desde el reporte.
      const confirmado = window.confirm('¿Desea marcar esta alerta como revisada?')
      if (!confirmado) return

      setMensaje('')
      setError('')

      try {
        // Se usa el valor permitido por el SQL: pendiente o revisada.
        await actualizarRegistro('alertas', alerta.id, { estado: 'revisada' })
        setMensaje('Alerta marcada como revisada correctamente.')
      } catch (err) {
        setError(err.message)
      }
    })
  }

  // Cada tarjeta contiene una consulta diferente requerida por el proyecto.
  return (
    <section>
      <div className="mb-4">
        <h1 className="titulo-seccion mb-1">Reportes</h1>
      </div>

      <MensajeEstado tipo="success">{mensaje}</MensajeEstado>
      <MensajeEstado tipo="danger">{error || errorDatos}</MensajeEstado>

      {/* Selector sencillo para mostrar una tabla a la vez. */}
      <div className="tarjeta-panel p-3 mb-4">
        <label className="form-label" htmlFor="selector-reporte">Seleccione el reporte que desea consultar</label>
        <select
          id="selector-reporte"
          className="form-select"
          value={reporteSeleccionado}
          onChange={(evento) => setReporteSeleccionado(evento.target.value)}
        >
          <option value="lineas">Reporte de líneas</option>
          <option value="estaciones">Reporte de estaciones</option>
          <option value="accesos">Reporte de accesos por línea</option>
          <option value="buses">Reporte de buses asignados</option>
          <option value="alertas">Alertas generadas</option>
          <option value="recorridos">Recorridos registrados</option>
        </select>
      </div>

      {/* Segundo selector: limita las tarjetas, barras y tabla a una municipalidad. */}
      <FiltroMunicipalidad
        municipalidades={datos.municipalidades || []}
        valor={municipalidadSeleccionada}
        onChange={setMunicipalidadSeleccionada}
        id="filtro-municipalidad-reportes"
      />

      {/* Tarjetas resumen que cambian según el reporte elegido. */}
      {reporteSeleccionado === 'lineas' && (
        <ResumenReporteLineas datos={datos} lineas={lineasFiltradas} />
      )}

      {reporteSeleccionado === 'estaciones' && (
        <div className="row g-3 mb-4">
          <div className="col-md-4"><TarjetaResumen titulo="Total de estaciones" valor={estacionesFiltradas.length} icono="bi-geo-alt" color="primary" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Estaciones activas" valor={estacionesFiltradas.filter((estacion) => estacion.estado === 'activo').length} icono="bi-check-circle" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Municipalidades" valor={new Set(estacionesFiltradas.map((estacion) => estacion.municipalidad_id)).size} icono="bi-buildings" color="info" /></div>
        </div>
      )}

      {reporteSeleccionado === 'accesos' && (
        <div className="row g-3 mb-4">
          <div className="col-md-4"><TarjetaResumen titulo="Accesos en líneas" valor={accesosPorLineaFiltrados.length} icono="bi-door-open" color="primary" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Líneas con accesos" valor={new Set(accesosPorLineaFiltrados.map((acceso) => acceso.codigoLinea)).size} icono="bi-signpost-2" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Accesos activos" valor={accesosPorLineaFiltrados.filter((acceso) => acceso.estado === 'activo').length} icono="bi-check-circle" color="info" /></div>
        </div>
      )}

      {reporteSeleccionado === 'buses' && (
        <div className="row g-3 mb-4">
          <div className="col-md-4"><TarjetaResumen titulo="Total de buses" valor={reporteBusesFiltrado.length} icono="bi-bus-front" color="primary" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Buses asignados" valor={reporteBusesFiltrado.filter((bus) => bus.linea_id).length} icono="bi-signpost-2" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Capacidad total" valor={reporteBusesFiltrado.reduce((total, bus) => total + Number(bus.capacidad_maxima || 0), 0)} icono="bi-people" color="info" /></div>
        </div>
      )}

      {reporteSeleccionado === 'alertas' && (
        <div className="row g-3 mb-4">
          <div className="col-md-4"><TarjetaResumen titulo="Total de alertas" valor={alertasFiltradas.length} icono="bi-exclamation-triangle" color="warning" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Alertas pendientes" valor={alertasPendientes.length} icono="bi-bell" color="danger" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Alertas revisadas" valor={alertasRevisadas.length} icono="bi-check-circle" /></div>
        </div>
      )}

      {reporteSeleccionado === 'recorridos' && (
        <div className="row g-3 mb-4">
          <div className="col-md-4"><TarjetaResumen titulo="Recorridos registrados" valor={recorridosFiltrados.length} icono="bi-clipboard-check" color="primary" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="En estación" valor={recorridosPendientes.length} icono="bi-clock-history" color="warning" /></div>
          <div className="col-md-4"><TarjetaResumen titulo="Finalizados" valor={recorridosFiltrados.filter((recorrido) => recorrido.estado === 'finalizado').length} icono="bi-check-circle" /></div>
        </div>
      )}

      {/* El reporte de líneas ya se presenta arriba con tarjetas y barras de Bootstrap.
          Las demás consultas se muestran en una tabla según la opción elegida. */}
      <div className="row g-4">
        {reporteSeleccionado === 'estaciones' && (
        <div className="col-12">
          <div className="tarjeta-panel p-3">
            <h2 className="h5 mb-3">Reporte de estaciones</h2>
            <TablaDatos
              columnas={[
                { campo: 'nombre', titulo: 'Estación' },
                {
                  campo: 'municipalidad_id',
                  titulo: 'Municipalidad',
                  render: (estacion) => obtenerNombre(datos.municipalidades, estacion.municipalidad_id),
                },
                { campo: 'ubicacion', titulo: 'Ubicación' },
                { campo: 'estado', titulo: 'Estado' },
              ]}
              datos={estacionesFiltradas}
            />
          </div>
        </div>
        )}

        {reporteSeleccionado === 'accesos' && (
        <div className="col-12">
          <div className="tarjeta-panel p-3">
            <h2 className="h5 mb-3">Reporte de accesos por línea</h2>
            <TablaDatos
              columnas={[
                { campo: 'codigoLinea', titulo: 'Código' },
                { campo: 'linea', titulo: 'Línea' },
                { campo: 'estacion', titulo: 'Estación' },
                { campo: 'nombre', titulo: 'Acceso' },
                { campo: 'estado', titulo: 'Estado' },
              ]}
              datos={accesosPorLineaFiltrados}
            />
          </div>
        </div>
        )}

        {reporteSeleccionado === 'buses' && (
        <div className="col-12">
          <div className="tarjeta-panel p-3">
            <h2 className="h5 mb-3">Reporte de buses asignados</h2>
            <TablaDatos
              columnas={[
                { campo: 'codigo', titulo: 'Bus' },
                { campo: 'placa', titulo: 'Placa' },
                { campo: 'capacidad_maxima', titulo: 'Capacidad' },
                { campo: 'linea', titulo: 'Línea' },
                { campo: 'parqueo', titulo: 'Parqueo' },
              ]}
              datos={reporteBusesFiltrado}
            />
          </div>
        </div>
        )}

        {reporteSeleccionado === 'alertas' && (
        <div className="col-12">
          <div className="tarjeta-panel p-3">
            <h2 className="h5 mb-3">Alertas generadas</h2>
            <TablaDatos
              columnas={[
                {
                  campo: 'bus_id',
                  titulo: 'Bus',
                  render: (alerta) => obtenerNombre(datos.buses, alerta.bus_id, 'codigo'),
                },
                {
                  campo: 'estacion_id',
                  titulo: 'Estación',
                  render: (alerta) => obtenerNombre(datos.estaciones, alerta.estacion_id),
                },
                { campo: 'tipo', titulo: 'Tipo' },
                { campo: 'mensaje', titulo: 'Mensaje' },
                {
                  campo: 'fecha',
                  titulo: 'Fecha',
                  render: (alerta) => formatearFecha(alerta.fecha),
                },
                { campo: 'estado', titulo: 'Estado' },
              ]}
              datos={alertasFiltradas}
              // La acción se deja solo para el administrador; una vista de consulta no modifica datos.
              acciones={soloLectura ? undefined : (alerta) => (
                alerta.estado === 'pendiente' ? (
                  <BotonAccion
                    className="btn btn-outline-success btn-sm"
                    icono="bi-check-lg"
                    texto="Marcar revisada"
                    textoProcesando="Actualizando..."
                    procesando={procesando}
                    onClick={() => marcarAlertaRevisada(alerta)}
                  />
                ) : (
                  <span className="badge text-bg-success">Revisada</span>
                )
              )}
            />
          </div>
        </div>
        )}

        {reporteSeleccionado === 'recorridos' && (
        <div className="col-12">
          <div className="tarjeta-panel p-3">
            <h2 className="h5 mb-3">Recorridos registrados</h2>
            <TablaDatos
              columnas={[
                {
                  campo: 'bus_id',
                  titulo: 'Bus',
                  render: (recorrido) => obtenerNombre(datos.buses, recorrido.bus_id, 'codigo'),
                },
                {
                  campo: 'linea_id',
                  titulo: 'Línea',
                  render: (recorrido) => obtenerNombre(datos.lineas, recorrido.linea_id),
                },
                {
                  campo: 'estacion_id',
                  titulo: 'Estación',
                  render: (recorrido) => obtenerNombre(datos.estaciones, recorrido.estacion_id),
                },
                { campo: 'pasajeros', titulo: 'Pasajeros' },
                {
                  campo: 'hora_llegada',
                  titulo: 'Llegada',
                  render: (recorrido) => formatearFecha(recorrido.hora_llegada),
                },
                {
                  campo: 'hora_salida',
                  titulo: 'Salida',
                  render: (recorrido) => formatearFecha(recorrido.hora_salida),
                },
              ]}
              datos={recorridosFiltrados}
            />
          </div>
        </div>
        )}
      </div>
    </section>
  )
}
