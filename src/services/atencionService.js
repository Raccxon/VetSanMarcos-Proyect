import { solicitar } from './api'

// Historial clínico de una mascota: lo ve su dueño o el personal (GET /api/mascotas/{id}/atenciones)
export const listarAtenciones = (mascotaId) => solicitar(`/api/mascotas/${mascotaId}/atenciones`)

// Registrar, editar y borrar: solo admin y recepción (el backend responde 403 a un cliente)
export const crearAtencion = (mascotaId, datos) =>
    solicitar(`/api/mascotas/${mascotaId}/atenciones`, { metodo: 'POST', cuerpo: datos })

export const actualizarAtencion = (id, datos) =>
    solicitar(`/api/atenciones/${id}`, { metodo: 'PUT', cuerpo: datos })

export const eliminarAtencion = (id) =>
    solicitar(`/api/atenciones/${id}`, { metodo: 'DELETE' })