import {describe, it, expect} from 'vitest'
import { filtrarCitasPorEmail } from './citas'

const citas = [
    {id: 'CIT-1', email: 'ana@gmail.com'},
    {id: 'CIT-2', email: 'pedro@gmail.com'}
]

describe('filtrarCitasPorEmail', () => {
    it('devuelve solo las citas del email indicado', () => {
        const resultado = filtrarCitasPorEmail(citas, 'ana@gmail.com')
        expect(resultado).toHaveLength(1)
        expect(resultado[0].id).toBe('CIT-1')
    })

    it('ignora mayusculas y espacios al comparar', () => {
        const resultado = filtrarCitasPorEmail(citas, '  ANA@gmail.com')
        expect(resultado).toHaveLength(1)
        expect(resultado[0].id).toBe('CIT-1')
    })

    it('devuelve lista vacia si no hay email', () => {
        expect(filtrarCitasPorEmail(citas, '')).toEqual([])
        expect(filtrarCitasPorEmail(citas, null)).toEqual([])
    })
})