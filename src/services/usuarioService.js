import { solicitar } from './api'

// Todas estas rutas son solo para administradores: el backend exige rol ADMIN
export const listarUsuarios = () => solicitar('/api/usuarios')

export const crearUsuario = (datos) =>
    solicitar('/api/usuarios', { metodo: 'POST', cuerpo: datos })

export const actualizarUsuario = (id, datos) =>
    solicitar(`/api/usuarios/${id}`, { metodo: 'PUT', cuerpo: datos })

export const eliminarUsuario = (id) =>
    solicitar(`/api/usuarios/${id}`, { metodo: 'DELETE' })