import { solicitar } from './api'

// Mascotas del cliente que inició sesión
export const listarMisMascotas = () => solicitar('/api/mascotas/mias')

// Solo administrador y recepción
export const listarMascotas = () => solicitar('/api/mascotas')

export const crearMascota = (datos) =>
    solicitar('/api/mascotas', { metodo: 'POST', cuerpo: datos })

export const actualizarMascota = (id, datos) =>
    solicitar(`/api/mascotas/${id}`, { metodo: 'PUT', cuerpo: datos })

// Solo administrador y recepción
export const eliminarMascota = (id) =>
    solicitar(`/api/mascotas/${id}`, { metodo: 'DELETE' })