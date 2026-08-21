// Estructura visual reutilizable para los paneles protegidos del administrador y operador.
// Importación de Outlet para mostrar la página hija de cada ruta.
import { Outlet } from 'react-router-dom'
// Importación de los componentes fijos de navegación del panel.
import { BarraSuperior } from '../componentes/BarraSuperior.jsx'
import { MenuLateral } from '../componentes/MenuLateral.jsx'

// Estructura común para las pantallas internas del administrador y operador.
export function LayoutPanel() {
  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        {/* Menú lateral con las opciones permitidas para el usuario. */}
        <div className="col-lg-3 col-xl-2">
          <MenuLateral />
        </div>
        {/* Área principal donde se carga cada pantalla seleccionada. */}
        <main className="col-lg-9 col-xl-10 contenido-panel">
          <BarraSuperior />
          <div className="p-3 p-lg-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
