import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ServiciosPage from './pages/ServiciosPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="servicios" element={<ServiciosPage />} />
      </Route>
    </Routes>
  )
}

export default App