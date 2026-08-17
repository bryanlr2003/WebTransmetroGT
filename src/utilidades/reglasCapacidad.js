// Archivo con las reglas solicitadas por el enunciado para evaluar la capacidad de los buses.
// Esta función devuelve un mensaje que luego se muestra al operador.
export function evaluarCapacidadBus(bus, pasajeros) {
  // Los valores del formulario llegan como texto, por eso se convierten a número.
  const cantidadPasajeros = Number(pasajeros)

  // Control: si no hay bus o la cantidad no es numérica, no se genera una alerta incorrecta.
  if (!bus || Number.isNaN(cantidadPasajeros)) {
    return null
  }

  // Se valida que el bus tenga una capacidad positiva antes de calcular porcentajes.
  const capacidad = Number(bus.capacidad_maxima)
  if (Number.isNaN(capacidad) || capacidad <= 0) {
    return null
  }

  // Regla de sobrecupo: 150% o más de la capacidad del bus.
  const limiteSobrecupo = capacidad * 1.5

  // Regla de baja ocupación: menos del 25% de la capacidad del bus.
  const limiteBajaOcupacion = capacidad * 0.25
  const detalleCapacidad = `Capacidad de pasajeros: ${capacidad}.`

  // Devuelve alerta roja y recomendación de enviar otra unidad cuando existe sobrecupo.
  if (cantidadPasajeros >= limiteSobrecupo) {
    return {
      tipo: 'sobrecupo',
      nivel: 'danger',
      capacidadMaxima: capacidad,
      mensaje: `${detalleCapacidad}\nEl bus ${bus.codigo} supera el 150% de su capacidad. Se recomienda enviar otra unidad.`,
    }
  }

  // Devuelve alerta amarilla y recomienda esperar cuando la ocupación es muy baja.
  if (cantidadPasajeros < limiteBajaOcupacion) {
    return {
      tipo: 'baja_ocupacion',
      nivel: 'warning',
      capacidadMaxima: capacidad,
      mensaje: `${detalleCapacidad}\nEl bus ${bus.codigo} no alcanza el 25% de ocupación. Debe esperar 5 minutos adicionales.`,
    }
  }

  // Si no se cumple ninguna alerta, devuelve el estado normal de ocupación.
  return {
    tipo: 'normal',
    nivel: 'success',
    capacidadMaxima: capacidad,
    mensaje: `${detalleCapacidad}\nEl bus ${bus.codigo} se encuentra dentro de un rango normal de ocupación.`,
  }
}
