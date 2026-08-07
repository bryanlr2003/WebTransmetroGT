import { createContext } from 'react'

// Contextos base para compartir autenticacion y 
// datos sin pasar props en cada pantalla.
export const ContextoAutenticacion = createContext(null)
export const ContextoDatos = createContext(null)
