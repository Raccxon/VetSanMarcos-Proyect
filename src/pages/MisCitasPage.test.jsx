import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MisCitasPage from './MisCitasPage'
import { listarMisCitas, actualizarCita } from '../services/citasService'

// Se reemplaza el servicio de citas (el test no necesita el backend encendido),
// pero cuerpoCita se deja real para comprobar lo que se envía
vi.mock('../services/citasService', async (importOriginal) => ({
    ...(await importOriginal()),
    listarMisCitas: vi.fn(),
    actualizarCita: vi.fn(),
}))

// Lo que devolvería GET /api/citas/mias
const CITAS_BACKEND = [
    {
        id: 1,
        mascota: { id: 3, nombre: 'Luna' },
        servicio: { id: 1, nombre: 'Consulta general' },
        fecha: '2026-12-11', hora: '10:00', motivo: 'Control', estado: 'Pendiente',
    },
    {
        id: 2,
        mascota: { id: 3, nombre: 'Luna' },
        servicio: { id: 2, nombre: 'Vacuna sextuple canina' },
        fecha: '2026-12-12', hora: '11:00', motivo: null, estado: 'Confirmada',
    },
]

const renderPagina = () =>
    render(
        <MemoryRouter>
            <MisCitasPage />
        </MemoryRouter>
    )

beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('userSession',
        JSON.stringify({ email: 'ana@correo.cl', rol: 'cliente', nombre: 'Ana' }))
    listarMisCitas.mockResolvedValue(CITAS_BACKEND)
})

describe('MisCitasPage', () => {
    it('muestra "Cargando" y luego las citas que entrega el backend', async () => {
        renderPagina()

        expect(screen.getByText(/Cargando tus citas/i)).toBeInTheDocument()

        expect(await screen.findByText('Consulta general')).toBeInTheDocument()
        expect(screen.getByText('Vacuna sextuple canina')).toBeInTheDocument()
        expect(listarMisCitas).toHaveBeenCalledTimes(1)
    })

    it('muestra el estado de cada cita', async () => {
        renderPagina()

        expect(await screen.findByText('Pendiente')).toBeInTheDocument()
        expect(screen.getByText('Confirmada')).toBeInTheDocument()
    })

    it('avisa cuando el dueño no tiene citas', async () => {
        listarMisCitas.mockResolvedValue([])
        renderPagina()

        expect(await screen.findByText(/Aun no tienes citas/i)).toBeInTheDocument()
    })

    it('si el backend falla al cargar, muestra el error', async () => {
        listarMisCitas.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
        renderPagina()

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar')
    })

    it('cancelar una cita reenvía la cita completa con estado Cancelada y actualiza la tarjeta', async () => {
        actualizarCita.mockResolvedValue({ ...CITAS_BACKEND[0], estado: 'Cancelada' })
        renderPagina()

        fireEvent.click(await screen.findByRole('button', { name: 'Cancelar cita 1' }))

        expect(await screen.findByText('Cancelada')).toBeInTheDocument()
        expect(actualizarCita).toHaveBeenCalledWith(1, {
            mascota: { id: 3 },
            servicio: { id: 1 },
            fecha: '2026-12-11',
            hora: '10:00',
            motivo: 'Control',
            estado: 'Cancelada',
        })
        // la cita cancelada ya no ofrece el botón; la otra sí
        expect(screen.queryByRole('button', { name: 'Cancelar cita 1' })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancelar cita 2' })).toBeInTheDocument()
    })

    it('si el backend rechaza la cancelación, muestra su mensaje y no cambia la cita', async () => {
        actualizarCita.mockRejectedValue(new Error('No tienes permiso para acceder a esta cita'))
        renderPagina()

        fireEvent.click(await screen.findByRole('button', { name: 'Cancelar cita 1' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })
})