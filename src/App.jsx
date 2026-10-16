import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import RutaProtegida from './components/ui/RutaProtegida'

import HomePage from './pages/HomePage'
import ServiciosPage from './pages/ServiciosPage'
import AgendarPage from './pages/AgendarPage'
import HistorialPage from './pages/HistorialPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/UsuariosPage'
import MisCitasPage from './pages/MisCitasPage'
import { ROLES } from './constants/roles'
import GestionCitasPage from './pages/GestionCitasPage'
import FichasPage from './pages/FichasPage'
import UsuariosPage from './pages/UsuariosPage'

function App() {
  return (
    <Routes>

      <Route path="/" element={<Layout />}>

        <Route index element={<HomePage />} />

        <Route
          path="servicios"
          element={<ServiciosPage />}
        />

        <Route
          path="agendar"
          element={<AgendarPage />}
        />

        <Route
          path="historial"
          element={
            <RutaProtegida>
              <HistorialPage />
            </RutaProtegida>
          }
        />

        <Route
          path="login"
          element={<LoginPage />}
        />

        <Route
          path="admin"
          element={
            <RutaProtegida rolesPermitidos={[ROLES.ADMIN]}>
              <AdminPage />
            </RutaProtegida>
          }
        />

        <Route
          path="usuarios"
          element={
            <RutaProtegida rolesPermitidos={[ROLES.ADMIN]}>
              <UsuariosPage />
            </RutaProtegida>
          }
        />

        <Route
          path="gestion-citas"
          element={
            <RutaProtegida rolesPermitidos={[ROLES.RECEPCION, ROLES.ADMIN]}>
              <GestionCitasPage />
            </RutaProtegida>
          }
        />

        <Route
          path="mis-citas"
          element={
            <RutaProtegida rolesPermitidos={[ROLES.CLIENTE]}>
              <MisCitasPage />
            </RutaProtegida>
          }
        />

        <Route
          path="fichas"
          element={
            <RutaProtegida rolesPermitidos={[ROLES.RECEPCION, ROLES.ADMIN]}>
              <FichasPage />
            </RutaProtegida>
          }
        />

      </Route>

    </Routes>
  )
}

export default App