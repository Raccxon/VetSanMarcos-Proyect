import { solicitar } from './api'

// Vacunas de una mascota: la ve su dueño o el personal (GET /api/mascotas/{id}/vacunas)
export const listarVacunas = (mascotaId) => solicitar(`/api/mascotas/${mascotaId}/vacunas`)

// Registrar, editar y borrar: solo admin y recepción (el backend responde 403 a un cliente)
export const crearVacuna = (mascotaId, datos) =>
    solicitar(`/api/mascotas/${mascotaId}/vacunas`, { metodo: 'POST', cuerpo: datos })

export const actualizarVacuna = (id, datos) =>
    solicitar(`/api/vacunas/${id}`, { metodo: 'PUT', cuerpo: datos })

export const eliminarVacuna = (id) =>
    solicitar(`/api/vacunas/${id}`, { metodo: 'DELETE' })