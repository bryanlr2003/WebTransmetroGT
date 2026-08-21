// Herramientas de Vite para leer la configuración y compilar componentes React.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración básica de Vite para ejecutar React en desarrollo y producción.
export default defineConfig({
  plugins: [react()],
})
