// Devuelve la fecha y hora actual en formato compatible con input datetime-local.
export function obtenerFechaHoraLocal() {
  const ahora = new Date()
  const zona = ahora.getTimezoneOffset() * 60000
  return new Date(ahora.getTime() - zona).toISOString().slice(0, 16)
}

// Formatea fechas para mostrarlas en tablas y reportes.
export function formatearFecha(valor) {
  if (!valor) return 'Sin registro'
  return new Date(valor).toLocaleString('es-GT', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

// Formatea numeros usando el formato local de Guatemala.
export function formatearNumero(valor, decimales = 2) {
  const numero = Number(valor || 0)
  return numero.toLocaleString('es-GT', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}
