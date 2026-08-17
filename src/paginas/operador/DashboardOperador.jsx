// Panel inicial del operador con datos de su estación y actividad reciente.

// Componentes para mostrar mensajes, tarjetas y tablas dentro del panel.
import { MensajeEstado } from '../../componentes/MensajeEstado.jsx'
import { TablaDatos } from '../../componentes/TablaDatos.jsx'
import { TarjetaResumen } from '../../componentes/TarjetaResumen.jsx'
// Hooks para identificar al operador y consultar la información registrada.
import { useAutenticacion } from '../../ganchos/useAutenticacion.js'
import { useDatos } from '../../ganchos/useDatos.js'
// Funciones auxiliares para mostrar fechas y nombres relacionados.
import { formatearFecha } from '../../utilidades/formato.js'
import { obtenerEstacionOperador, obtenerNombre } from '../../utilidades/selectoresDatos.js'

export function DashboardOperador() {
  // Usuario de la sesión y datos generales usados para filtrar la información de su estación.
  const { usuarioActual } = useAutenticacion()
  const { datos, errorDatos } = useDatos()

  // Estación asignada al operador desde el catálogo de operadores.
  const estacion = obtenerEstacionOperador(datos, usuarioActual)

  // Últimos registros hechos en la estación del operador.
  const recorridosEstacion = (datos.recorridos || [])
    .filter((recorrido) => Number(recorrido.estacion_id) === Number(usuarioActual?.estacion_id))
    .slice(-6)
    .reverse()

  // Alertas relacionadas con la estación actual.
  const alertasEstacion = (datos.alertas || []).filter(
    (alerta) => Number(alerta.estacion_id) === Number(usuarioActual?.estacion_id),
  )

  // Se muestran solo datos que pertenecen a la estación del usuario actual.
  return (
    <section>
      <div className="mb-4">
        <h1 className="titulo-seccion mb-1">Panel del operador</h1>
        <p className="texto-suave">
          Registro operativo de llegadas y salidas desde la estación asignada.
        </p>
      </div>

      <MensajeEstado tipo="danger">{errorDatos}</MensajeEstado>

      {!estacion && (
        <MensajeEstado tipo="warning">
          Este operador no tiene una estación asignada. El administrador debe asignarla.
        </MensajeEstado>
      )}

      {/* Resumen rápido de la estación, actividad registrada y alertas pendientes de revisar. */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <TarjetaResumen titulo="Estación asignada" valor={estacion?.nombre || 'Pendiente'} icono="bi-geo-alt" />
        </div>
        <div className="col-md-4">
          <TarjetaResumen titulo="Registros realizados" valor={recorridosEstacion.length} icono="bi-clipboard-check" color="primary" />
        </div>
        <div className="col-md-4">
          <TarjetaResumen titulo="Alertas en estación" valor={alertasEstacion.length} icono="bi-exclamation-triangle" color="warning" />
        </div>
      </div>

      {/* Tabla de consulta: solo lista recorridos de la estación del operador actual. */}
      <div className="tarjeta-panel p-3">
        <h2 className="h5 mb-3">Últimos buses registrados</h2>
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
            { campo: 'pasajeros', titulo: 'Pasajeros' },
            {
              campo: 'hora_llegada',
              titulo: 'Llegada',
              render: (recorrido) => formatearFecha(recorrido.hora_llegada),
            },
            { campo: 'estado', titulo: 'Estado' },
          ]}
          datos={recorridosEstacion}
        />
      </div>
    </section>
  )
}
