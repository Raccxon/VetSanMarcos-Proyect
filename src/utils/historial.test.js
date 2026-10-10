import { describe, it, expect } from 'vitest'
import { fichasVisibles } from './historial'

const fichas = [
    { rutDuenio: '11111111-1', emailDuenio: 'ana@correo.cl'},
    { rutDuenio: '22222222-2', emailDuenio: 'pedro@correo.cl'}
]

describe('fichasVisibles', () => {
    it('sin sesion no muestra ninguna ficha', () => {
        expect(fichasVisibles(fichas, null)).toEqual([])
    })

    it('un dueño ve solo las fichas de su correo', () => {
        const sesion = {email: 'Ana@correo.cl', rol: 'cliente'}
        const resultado = fichasVisibles(fichas, sesion)

        expect(resultado).toHaveLength(1)
        expect(resultado[0].rutDuenio).toBe('11111111-1')
    })

    it('recepcion y administracion ven todas las fichas', () => {
        expect(fichasVisibles(fichas, {email: 'r@sanmarcos.cl', rol: 'recepcion'})).toHaveLength(2)
        expect(fichasVisibles(fichas, {email: 'a@sanmarcos.cl', rol: 'admin'})).toHaveLength(2)
    })

    it('un rol desconocido no ve ninguna ficha', () => {
        expect(fichasVisibles(fichas, {email: 'ana@correo.cl', rol: 'otro'})).toEqual([])
    })
})