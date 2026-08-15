// Componente reutilizable para mostrar un dato principal en dashboards y reportes.
// Recibe el título, valor, ícono, color y un detalle opcional de cada tarjeta.
export function TarjetaResumen({ titulo, valor, icono, color = 'success', detalle }) {
  return (
    // La estructura usa clases de Bootstrap y estilos propios de la aplicación.
    <div className="tarjeta-panel p-3 h-100">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="texto-suave small">{titulo}</div>
          <div className="fs-3 fw-bold">{valor}</div>
          {/* El detalle solo se muestra si la pantalla envía ese dato. */}
          {detalle && <small className="texto-suave">{detalle}</small>}
        </div>
        <span className={`badge text-bg-${color} fs-6`}>
          <i className={`bi ${icono}`}></i>
        </span>
      </div>
    </div>
  )
}
