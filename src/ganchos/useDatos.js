// Gancho personalizado para acceder fácilmente a los datos compartidos por el contexto.
// Importación de useContext para leer un contexto de React.
import { useContext } from 'react'
// Importación del contexto que contiene los datos de la aplicación.
import { ContextoDatos } from '../contextos/contextosBase.js'

// Gancho propio para consultar datos y operaciones de Supabase desde las pantallas dentro del proveedor.
export function useDatos() {
  const contexto = useContext(ContextoDatos)
  // Control: evita consultar datos fuera de ProveedorDatos y facilita detectar una configuración incorrecta.
  if (!contexto) throw new Error('useDatos debe usarse dentro del proveedor.')
  return contexto
}
