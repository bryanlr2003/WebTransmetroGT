// Punto de inicio: aquí React carga los estilos y muestra la aplicación en la página.
// Importaciones necesarias para crear la raíz de React.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Importación de Bootstrap, sus íconos y los estilos propios del proyecto.
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
// Importación del componente principal que contiene todas las rutas.
import App from './App.jsx'

// Punto de entrada de React. Aquí se montan Bootstrap, los íconos y la aplicación principal.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
