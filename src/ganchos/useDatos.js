import { useContext } from 'react'
import { ContextoDatos } from '../contextos/contextosBase.js'

// Gancho propio para consultar datos y operaciones de Supabase desde las pantallas.
export function useDatos() {
  const contexto = useContext(ContextoDatos)
  if (!contexto) throw new Error('useDatos debe usarse dentro del proveedor.')
  return contexto
}
