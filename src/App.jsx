// corrector ortografico
import { StricMode } from 'react'
// trae funcion que conecta react con el HTML
import { createRoot } from 'react-dom/client'
// trae el componente que activa las rutas de la aplicacion
import { BrowserRouter } from 'react-router-dom'
// trae el archivo de estilos de bootstrap (CSS)
import  'bootstrap/dist/css/bootstrap.min.css'
// trae nuestros estilos
import './index.css'
// trae el componente de toda la aplicacion
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StricMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StricMode>
)
