// Archivo con funciones auxiliares para buscar, contar y relacionar datos antes de mostrarlos en pantalla.

// Busca un registro por id dentro de una lista. Convierte ambos valores a número porque algunos selects entregan texto.
export function buscarPorId(lista, id) {
  return (lista || []).find((item) => Number(item.id) === Number(id))
}

// Convierte el estado guardado en minúsculas al texto visible para el usuario.
export function textoEstado(estado) {
  return estado === 'activo' ? 'Activo' : 'Inactivo'
}

// Devuelve la clase de Bootstrap para pintar el estado como una etiqueta verde o gris.
export function claseEstado(estado) {
  return estado === 'activo' ? 'success' : 'secondary'
}

// Convierte una lista de registros en opciones compatibles con los campos select del formulario.
export function opcionesDesdeLista(lista, etiqueta) {
  return (lista || []).map((item) => ({
    valor: item.id,
    texto: etiqueta(item),
  }))
}

// Obtiene el nombre de un registro relacionado; si no existe, muestra un texto neutral para no dejar la tabla vacía.
export function obtenerNombre(lista, id, campo = 'nombre') {
  return buscarPorId(lista, id)?.[campo] || 'Sin asignar'
}

// Encuentra la municipalidad de un registro, incluso cuando llega por una relación intermedia.
// Esta función permite reutilizar el mismo filtro en los catálogos sin repetir las cadenas de datos.
export function obtenerMunicipalidadRegistro(tipo, registro, datos) {
  const estaciones = datos.estaciones || []
  const accesos = datos.accesos || []
  const parqueos = datos.parqueos || []

  // Estos catálogos guardan la municipalidad directamente en el registro.
  if (['lineas', 'estaciones', 'parqueos'].includes(tipo)) {
    return registro.municipalidad_id
  }

  // Accesos, alertas, recorridos y operadores toman la municipalidad de su estación relacionada.
  if (['accesos', 'alertas', 'recorridos', 'operadores'].includes(tipo)) {
    return buscarPorId(estaciones, registro.estacion_id)?.municipalidad_id
  }

  // Un guardia depende del acceso y ese acceso pertenece a una estación.
  if (tipo === 'guardias') {
    const acceso = buscarPorId(accesos, registro.acceso_id)
    return buscarPorId(estaciones, acceso?.estacion_id)?.municipalidad_id
  }

  // Un bus se asocia obligatoriamente a un parqueo, que define su municipalidad.
  if (tipo === 'buses') {
    return buscarPorId(parqueos, registro.parqueo_id)?.municipalidad_id
  }

  return null
}

// Devuelve solo las estaciones de una línea y las ordena según el recorrido configurado.
export function estacionesDeLinea(datos, lineaId) {
  return (datos.linea_estacion || [])
    .filter((item) => Number(item.linea_id) === Number(lineaId))
    .sort((a, b) => Number(a.orden) - Number(b.orden))
}

// Suma las distancias registradas entre estaciones de una línea para usarla en los reportes.
export function calcularDistanciaLinea(datos, lineaId) {
  return estacionesDeLinea(datos, lineaId).reduce(
    (total, item) => total + Number(item.distancia_km || 0),
    0,
  )
}

// Cuenta cuántos buses están asignados a una línea determinada.
export function contarBusesLinea(datos, lineaId) {
  return (datos.buses || []).filter((bus) => Number(bus.linea_id) === Number(lineaId)).length
}

// Obtiene la estación asociada al usuario operador para limitar sus operaciones a esa ubicación.
export function obtenerEstacionOperador(datos, usuario) {
  return buscarPorId(datos.estaciones || [], usuario?.estacion_id)
}
