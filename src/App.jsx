import { Routes, Route, Link } from 'react-router-dom'
import ServiciosPage from './pages/ServiciosPage'

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Inicio</Link>
        {' | '}
        <Link to="/servicios">Servicios</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Veterinaria San Marcos</h1>} />
        <Route path="/servicios" element={<ServiciosPage />} />
      </Routes>
    </div>
  )
}

export default App