// Esto lee la sesion simulada que guarda nuestro LoginPage en localStorage
// Nos devuelve { email, rol. nombre} o null si no hay sesion valida

export function obtenerSesion() {
    try {
        return JSON.parse(localStorage.getItem("userSession"))
    } catch {
        return null
    }
}