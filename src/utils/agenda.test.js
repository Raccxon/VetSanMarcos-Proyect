import { describe, expect, it } from 'vitest'
import { BLOQUES_HORARIO, bloqueNoDisponible, esDomingo, horaAMinutos, seSolapan } from './agenda'

describe('horaAMinutos', () => {
    it('convierte una hora a minutos desde las 00:00', () => {
        expect(horaAMinutos('00:00')).toBe(0)
        expect(horaAMinutos('10:30')).toBe(630)
        expect(horaAMinutos('17:30')).toBe(1050)
    })
})

describe('esDomingo', () => {
    it('detecta los domingos', () => {
        expect(esDomingo('2030-01-20')).toBe(true)
        expect(esDomingo('2030-01-15')).toBe(false)
    })

    it('una fecha vacía no es domingo', () => {
        expect(esDomingo('')).toBe(false)
    })
})

describe('BLOQUES_HORARIO', () => {
    it('no tiene bloques en la hora de colación', () => {
        expect(BLOQUES_HORARIO).toHaveLength(12)
        expect(BLOQUES_HORARIO).not.toContain('13:00')
        expect(BLOQUES_HORARIO).toContain('12:00')
        expect(BLOQUES_HORARIO).toContain('15:00')
    })
})

describe('seSolapan', () => {
    it('dos tramos que se pisan', () => {
        expect(seSolapan('10:00', 30, '10:00', 10)).toBe(true)
        expect(seSolapan('09:00', 90, '10:00', 30)).toBe(true)
    })

    it('un tramo que empieza justo cuando termina el otro no se pisa', () => {
        expect(seSolapan('10:00', 30, '10:30', 30)).toBe(false)
        expect(seSolapan('10:00', 30, '09:00', 60)).toBe(false)
    })
})

describe('bloqueNoDisponible', () => {
    const ocupadas = [{ hora: '10:00', duracion: 30 }]

    it('un bloque libre está disponible', () => {
        expect(bloqueNoDisponible('11:00', 30, ocupadas)).toBe(false)
        expect(bloqueNoDisponible('10:30', 30, ocupadas)).toBe(false)
    })

    it('un bloque ocupado no está disponible', () => {
        expect(bloqueNoDisponible('10:00', 30, ocupadas)).toBe(true)
    })

    it('un servicio largo que se cruza con una cita no está disponible', () => {
        expect(bloqueNoDisponible('09:00', 90, ocupadas)).toBe(true)
    })

    it('un servicio que pasa de las 17:30 no está disponible', () => {
        expect(bloqueNoDisponible('17:00', 90, [])).toBe(true)
        expect(bloqueNoDisponible('16:00', 90, [])).toBe(false)
        expect(bloqueNoDisponible('17:00', 30, [])).toBe(false)
    })
})