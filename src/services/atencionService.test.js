import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarAtenciones, crearAtencion, actualizarAtencion, eliminarAtencion } from './atencionService'
import { solicitar } from './api'

// Se reemplaza solicitar para comprobar a qué ruta se llama
vi.mock('./api', () => ({
    solicitar: vi.fn()
}))

beforeEach(() => {
    vi.clearAllMocks()
})

describe('atencionService', () => {
    it('listarAtenciones pide GET /api/mascotas/{id}/atenciones', async () => {
        const atenciones = [{ id: 1, motivo: 'Control anual' }]
        solicitar.mockResolvedValue(atenciones)

        await expect(listarAtenciones(5)).resolves.toEqual(atenciones)
        expect(solicitar).toHaveBeenCalledWith('/api/mascotas/5/atenciones')
    })

    it('crearAtencion hace POST en la ruta de la mascota', async () => {
        const datos = { fecha: '2026-11-15', motivo: 'Cojera', diagnostico: null, tratamiento: null }

        await crearAtencion(5, datos)
        expect(solicitar).toHaveBeenCalledWith('/api/mascotas/5/atenciones', { metodo: 'POST', cuerpo: datos })
    })

    it('actualizarAtencion hace PUT en /api/atenciones/{id}', async () => {
        const datos = { fecha: '2026-11-15', motivo: 'Cojera', diagnostico: 'Esguince', tratamiento: 'Reposo' }

        await actualizarAtencion(9, datos)
        expect(solicitar).toHaveBeenCalledWith('/api/atenciones/9', { metodo: 'PUT', cuerpo: datos })
    })

    it('eliminarAtencion hace DELETE en /api/atenciones/{id}', async () => {
        await eliminarAtencion(9)
        expect(solicitar).toHaveBeenCalledWith('/api/atenciones/9', { metodo: 'DELETE' })
    })
})