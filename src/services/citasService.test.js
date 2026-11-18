import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    listarMisCitas, listarCitas, crearCita, actualizarCita,
    eliminarCita, horasOcupadas, cuerpoCita,
} from './citasService'
import { solicitar } from './api'

// Se reemplaza solicitar para comprobar a qué ruta se llama
vi.mock('./api', () => ({
    solicitar: vi.fn()
}))

// Así llega una cita desde el backend: mascota y servicio vienen anidados
const citaBackend = {
    id: 7,
    mascota: { id: 3, nombre: 'Rex', dueno: { id: 4, nombre: 'Ana' } },
    servicio: { id: 1, nombre: 'Consulta general', duracion: 30 },
    fecha: '2026-12-11',
    hora: '10:00',
    motivo: 'Control',
    estado: 'Pendiente',
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('citasService', () => {
    it('listarMisCitas pide GET /api/citas/mias', async () => {
        solicitar.mockResolvedValue([citaBackend])

        await expect(listarMisCitas()).resolves.toEqual([citaBackend])
        expect(solicitar).toHaveBeenCalledWith('/api/citas/mias')
    })

    it('listarCitas pide GET /api/citas', async () => {
        await listarCitas()
        expect(solicitar).toHaveBeenCalledWith('/api/citas')
    })

    it('crearCita hace POST /api/citas', async () => {
        const datos = { mascota: { id: 3 }, servicio: { id: 1 }, fecha: '2026-12-11', hora: '10:00' }
        await crearCita(datos)
        expect(solicitar).toHaveBeenCalledWith('/api/citas', { metodo: 'POST', cuerpo: datos })
    })

    it('actualizarCita hace PUT /api/citas/{id}', async () => {
        await actualizarCita(7, { estado: 'Cancelada' })
        expect(solicitar).toHaveBeenCalledWith('/api/citas/7', { metodo: 'PUT', cuerpo: { estado: 'Cancelada' } })
    })

    it('eliminarCita hace DELETE /api/citas/{id}', async () => {
        await eliminarCita(7)
        expect(solicitar).toHaveBeenCalledWith('/api/citas/7', { metodo: 'DELETE' })
    })

    it('horasOcupadas pide GET /api/citas/ocupadas con la fecha', async () => {
        solicitar.mockResolvedValue([{ hora: '10:00', duracion: 30 }])

        await expect(horasOcupadas('2026-12-11')).resolves.toEqual([{ hora: '10:00', duracion: 30 }])
        expect(solicitar).toHaveBeenCalledWith('/api/citas/ocupadas?fecha=2026-12-11')
    })
})

describe('cuerpoCita', () => {
    it('arma el cuerpo que pide el backend: solo los ids de mascota y servicio', () => {
        expect(cuerpoCita(citaBackend)).toEqual({
            mascota: { id: 3 },
            servicio: { id: 1 },
            fecha: '2026-12-11',
            hora: '10:00',
            motivo: 'Control',
            estado: 'Pendiente',
        })
    })

    it('cambia solo lo indicado y deja el resto igual', () => {
        const cuerpo = cuerpoCita(citaBackend, { estado: 'Cancelada' })

        expect(cuerpo.estado).toBe('Cancelada')
        expect(cuerpo.fecha).toBe('2026-12-11')
        expect(cuerpo.hora).toBe('10:00')
    })
})