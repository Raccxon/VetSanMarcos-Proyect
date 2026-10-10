import { ROLES } from '../constants/roles'

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