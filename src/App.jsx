import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import RutaProtegida from './components/ui/RutaProtegida'

import HomePage from './pages/HomePage'
import ServiciosPage from './pages/ServiciosPage'
import AgendarPage from './pages/AgendarPage'
import HistorialPage from './pages/HistorialPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import MisCitasPage from './pages/MisCitasPage'
import { ROLES } from './constants/roles'

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
          element={<HistorialPage />}
        />

        <Route
          path="login"
          element={<LoginPage />}
        />

        <Route
          path="admin"
          element={
            <RutaProtegida rolRequerido="{ROLES.ADMIN}">
              <AdminPage />
            </RutaProtegida>
          }
        />

        <Route
          path="mis-citas"
          element={
            <RutaProtegida rolRequerido="{ROLES.CLIENTE}">
              <MisCitasPage />
            </RutaProtegida>
          }
        />

      </Route>

    </Routes>
  )
}

export default App