// Archivo con funciones sencillas para dar formato uniforme a fechas y números en la aplicación.

// Devuelve la fecha y hora actual en formato compatible con el campo datetime-local del formulario.
export function obtenerFechaHoraLocal() {
  const ahora = new Date()
  // Ajusta la zona horaria para que el input muestre la hora local del equipo y no la hora UTC.
  const zona = ahora.getTimezoneOffset() * 60000
  return new Date(ahora.getTime() - zona).toISOString().slice(0, 16)
}

// Formatea fechas para mostrarlas en tablas y reportes con el formato de Guatemala.
export function formatearFecha(valor) {
  // Control para no intentar convertir una fecha vacía o inexistente.
  if (!valor) return 'Sin registro'
  return new Date(valor).toLocaleString('es-GT', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

// Formatea números usando el formato local de Guatemala y dos decimales por defecto.
export function formatearNumero(valor, decimales = 2) {
  // Si el valor llega vacío, se muestra cero en lugar de NaN.
  const numero = Number(valor || 0)
  return numero.toLocaleString('es-GT', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}
