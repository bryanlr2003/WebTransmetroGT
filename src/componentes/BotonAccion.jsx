// Botón reutilizable que muestra el proceso y evita volver a enviar la misma acción.
// Recibe el texto normal, el texto durante el proceso y clases para reutilizarlo en varios formularios.
export function BotonAccion({
  type = 'button',
  className = 'btn btn-primario',
  icono = 'bi-save',
  texto,
  textoProcesando = 'Guardando...',
  procesando = false,
  disabled = false,
  ...propiedades
}) {
  return (
    // Se deshabilita mientras procesa para que un clic repetido no cree registros duplicados.
    <button
      {...propiedades}
      type={type}
      className={className}
      disabled={procesando || disabled}
      aria-busy={procesando}
    >
      {procesando ? (
        // Durante el envío muestra un indicador visual y el texto de espera.
        <>
          <span className="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
          {textoProcesando}
        </>
      ) : (
        // Cuando no hay proceso, muestra el ícono y texto normal del botón.
        <>
          {icono && <i className={`bi ${icono} me-1`}></i>}
          {texto}
        </>
      )}
    </button>
  )
}
