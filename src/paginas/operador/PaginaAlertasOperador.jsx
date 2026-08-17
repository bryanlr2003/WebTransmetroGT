// Consulta de alertas generadas solamente para la estación del operador.

// Tabla reutilizable para presentar los registros de alerta.
import { TablaDatos } from '../../componentes/TablaDatos.jsx'
// Hooks y funciones para identificar al usuario y completar nombres y fechas.
import { useAutenticacion } from '../../ganchos/useAutenticacion.js'
import { useDatos } from '../../ganchos/useDatos.js'
import { formatearFecha } from '../../utilidades/formato.js'
import { obtenerNombre } from '../../utilidades/selectoresDatos.js'

export function PaginaAlertasOperador() {
  // Usuario actual y datos necesarios para limitar la consulta a su propia estación.
  const { usuarioActual } = useAutenticacion()
  const { datos } = useDatos()

  // El operador solo consulta alertas generadas en su estación asignada.
  const alertas = (datos.alertas || []).filter(
    (alerta) => Number(alerta.estacion_id) === Number(usuarioActual?.estacion_id),
  )

  // La tabla se mantiene en modo consulta, sin acciones de modificación.
  return (
    <section>
      <div className="mb-4">
        <h1 className="titulo-seccion mb-1">Alertas de mi estación</h1>
        <p className="texto-suave">Alertas generadas por sobrecupo o baja ocupación.</p>
      </div>

      {/* Esta tabla es solo de consulta; el operador no modifica alertas desde esta página. */}
      <div className="tarjeta-panel p-3">
        <TablaDatos
          columnas={[
            {
              campo: 'bus_id',
              titulo: 'Bus',
              render: (alerta) => obtenerNombre(datos.buses, alerta.bus_id, 'codigo'),
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
          datos={alertas}
        />
      </div>
    </section>
  )
}
