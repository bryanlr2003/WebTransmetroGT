// Ruta inicial permitida para cada rol del sistema.
const rutasPorRol = {
  administrador: '/admin',
  operador: '/operador',
}

// Devuelve la ruta principal de un rol.
export function obtenerRutaPorRol(rol) {
  return rutasPorRol[rol] || null
}

// Valida que el rol exista dentro del alcance actual del proyecto.
export function esRolValido(rol) {
  return Boolean(rutasPorRol[rol])
}
