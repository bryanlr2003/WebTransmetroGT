// Archivo principal que organiza las rutas y los proveedores generales de la aplicación.
// Importaciones para crear las rutas internas de la página.
import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
// Importación de los proveedores que comparten sesión y datos.
import { ProveedorAutenticacion } from './contextos/ContextoAutenticacion.jsx'
import { ProveedorDatos } from './contextos/ContextoDatos.jsx'
// Importación del componente que restringe las rutas por rol.
import { RutaProtegida } from './componentes/RutaProtegida.jsx'
// Importación de la estructura común para los paneles internos.
import { LayoutPanel } from './layouts/LayoutPanel.jsx'
// Importación de las pantallas de autenticación y administrador.
import { Login } from './paginas/autenticacion/Login.jsx'
import { DashboardAdmin } from './paginas/admin/DashboardAdmin.jsx'
import { PaginaCatalogo } from './paginas/admin/PaginaCatalogo.jsx'
import { PaginaRutas } from './paginas/admin/PaginaRutas.jsx'
import { PaginaReportes } from './paginas/admin/PaginaReportes.jsx'
// Importación de las pantallas disponibles para el operador.
import { DashboardOperador } from './paginas/operador/DashboardOperador.jsx'
import { PaginaRegistrarLlegada } from './paginas/operador/PaginaRegistrarLlegada.jsx'
import { PaginaRegistrarSalida } from './paginas/operador/PaginaRegistrarSalida.jsx'
import { PaginaAlertasOperador } from './paginas/operador/PaginaAlertasOperador.jsx'

// Componente que define el recorrido principal de la aplicación.
function App() {
  return (
    // BrowserRouter permite manejar la navegación interna de la página web.
    <BrowserRouter>
      {/* ProveedorAutenticacion guarda la sesión y el rol del usuario actual. */}
      <ProveedorAutenticacion>
        {/* ProveedorDatos centraliza las consultas y operaciones con Supabase. */}
        <ProveedorDatos>
          <Routes>
            {/* Pantalla pública para iniciar sesión. */}
            <Route path="/login" element={<Login />} />

            {/* Rutas del administrador: solo usuarios con rol administrador pueden entrar. */}
            <Route
              path="/admin"
              element={
                <RutaProtegida rolesPermitidos={['administrador']}>
                  <LayoutPanel />
                </RutaProtegida>
              }
            >
              <Route index element={<DashboardAdmin />} />
              <Route path="municipalidades" element={<PaginaCatalogo tipo="municipalidades" />} />
              <Route path="lineas" element={<PaginaCatalogo tipo="lineas" />} />
              <Route path="estaciones" element={<PaginaCatalogo tipo="estaciones" />} />
              <Route path="rutas" element={<PaginaRutas />} />
              <Route path="accesos" element={<PaginaCatalogo tipo="accesos" />} />
              <Route path="guardias" element={<PaginaCatalogo tipo="guardias" />} />
              <Route path="parqueos" element={<PaginaCatalogo tipo="parqueos" />} />
              <Route path="buses" element={<PaginaCatalogo tipo="buses" />} />
              <Route path="pilotos" element={<PaginaCatalogo tipo="pilotos" />} />
              <Route path="operadores" element={<PaginaCatalogo tipo="operadores" />} />
              <Route path="reportes" element={<PaginaReportes />} />
            </Route>

            {/* Rutas del operador: solo puede registrar movimientos de su estación. */}
            <Route
              path="/operador"
              element={
                <RutaProtegida rolesPermitidos={['operador']}>
                  <LayoutPanel />
                </RutaProtegida>
              }
            >
              <Route index element={<DashboardOperador />} />
              <Route path="llegadas" element={<PaginaRegistrarLlegada />} />
              <Route path="salidas" element={<PaginaRegistrarSalida />} />
              <Route path="alertas" element={<PaginaAlertasOperador />} />
            </Route>

            {/* Si la ruta no existe, se regresa al inicio de sesión. */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ProveedorDatos>
      </ProveedorAutenticacion>
    </BrowserRouter>
  )
}

export default App
