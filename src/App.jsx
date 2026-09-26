import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ServiciosPage from './pages/ServiciosPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<h1>Bienvenido a la Veterinaria San Marcos</h1>} />
        <Route path="servicios" element={<ServiciosPage />} />
      </Route>
    </Routes>
  )
}

export default App