import { solicitar } from './api'

// Catálogo de servicios desde el backend (GET /api/servicios).
// Es público: no necesita token, así que no se envía.
export const getServicios = () => solicitar('/api/servicios', { conToken: false })

// Estas tres exigen rol ADMIN: el backend lo comprueba con el token
export const crearServicio = (datos) =>
  solicitar('/api/servicios', { metodo: 'POST', cuerpo: datos })

export const actualizarServicio = (id, datos) =>
  solicitar(`/api/servicios/${id}`, { metodo: 'PUT', cuerpo: datos })

export const eliminarServicio = (id) =>
  solicitar(`/api/servicios/${id}`, { metodo: 'DELETE' })