import { ROLES } from '../constants/roles'
import { servicios } from '../data/servicios'

// Decide que fichas ve cada persona
// - sin sesion: ninguna
// - recepcion y administracion: todas
// - dueño (cliente): solo las de su correo

export function fichasVisibles(fichas, sesion) {
    if (!sesion) return []

    if (sesion.rol === ROLES.RECEPCION || sesion.rol === ROLES.ADMIN) {
        return fichas
    }

    if (sesion.rol === ROLES.CLIENTE && sesion.email) {
        const correo = sesion.email.trim().toLowerCase()
        return fichas.filter((f) => f.emailDuenio?.trim().toLowerCase() === correo)
    }

    return []
}
const limpiarRut = (rut = '') => rut.replace(/\./g, '').trim().toLowerCase()

// Categoría de una cita según su servicio ('' si el servicio ya no existe)
export const categoriaDeCita = (cita) =>
    servicios.find((s) => s.id === cita.servicioId)?.categoria ?? ''

export const fichasDeRut = (fichas, rut) =>
    fichas.filter((f) => limpiarRut(f.rutDuenio) === limpiarRut(rut))

export const citasDeRut = (citas, rut) =>
    citas.filter((c) => limpiarRut(c.rutDuenio) === limpiarRut(rut))

export const filtrarPorCategoria = (citas, categoria = 'Todas') =>
    categoria === 'Todas' ? citas : citas.filter((c) => categoriaDeCita(c) === categoria)

export const citasDelDia = (citas, fecha) => citas.filter((c) => c.fecha === fecha)