import { useContext } from 'react'
import { ContextoAutenticacion } from '../contextos/contextosBase.js'

// Gancho propio para usar la sesion actual desde cualquier componente.
export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion)
  if (!contexto) throw new Error('useAutenticacion debe usarse dentro del proveedor.')
  return contexto
}
