// Hook reutilizable para impedir que una accion se envie varias veces al mismo tiempo.
// Importacion de hooks de React: useState actualiza la vista y useRef bloquea al instante el doble clic.
import { useRef, useState } from 'react'

// Devuelve el estado del proceso y una funcion que bloquea clics o envios repetidos.
export function useAccionUnica() {
  const [procesando, setProcesando] = useState(false)
  // El ref cambia al instante, antes de que React vuelva a dibujar el boton y lo deshabilite.
  const bloqueoActivo = useRef(false)

  // Si ya existe un envio en proceso, se detiene aqui y no permite una segunda insercion.
  // Al finalizar, incluso si hay error, libera el boton para que el usuario pueda intentarlo de nuevo.
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
