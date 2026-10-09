import { describe, it, expect } from "vitest";
import { calcularEstadoVacuna } from "./vacunas";

const hoy = new Date(2026, 9, 9)

describe('calcularEstadoVacuna', () => {
    it('marca como Vencida una vacuna cuya fecha ya paso', () => {
        expect(calcularEstadoVacuna('2026-05-10', hoy)).toBe('Vencida')
    })

    it('marca como Próxima a vencer si vence dentro de 30 dias', () => {
        expect(calcularEstadoVacuna('2026-10-25', hoy)).toBe('Próxima a vencer')
    })

    it('marca como Vigente si falta mas de 30 dias', () => {
        expect(calcularEstadoVacuna('2027-03-01', hoy)).toBe('Vigente')
    })
    it('marca como Proxima a vencer una vacuna que vence hoy', () => {
        expect(calcularEstadoVacuna('2026-10-09', hoy)).toBe('Próxima a vencer')
    })

    it('devuelve Sin fecha si falta o es invalida', () => {
        expect(calcularEstadoVacuna('',hoy)).toBe('Sin fecha')
        expect(calcularEstadoVacuna('no-es-fecha',hoy)).toBe('Sin fecha')
    })
})