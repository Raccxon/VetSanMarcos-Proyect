import { beforeEach, describe, expect, it } from 'vitest'
import { obtenerSesion } from './sesion'

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