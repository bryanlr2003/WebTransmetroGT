// Archivo que define las rutas disponibles para cada rol del sistema.

// Mapa de rutas iniciales permitidas. Sirve como control para no enviar un usuario a una pantalla ajena a su rol.
const rutasPorRol = {
  administrador: '/admin',
  operador: '/operador',
}

// Devuelve la ruta principal de un rol o null si el rol no existe.
export function obtenerRutaPorRol(rol) {
  return rutasPorRol[rol] || null
}

// Valida que el rol exista dentro del alcance actual del proyecto antes de permitir el acceso.
export function esRolValido(rol) {
  return Boolean(rutasPorRol[rol])
}
