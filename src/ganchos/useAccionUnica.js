// Hook reutilizable para impedir que una acción se envíe varias veces al mismo tiempo.
// Importación de hooks de React: useState actualiza la vista y useRef bloquea al instante el doble clic.
import { useRef, useState } from 'react'

// Devuelve el estado del proceso y una función que bloquea clics o envíos repetidos.
export function useAccionUnica() {
  const [procesando, setProcesando] = useState(false)
  // El ref cambia al instante, antes de que React vuelva a dibujar el botón y lo deshabilite.
  const bloqueoActivo = useRef(false)

  // Si ya existe un envío en proceso, se detiene aquí y no permite una segunda inserción.
  // Al finalizar, incluso si hay error, libera el botón para que el usuario pueda intentarlo de nuevo.
  async function ejecutar(accion) {
    if (bloqueoActivo.current) return

    bloqueoActivo.current = true
    setProcesando(true)

    try {
      return await accion()
    } finally {
      bloqueoActivo.current = false
      setProcesando(false)
    }
  }

  return { procesando, ejecutar }
}
