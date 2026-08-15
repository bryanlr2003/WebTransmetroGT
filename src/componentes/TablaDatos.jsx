// Mantiene los saltos de línea en mensajes largos, por ejemplo en alertas.
function obtenerEstiloCelda(contenido) {
  return typeof contenido === 'string' && contenido.includes('\n')
    ? { whiteSpace: 'pre-line' }
    : undefined
}

// Tabla reutilizable basada en Bootstrap para mostrar catálogos y reportes.
// columnas define los encabezados, datos contiene los registros y acciones es opcional.
export function TablaDatos({ columnas, datos, acciones }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover tabla-ajustada mb-0">
        <thead className="table-light">
          <tr>
            {/* Se crean los encabezados según las columnas recibidas. */}
            {columnas.map((columna) => (
              <th key={columna.campo}>{columna.titulo}</th>
            ))}
            {acciones && <th className="text-end">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {/* Mensaje mostrado cuando la consulta no devuelve registros. */}
          {datos.length === 0 && (
            <tr>
              <td colSpan={columnas.length + (acciones ? 1 : 0)} className="text-center text-muted py-4">
                No hay registros para mostrar.
              </td>
            </tr>
          )}
          {/* Cada registro genera una fila de la tabla. */}
          {datos.map((registro) => (
            <tr key={registro.id}>
              {columnas.map((columna) => {
                // Si la columna trae render, se usa para mostrar datos relacionados.
                const contenido = columna.render ? columna.render(registro) : registro[columna.campo]

                return (
                  <td key={columna.campo} style={obtenerEstiloCelda(contenido)}>
                    {contenido}
                  </td>
                )
              })}
              {/* La última columna se muestra solo en catálogos con editar o eliminar. */}
              {acciones && <td className="text-end">{acciones(registro)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
