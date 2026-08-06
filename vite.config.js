import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuracion basica de Vite para ejecutar React en desarrollo y produccion.
export default defineConfig({
  plugins: [react()],
})
