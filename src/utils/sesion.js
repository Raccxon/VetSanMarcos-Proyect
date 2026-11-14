import { avisarCambioSesion } from './sesionEventos'

const CLAVE = 'userSession'

// Un JWT tiene 3 partes separadas por puntos: cabecera.datos.firma
// Aquí leemos la del medio (los datos), que incluye "exp" (cuándo vence, en segundos).
function leerPayload(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(base64))
    } catch {
        return null
    }
}

// true si el token está dañado, no trae fecha de vencimiento o ya venció
export function tokenVencido(token) {
    const payload = leerPayload(token)
    if (!payload || !payload.exp) return true
    return payload.exp * 1000 <= Date.now()
}

// Guarda lo que respondió POST /api/auth/login: { token, id, nombre, email, rol }
export function guardarSesion(respuesta) {
    const { token, id, nombre, email, rol } = respuesta
    localStorage.setItem(CLAVE, JSON.stringify({ token, id, nombre, email, rol }))
    avisarCambioSesion()
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE)
    avisarCambioSesion()
}

// Devuelve la sesión o null. Si el token ya venció, borra la sesión y devuelve null.
export function obtenerSesion() {
    try {
        const sesion = JSON.parse(localStorage.getItem(CLAVE))
        if (sesion && sesion.token && tokenVencido(sesion.token)) {
            localStorage.removeItem(CLAVE)
            return null
        }
        return sesion
    } catch {
        return null
    }
}

// Lo usarán los fetch para mandar "Authorization: Bearer <token>"
export function obtenerToken() {
    return obtenerSesion()?.token ?? null
}