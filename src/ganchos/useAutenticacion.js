// Gancho personalizado para consultar la sesión del usuario desde cualquier pantalla.
// Importación de useContext para leer un contexto de React.
import { useContext } from 'react'
// Importación del contexto que contiene la información de autenticación.
import { ContextoAutenticacion } from '../contextos/contextosBase.js'

// Gancho propio para usar la sesión actual desde cualquier componente que esté dentro del proveedor.
export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion)
  // Control: evita usar la sesión fuera de ProveedorAutenticacion y muestra un error claro al programador.
  if (!contexto) throw new Error('useAutenticacion debe usarse dentro del proveedor.')
  return contexto
}
