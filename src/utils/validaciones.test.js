import { describe, expect, it } from 'vitest'
import { fechaNoPasada, rutValido, telefonoValido } from './validaciones'

describe('rutValido', () => {
    it('acepta RUT con o sin puntos y con K', () => {
        expect(rutValido('12345678-9')).toBe(true)
        expect(rutValido('12.345.678-9')).toBe(true)
        expect(rutValido('1234567-K')).toBe(true)
    })

    it('rechaza RUT vacío o con formato incorrecto', () => {
        expect(rutValido('')).toBe(false)
        expect(rutValido('123456789')).toBe(false)
        expect(rutValido('abc-1')).toBe(false)
    })
})

describe('telefonoValido', () => {
    it('acepta celulares chilenos en distintos formatos', () => {
        expect(telefonoValido('912345678')).toBe(true)
        expect(telefonoValido('+56912345678')).toBe(true)
        expect(telefonoValido('+56 9 1234 5678')).toBe(true)
    })

    it('rechaza teléfonos incompletos o con letras', () => {
        expect(telefonoValido('')).toBe(false)
        expect(telefonoValido('12345')).toBe(false)
        expect(telefonoValido('+5691234abcd')).toBe(false)
    })
})

describe('fechaNoPasada', () => {
    const hoy = new Date(2026, 9, 10) // 10-oct-2026

    it('acepta la fecha de hoy y las futuras', () => {
        expect(fechaNoPasada('2026-10-10', hoy)).toBe(true)
        expect(fechaNoPasada('2026-12-01', hoy)).toBe(true)
    })

    it('rechaza fechas pasadas o vacías', () => {
        expect(fechaNoPasada('2026-10-09', hoy)).toBe(false)
        expect(fechaNoPasada('', hoy)).toBe(false)
    })
})