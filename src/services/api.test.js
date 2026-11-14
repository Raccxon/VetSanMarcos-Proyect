import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { solicitar } from './api'
import { guardarSesion } from '../utils/sesion'

// JWT falso con vencimiento en 1 hora (el front solo lee la fecha "exp")
const tokenVigente = () =>
    `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`

const iniciarSesion = () =>
    guardarSesion({ token: tokenVigente(), id: 1, nombre: 'Admin', email: 'admin@sanmarcos.cl', rol: 'admin' })

// Simula la respuesta del servidor
const responder = (status, cuerpo) =>
    vi.fn().mockResolvedValue({
        status,
        ok: status >= 200 && status < 300,
        json: () => (cuerpo === undefined ? Promise.reject(new Error('sin cuerpo')) : Promise.resolve(cuerpo))
    })

beforeEach(() => {
    localStorage.clear()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('solicitar', () => {
    it('envía el token en la cabecera Authorization cuando hay sesión', async () => {
        vi.stubGlobal('fetch', responder(200, []))
        iniciarSesion()

        await solicitar('/api/usuarios')

        const [url, opciones] = fetch.mock.calls[0]
        expect(url).toBe('http://localhost:8080/api/usuarios')
        expect(opciones.method).toBe('GET')
        expect(opciones.headers.Authorization).toMatch(/^Bearer cabecera\./)
    })

    it('no envía token si se pide conToken: false (login)', async () => {
        vi.stubGlobal('fetch', responder(200, { token: 'x' }))
        iniciarSesion()

        await solicitar('/api/auth/login', { metodo: 'POST', conToken: false, cuerpo: { email: 'a', password: 'b' } })

        const [, opciones] = fetch.mock.calls[0]
        expect(opciones.headers.Authorization).toBeUndefined()
        expect(opciones.headers['Content-Type']).toBe('application/json')
        expect(opciones.body).toBe(JSON.stringify({ email: 'a', password: 'b' }))
    })

    it('devuelve null cuando el backend responde 204', async () => {
        vi.stubGlobal('fetch', responder(204))
        iniciarSesion()

        await expect(solicitar('/api/usuarios/5', { metodo: 'DELETE' })).resolves.toBeNull()
    })

    it('un 401 con sesión cierra la sesión y lanza el mensaje del backend', async () => {
        vi.stubGlobal('fetch', responder(401, { status: 401, message: 'Debes iniciar sesión o tu sesión expiró' }))
        iniciarSesion()

        await expect(solicitar('/api/usuarios')).rejects.toMatchObject({
            message: 'Debes iniciar sesión o tu sesión expiró',
            status: 401
        })
        expect(localStorage.getItem('userSession')).toBeNull()
    })

    it('un 401 del login (conToken: false) no toca la sesión', async () => {
        vi.stubGlobal('fetch', responder(401, { status: 401, message: 'Correo o contraseña incorrectos' }))
        iniciarSesion()

        await expect(
            solicitar('/api/auth/login', { metodo: 'POST', conToken: false, cuerpo: {} })
        ).rejects.toThrow('Correo o contraseña incorrectos')
        expect(localStorage.getItem('userSession')).not.toBeNull()
    })

    it('un 403 muestra el mensaje pero mantiene la sesión', async () => {
        vi.stubGlobal('fetch', responder(403, { status: 403, message: 'No tienes permiso para realizar esta acción' }))
        iniciarSesion()

        await expect(solicitar('/api/usuarios')).rejects.toMatchObject({ status: 403 })
        expect(localStorage.getItem('userSession')).not.toBeNull()
    })

    it('si el servidor no responde lanza un error de conexión', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

        await expect(solicitar('/api/usuarios')).rejects.toThrow('No se pudo conectar con el servidor')
    })

    it('si el error no trae JSON usa un mensaje con el código', async () => {
        vi.stubGlobal('fetch', responder(500))

        await expect(solicitar('/api/usuarios')).rejects.toThrow('Error 500')
    })
})