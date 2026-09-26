// corrector ortografico
import { StrictMode } from 'react'
// trae funcion que conecta react con el HTML
import { createRoot } from 'react-dom/client'
// trae el componente que activa las rutas de la aplicacion
import { BrowserRouter } from 'react-router-dom'
// trae el archivo de estilos de bootstrap (CSS)
import  'bootstrap/dist/css/bootstrap.min.css'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// trae nuestros estilos
import './index.css'
// trae el componente de toda la aplicacion
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
