import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getServicios } from './apiServices'
import { solicitar } from './api'

vi.mock('./api', () => ({
    solicitar: vi.fn()
}))

beforeEach(() => {
    vi.clearAllMocks()
})

describe('getServicios', () => {
    it('pide el catálogo a GET /api/servicios sin token (es público)', async () => {
        const servicios = [{ id: 1, nombre: 'Consulta general', duracion: 30, precio: 15000 }]
        solicitar.mockResolvedValue(servicios)

        await expect(getServicios()).resolves.toEqual(servicios)
        expect(solicitar).toHaveBeenCalledWith('/api/servicios', { conToken: false })
    })
})