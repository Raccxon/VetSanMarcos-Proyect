import { beforeEach, describe, expect, it } from 'vitest'
import { obtenerSesion, guardarSesion, cerrarSesion, tokenVencido } from './sesion'

beforeEach(() => {
    localStorage.clear()
})

describe('obtenerSesion', () => {
    it('devuelve la sesión guardada', () => {
        const sesion = { email: 'ana@correo.cl', rol: 'cliente', nombre: 'Ana' }
        localStorage.setItem('userSession', JSON.stringify(sesion))

        expect(obtenerSesion()).toEqual(sesion)
    })

    it('devuelve null si no hay sesión', () => {
        expect(obtenerSesion()).toBeNull()
    })

    it('devuelve null si la sesión guardada está dañada', () => {
        localStorage.setItem('userSession', '{esto no es json')

        expect(obtenerSesion()).toBeNull()
    })
})

// Fabrica un JWT falso solo para probar (la firma no importa en el front)
function tokenFalso(segundosDesdeAhora) {
    const exp = Math.floor(Date.now() / 1000) + segundosDesdeAhora
    return `cabecera.${btoa(JSON.stringify({ exp }))}.firma`
}

describe('sesión con token', () => {
    it('guarda y recupera la sesión con token vigente', () => {
        const token = tokenFalso(3600)
        guardarSesion({ token, id: 1, nombre: 'Ana', email: 'ana@correo.cl', rol: 'admin' })

        expect(obtenerSesion().token).toBe(token)
    })

    it('si el token venció, borra la sesión y devuelve null', () => {
        guardarSesion({ token: tokenFalso(-10), id: 1, nombre: 'Ana', email: 'ana@correo.cl', rol: 'admin' })

        expect(obtenerSesion()).toBeNull()
        expect(localStorage.getItem('userSession')).toBeNull()
    })

    it('tokenVencido considera inválido un token dañado', () => {
        expect(tokenVencido('esto-no-es-un-jwt')).toBe(true)
    })

    it('cerrarSesion elimina la sesión', () => {
        guardarSesion({ token: tokenFalso(3600), id: 1, nombre: 'Ana', email: 'ana@correo.cl', rol: 'cliente' })
        cerrarSesion()

        expect(obtenerSesion()).toBeNull()
    })
})