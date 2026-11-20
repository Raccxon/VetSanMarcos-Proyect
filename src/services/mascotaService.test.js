import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarMisMascotas, crearMascota } from './mascotaService'
import { solicitar } from './api'

// Se reemplaza solicitar para comprobar a qué ruta se llama
vi.mock('./api', () => ({
    solicitar: vi.fn()
}))

beforeEach(() => {
    vi.clearAllMocks()
})

describe('mascotaService', () => {
    it('listarMisMascotas pide GET /api/mascotas/mias', async () => {
        const mascotas = [{ id: 3, nombre: 'Luna', especie: 'Perro' }]
        solicitar.mockResolvedValue(mascotas)

        await expect(listarMisMascotas()).resolves.toEqual(mascotas)
        expect(solicitar).toHaveBeenCalledWith('/api/mascotas/mias')
    })

    it('crearMascota hace POST /api/mascotas con el dueño indicado', async () => {
        const datos = { nombre: 'Rex', especie: 'Perro', raza: 'Mestizo', edad: 2, dueno: { id: 4 } }

        await crearMascota(datos)
        expect(solicitar).toHaveBeenCalledWith('/api/mascotas', { metodo: 'POST', cuerpo: datos })
    })
})