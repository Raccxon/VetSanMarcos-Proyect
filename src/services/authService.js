import { solicitar } from './api'

// El login y el registro no llevan token (todavía no hay sesión)
export function login(email, password) {
    return solicitar('/api/auth/login', {
        metodo: 'POST',
        conToken: false,
        cuerpo: { email: email.trim().toLowerCase(), password }
    })
}

export function registrar(datos) {
    return solicitar('/api/auth/registro', {
        metodo: 'POST',
        conToken: false,
        cuerpo: { ...datos, email: datos.email.trim().toLowerCase() }
    })
}