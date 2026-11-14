// URL del backend. Se cambia con la variable VITE_API_URL sin tocar el código.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Hace la petición y convierte cualquier falla en un Error con un mensaje legible
async function peticion(ruta, cuerpo) {
    let respuesta
    try {
        respuesta = await fetch(`${API_URL}${ruta}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpo)
        })
    } catch {
        // fetch solo lanza error si no hubo conexión (servidor apagado, CORS, red)
        throw new Error('No se pudo conectar con el servidor')
    }

    // El backend responde JSON { status, message, errors? } cuando hay error
    const datos = await respuesta.json().catch(() => null)

    if (!respuesta.ok) {
        throw new Error(datos?.message ?? `Error ${respuesta.status}`)
    }
    return datos
}

export function login(email, password) {
    return peticion('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password
    })
}

export function registrar(datos) {
    return peticion('/api/auth/registro', {
        ...datos,
        email: datos.email.trim().toLowerCase()
    })
}