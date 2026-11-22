import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarVacunas, crearVacuna, actualizarVacuna, eliminarVacuna } from './vacunaService'
import { solicitar } from './api'

// Se reemplaza solicitar para comprobar a qué ruta se llama
vi.mock('./api', () => ({
    solicitar: vi.fn()
}))

beforeEach(() => {
    vi.clearAllMocks()
})

describe('vacunaService', () => {
    it('listarVacunas pide GET /api/mascotas/{id}/vacunas', async () => {
        const vacunas = [{ id: 1, nombre: 'Antirrábica' }]
        solicitar.mockResolvedValue(vacunas)

        await expect(listarVacunas(5)).resolves.toEqual(vacunas)
        expect(solicitar).toHaveBeenCalledWith('/api/mascotas/5/vacunas')
    })

    it('crearVacuna hace POST en la ruta de la mascota', async () => {
        const datos = { nombre: 'Sextuple', fechaAplicacion: '2026-11-10', fechaVencimiento: null }

        await crearVacuna(5, datos)
        expect(solicitar).toHaveBeenCalledWith('/api/mascotas/5/vacunas', { metodo: 'POST', cuerpo: datos })
    })

    it('actualizarVacuna hace PUT en /api/vacunas/{id}', async () => {
        const datos = { nombre: 'Sextuple', fechaAplicacion: '2026-11-10', fechaVencimiento: null }

        await actualizarVacuna(9, datos)
        expect(solicitar).toHaveBeenCalledWith('/api/vacunas/9', { metodo: 'PUT', cuerpo: datos })
    })

    it('eliminarVacuna hace DELETE en /api/vacunas/{id}', async () => {
        await eliminarVacuna(9)
        expect(solicitar).toHaveBeenCalledWith('/api/vacunas/9', { metodo: 'DELETE' })
    })
})