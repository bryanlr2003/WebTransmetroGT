// Busca un registro por id dentro de una lista.
export function buscarPorId(lista, id) {
  return (lista || []).find((item) => Number(item.id) === Number(id))
}

// Texto visible para estados guardados en minusculas.
export function textoEstado(estado) {
  return estado === 'activo' ? 'Activo' : 'Inactivo'
}

// Clase de Bootstrap para pintar el estado como etiqueta.
export function claseEstado(estado) {
  return estado === 'activo' ? 'success' : 'secondary'
}

// Convierte una lista de registros en opciones para un select.
export function opcionesDesdeLista(lista, etiqueta) {
  return (lista || []).map((item) => ({
    valor: item.id,
    texto: etiqueta(item),
  }))
}

// Obtiene un nombre relacionado; si no existe, muestra un texto neutral.
export function obtenerNombre(lista, id, campo = 'nombre') {
  return buscarPorId(lista, id)?.[campo] || 'Sin asignar'
}

// Devuelve las estaciones de una linea ordenadas por el campo orden.
export function estacionesDeLinea(datos, lineaId) {
  return (datos.linea_estacion || [])
    .filter((item) => Number(item.linea_id) === Number(lineaId))
    .sort((a, b) => Number(a.orden) - Number(b.orden))
}

// Suma las distancias registradas entre estaciones de una linea.
export function calcularDistanciaLinea(datos, lineaId) {
  return estacionesDeLinea(datos, lineaId).reduce(
    (total, item) => total + Number(item.distancia_km || 0),
    0,
  )
}

// Cuenta buses asignados a una linea.
export function contarBusesLinea(datos, lineaId) {
  return (datos.buses || []).filter((bus) => Number(bus.linea_id) === Number(lineaId)).length
}

// Obtiene la estacion asociada al usuario operador.
export function obtenerEstacionOperador(datos, usuario) {
  return buscarPorId(datos.estaciones || [], usuario?.estacion_id)
}
