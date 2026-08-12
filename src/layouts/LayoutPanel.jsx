import { Outlet } from 'react-router-dom'
import { BarraSuperior } from '../componentes/BarraSuperior.jsx'
import { MenuLateral } from '../componentes/MenuLateral.jsx'

// Estructura comun para las pantallas internas del administrador y operador.
export function LayoutPanel() {
  return (
    <div className="container-fluid px-0">
      <div className="row g-0">
        <div className="col-lg-3 col-xl-2">
          <MenuLateral />
        </div>
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
