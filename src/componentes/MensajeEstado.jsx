// Alerta reutilizable de Bootstrap para mostrar errores, aprobaciones o advertencias.
// tipo recibe el estilo de Bootstrap y children contiene el mensaje a mostrar.
export function MensajeEstado({ tipo = 'info', children }) {
  // Si no hay mensaje, no se crea una alerta vacía en la pantalla.
  if (!children) return null

  return (
    // La clase cambia según el tipo: info, success, warning o danger.
    <div className={`alert alert-${tipo} d-flex align-items-center gap-2`} role="alert">
      <i className="bi bi-info-circle"></i>
      {/* pre-line permite mostrar saltos de línea en mensajes de alertas. */}
      <div style={{ whiteSpace: 'pre-line' }}>{children}</div>
    </div>
  )
}
