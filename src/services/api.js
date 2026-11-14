import { obtenerToken, cerrarSesion } from '../utils/sesion'

// URL del backend. Se puede cambiar con la variable VITE_API_URL sin tocar el código.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Única función que hace fetch al backend en todo el proyecto.
//  - agrega "Authorization: Bearer <token>" cuando hay sesión (conToken = true)
//  - si el backend responde 401 con un token enviado, la sesión venció o es inválida: la cierra
//  - convierte cualquier error en un Error con el mensaje del backend
export async function solicitar(ruta, { metodo = 'GET', cuerpo, conToken = true } = {}) {
    const cabeceras = {}

    if (cuerpo !== undefined) {
        cabeceras['Content-Type'] = 'application/json'
    }

    const token = conToken ? obtenerToken() : null
    if (token) {
        cabeceras.Authorization = `Bearer ${token}`
    }

    let respuesta
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            method: metodo,
            headers: cabeceras,
            body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
        })
    } catch {
        // fetch solo lanza error si no hubo conexión (servidor apagado, CORS, red)
        throw new Error('No se pudo conectar con el servidor')
    }

    // 204 No Content (por ejemplo al eliminar): no hay cuerpo que leer
    if (respuesta.status === 204) return null

    // El backend responde JSON { status, message, errors? } cuando hay error
    const datos = await respuesta.json().catch(() => null)

    if (!respuesta.ok) {
        // El login también responde 401 (clave incorrecta), pero ahí no hay sesión que cerrar
        if (respuesta.status === 401 && conToken) {
            cerrarSesion()
        }
        const error = new Error(datos?.message ?? `Error ${respuesta.status}`)
        error.status = respuesta.status
        throw error
    }

    return datos
}