import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getServicios, crearServicio, actualizarServicio, eliminarServicio } from './apiServices'
import { solicitar } from './api'

// Se reemplaza solicitar para comprobar a qué ruta se llama
vi.mock('./api', () => ({
    solicitar: vi.fn()
}))

const datos = {
    nombre: 'Vacuna triple felina', categoria: 'Vacunación', especie: 'Gato',
    duracion: 15, precio: 14000, stock: 10
}

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

describe('operaciones de administrador sobre servicios', () => {
    it('crearServicio hace POST /api/servicios con token', async () => {
        await crearServicio(datos)
        expect(solicitar).toHaveBeenCalledWith('/api/servicios', { metodo: 'POST', cuerpo: datos })
    })

    it('actualizarServicio hace PUT /api/servicios/{id}', async () => {
        await actualizarServicio(4, datos)
        expect(solicitar).toHaveBeenCalledWith('/api/servicios/4', { metodo: 'PUT', cuerpo: datos })
    })

    it('eliminarServicio hace DELETE /api/servicios/{id}', async () => {
        await eliminarServicio(4)
        expect(solicitar).toHaveBeenCalledWith('/api/servicios/4', { metodo: 'DELETE' })
    })
})