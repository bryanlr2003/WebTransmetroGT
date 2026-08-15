// Selector reutilizable para consultar registros de una municipalidad o ver todos los disponibles.

// Recibe las municipalidades cargadas, el valor elegido y la función que actualiza el filtro.
export function FiltroMunicipalidad({
  municipalidades = [],
  valor,
  onChange,
  id = 'filtro-municipalidad',
}) {
  return (
    <div className="tarjeta-panel p-3 mb-4">
      <label className="form-label" htmlFor={id}>
        Filtrar por municipalidad
      </label>
      {/* El valor vacío conserva el listado completo sin modificar datos en la base. */}
      <select
        id={id}
        className="form-select"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
      >
        <option value="">Todas las municipalidades</option>
        {municipalidades.map((municipalidad) => (
          <option key={municipalidad.id} value={municipalidad.id}>
            {municipalidad.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
