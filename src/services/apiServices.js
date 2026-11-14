import { solicitar } from './api'

// Catálogo de servicios desde el backend (GET /api/servicios).
// Es público: no necesita token, así que no se envía.
export const getServicios = () => solicitar('/api/servicios', { conToken: false })