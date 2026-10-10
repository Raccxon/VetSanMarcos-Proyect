import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getServicios } from './apiServices'
import { servicios } from '../data/servicios'

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('getServicios', () => {
    it('entrega los servicios después del retardo simulado', async () => {
        const promesa = getServicios()

        // la respuesta simula una API: tarda 300 ms
        vi.advanceTimersByTime(300)

        await expect(promesa).resolves.toEqual(servicios)
    })
})