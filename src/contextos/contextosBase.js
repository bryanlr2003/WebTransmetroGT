// Este archivo crea los contextos que comparten la sesión y los datos en toda la aplicación.
// Importación de createContext para crear contenedores globales de React.
import { createContext } from 'react'

// Contextos base para compartir autenticación y datos sin pasar props en cada pantalla.
// Inician en null para que los hooks puedan avisar si se usan fuera de su proveedor.
export const ContextoAutenticacion = createContext(null)
export const ContextoDatos = createContext(null)
