// Panel principal del administrador con indicadores y los recorridos más recientes.

// Componentes reutilizables para mensajes, tarjetas y tablas.
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { TarjetaResumen } from '../../componentes/TarjetaResumen.jsx'
import { TablaDatos } from '../../componentes/TablaDatos.jsx'
// Hook que entrega la información cargada desde la base de datos.
import { useDatos } from '../../ganchos/useDatos.js'
// Funciones para calcular datos relacionados entre líneas, estaciones y buses.
import {
  calcularDistanciaLinea,
  contarBusesLinea,
  estacionesDeLinea,
  obtenerNombre,
} from '../../utilidades/selectoresDatos.js'
// Funciones sencillas para presentar fechas y números al usuario.
import { formatearFecha, formatearNumero } from '../../utilidades/formato.js'

export function DashboardAdmin() {
  // Información general, estado de carga y posibles errores entregados por el contexto.
  const { datos, cargandoDatos, errorDatos } = useDatos()

  // Listas principales para mostrar indicadores rápidos del sistema.
  const lineas = datos.lineas || []
  const estaciones = datos.estaciones || []
  const buses = datos.buses || []
  const alertas = datos.alertas || []
  const recorridos = datos.recorridos || []

  // Alertas pendientes son casos que aún requieren revisión operativa.
  const alertasPendientes = alertas.filter((alerta) => alerta.estado === 'pendiente')

  // Se toman los últimos registros para no saturar el dashboard.
  const recorridosRecientes = recorridos.slice(-5).reverse()

  return (
    <section>
      <div className="mb-4">
        <h1 className="titulo-seccion mb-1">Dashboard administrativo</h1>
      </div>

      <MensajeEstado tipo="danger">{errorDatos}</MensajeEstado>

      {/* Mientras llegan los datos se evita mostrar tablas incompletas. */}
      {cargandoDatos ? (
        <div className="tarjeta-panel p-4 text-center texto-suave">Cargando información...</div>
      ) : (
        <>
          {/* Tarjetas con los indicadores principales del sistema. */}
          <div className="row g-3 mb-4">
            <div className="col-md-6 col-xl-3">
              <TarjetaResumen titulo="Líneas" valor={lineas.length} icono="bi-signpost-2" />
            </div>
            <div className="col-md-6 col-xl-3">
              <TarjetaResumen titulo="Estaciones" valor={estaciones.length} icono="bi-geo-alt" color="primary" />
            </div>
            <div className="col-md-6 col-xl-3">
              <TarjetaResumen titulo="Buses" valor={buses.length} icono="bi-bus-front" color="info" />
            </div>
            <div className="col-md-6 col-xl-3">
              <TarjetaResumen titulo="Alertas pendientes" valor={alertasPendientes.length} icono="bi-exclamation-triangle" color="warning" />
            </div>
          </div>

          {/* Tablas de control para líneas y recorridos recientes. */}
          <div className="row g-4">
            <div className="col-xl-7">
              <div className="tarjeta-panel p-3 h-100">
                <h2 className="h5 mb-3">Estado de líneas</h2>
                <TablaDatos
                  columnas={[
                    { campo: 'codigo', titulo: 'Código' },
                    { campo: 'nombre', titulo: 'Línea' },
                    {
                      campo: 'estaciones',
                      titulo: 'Estaciones',
                      render: (linea) => estacionesDeLinea(datos, linea.id).length,
                    },
                    {
                      campo: 'buses',
                      titulo: 'Buses',
                      render: (linea) => {
                        const totalEstaciones = estacionesDeLinea(datos, linea.id).length
                        const totalBuses = contarBusesLinea(datos, linea.id)
                        const minimo = totalEstaciones
                        const maximo = totalEstaciones * 2

                        // Verifica que la cantidad de buses asignada cumpla el rango solicitado.
                        const correcto = totalEstaciones === 0 || (totalBuses >= minimo && totalBuses <= maximo)
                        return (
                          <span className={`badge text-bg-${correcto ? 'success' : 'warning'}`}>
                            {totalBuses} / {minimo}-{maximo}
                          </span>
                        )
                      },
                    },
                    {
                      campo: 'distancia',
                      titulo: 'Distancia km',
                      render: (linea) => formatearNumero(calcularDistanciaLinea(datos, linea.id)),
                    },
                  ]}
                  datos={lineas}
                />
              </div>
            </div>

            <div className="col-xl-5">
              <div className="tarjeta-panel p-3 h-100">
                <h2 className="h5 mb-3">Últimos recorridos</h2>
                <TablaDatos
                  columnas={[
                    {
                      campo: 'bus_id',
                      titulo: 'Bus',
                      render: (recorrido) => obtenerNombre(datos.buses, recorrido.bus_id, 'codigo'),
                    },
                    {
                      campo: 'estacion_id',
                      titulo: 'Estación',
                      render: (recorrido) => obtenerNombre(datos.estaciones, recorrido.estacion_id),
                    },
                    {
                      campo: 'hora_llegada',
                      titulo: 'Llegada',
                      render: (recorrido) => formatearFecha(recorrido.hora_llegada),
                    },
                  ]}
                  datos={recorridosRecientes}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
