import { NavLink } from 'react-router-dom'
import { useAutenticacion } from '../ganchos/useAutenticacion.js'

// Menu definido por rol para que cada usuario vea solo sus funciones.
const menusPorRol = {
  administrador: [
    { ruta: '/admin', icono: 'bi-speedometer2', texto: 'Dashboard', exacto: true },
    { ruta: '/admin/municipalidades', icono: 'bi-building', texto: 'Municipalidades' },
    { ruta: '/admin/estaciones', icono: 'bi-geo-alt', texto: 'Estaciones' },
    { ruta: '/admin/lineas', icono: 'bi-signpost-2', texto: 'Lineas' },
    { ruta: '/admin/rutas', icono: 'bi-diagram-3', texto: 'Orden de ruta' },
    { ruta: '/admin/accesos', icono: 'bi-door-open', texto: 'Accesos' },
    { ruta: '/admin/guardias', icono: 'bi-shield-check', texto: 'Guardias' },
    { ruta: '/admin/parqueos', icono: 'bi-p-square', texto: 'Parqueos' },
    { ruta: '/admin/buses', icono: 'bi-bus-front', texto: 'Buses' },
    { ruta: '/admin/pilotos', icono: 'bi-person-vcard', texto: 'Pilotos' },
    { ruta: '/admin/operadores', icono: 'bi-pc-display', texto: 'Operadores' },
    { ruta: '/admin/reportes', icono: 'bi-bar-chart', texto: 'Reportes' },
  ],
  operador: [
    { ruta: '/operador', icono: 'bi-speedometer2', texto: 'Mi estacion', exacto: true },
    { ruta: '/operador/llegadas', icono: 'bi-box-arrow-in-down', texto: 'Registrar llegada' },
    { ruta: '/operador/salidas', icono: 'bi-box-arrow-up', texto: 'Registrar salida' },
    { ruta: '/operador/alertas', icono: 'bi-exclamation-triangle', texto: 'Alertas' },
  ],
}

export function MenuLateral() {
  const { usuarioActual } = useAutenticacion()
  // Segun el rol guardado en sesion se cargan las opciones del menu.
  const opciones = menusPorRol[usuarioActual?.rol] || []

  return (
    <aside className="panel-lateral p-3">
      <div className="d-flex align-items-center gap-2 mb-4">
        <span className="bg-success rounded-2 d-inline-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
          <i className="bi bi-bus-front-fill"></i>
        </span>
        <div>
          <div className="fw-bold">Transmetro GT</div>
          <small className="opacity-75">Municipalidad de Guatemala</small>
        </div>
      </div>

      <nav className="nav flex-column menu-lateral">
        {opciones.map((opcion) => (
          <NavLink
            key={opcion.ruta}
            to={opcion.ruta}
            end={opcion.exacto}
            className="nav-link d-flex align-items-center gap-2"
          >
            <i className={`bi ${opcion.icono}`}></i>
            <span>{opcion.texto}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
