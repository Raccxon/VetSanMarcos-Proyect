import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import GestionCitasPage from './GestionCitasPage'
import { listarCitas, actualizarCita, eliminarCita } from '../services/citasService'

// Se reemplazan las llamadas al backend; cuerpoCita (que solo arma un objeto) queda real
vi.mock('../services/citasService', async (original) => ({
    ...(await original()),
    listarCitas: vi.fn(),
    actualizarCita: vi.fn(),
    eliminarCita: vi.fn(),
}))

const DIA = '2030-01-15'

// Lo que devolvería GET /api/citas
const cita = (id, nombreDueno, nombreMascota, servicio, fecha, hora, estado) => ({
    id,
    mascota: { id: id + 100, nombre: nombreMascota, especie: 'Perro', dueno: { id: id + 200, nombre: nombreDueno } },
    servicio: { id: id + 300, nombre: servicio, duracion: 30, precio: 15000 },
    fecha, hora, motivo: null, estado,
})

const CITAS = [
    cita(1, 'Ana', 'Luna', 'Consulta general', DIA, '10:00', 'Pendiente'),
    cita(2, 'Pedro', 'Rocky', 'Vacunación', DIA, '09:00', 'Confirmada'),
    cita(3, 'Rosa', 'Michi', 'Consulta general', '2030-01-16', '11:00', 'Pendiente'),
]

// La página muestra solo las citas del día elegido; se elige el día de las citas de prueba
const renderPagina = async (dia = DIA) => {
    render(<GestionCitasPage />)
    await waitFor(() => expect(listarCitas).toHaveBeenCalled())
    await screen.findByLabelText('Fecha')
    await waitFor(() => expect(screen.queryByText('Cargando citas...')).not.toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: dia } })
}

beforeEach(() => {
    vi.clearAllMocks()
    listarCitas.mockResolvedValue(CITAS)
    // el backend devuelve la cita guardada con los cambios que se le enviaron
    actualizarCita.mockImplementation(async (id, cuerpo) => ({
        ...CITAS.find((c) => c.id === id),
        fecha: cuerpo.fecha, hora: cuerpo.hora, estado: cuerpo.estado,
    }))
    eliminarCita.mockResolvedValue(null)
})

describe('GestionCitasPage', () => {
    it('muestra "Cargando citas..." y luego las citas del día de todos los dueños', async () => {
        render(<GestionCitasPage />)
        expect(screen.getByText('Cargando citas...')).toBeInTheDocument()

        fireEvent.change(await screen.findByLabelText('Fecha'), { target: { value: DIA } })

        expect(await screen.findByText('Luna')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /Citas del Día/i })).toBeInTheDocument()
        expect(screen.getByText('Rocky')).toBeInTheDocument()
        expect(screen.getByText('Ana')).toBeInTheDocument()
        expect(screen.getByText('Pedro')).toBeInTheDocument()
        expect(listarCitas).toHaveBeenCalledTimes(1)
    })

    it('ordena las citas del día por hora', async () => {
        await renderPagina()
        await screen.findByText('Luna')

        const filas = screen.getAllByRole('row')
        // filas[0] es el encabezado: Rocky (09:00) va antes que Luna (10:00)
        expect(filas[1]).toHaveTextContent('Rocky')
        expect(filas[2]).toHaveTextContent('Luna')
    })

    it('no muestra las citas de otro día', async () => {
        await renderPagina('2030-01-17')

        expect(screen.queryByText('Luna')).not.toBeInTheDocument()
        expect(screen.getByText('No hay citas para el 2030-01-17.')).toBeInTheDocument()
    })

    it('si falla la carga muestra el error y no el aviso de "no hay citas"', async () => {
        listarCitas.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
        render(<GestionCitasPage />)

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar')
        expect(screen.queryByText(/No hay citas para el/)).not.toBeInTheDocument()
    })

    it('cambia el estado: envía la cita completa al backend y muestra lo que devuelve', async () => {
        await renderPagina()
        const selector = await screen.findByLabelText('Cambiar estado de la cita 1')

        fireEvent.change(selector, { target: { value: 'Confirmada' } })

        await waitFor(() => expect(selector).toHaveValue('Confirmada'))
        expect(actualizarCita).toHaveBeenCalledWith(1, {
            mascota: { id: 101 }, servicio: { id: 301 },
            fecha: DIA, hora: '10:00', motivo: null, estado: 'Confirmada',
        })
        // la otra cita no cambia
        expect(screen.getByLabelText('Cambiar estado de la cita 2')).toHaveValue('Confirmada')
        expect(actualizarCita).toHaveBeenCalledTimes(1)
    })

    it('se puede marcar una cita como Atendida', async () => {
        await renderPagina()
        const selector = await screen.findByLabelText('Cambiar estado de la cita 1')

        fireEvent.change(selector, { target: { value: 'Atendida' } })

        await waitFor(() => expect(selector).toHaveValue('Atendida'))
        expect(actualizarCita.mock.calls[0][1].estado).toBe('Atendida')
    })

    it('si el backend rechaza el cambio de estado, muestra el mensaje y la cita queda como estaba', async () => {
        actualizarCita.mockRejectedValue(new Error('Ese horario ya está ocupado'))
        await renderPagina()
        const selector = await screen.findByLabelText('Cambiar estado de la cita 1')

        fireEvent.change(selector, { target: { value: 'Confirmada' } })

        expect(await screen.findByRole('alert')).toHaveTextContent('Ese horario ya está ocupado')
        expect(screen.getByLabelText('Cambiar estado de la cita 1')).toHaveValue('Pendiente')
    })

    it('filtra las citas por estado', async () => {
        await renderPagina()
        await screen.findByText('Luna')

        fireEvent.change(screen.getByLabelText('Mostrar'), { target: { value: 'Pendiente' } })

        expect(screen.getByText('Luna')).toBeInTheDocument()
        expect(screen.queryByText('Rocky')).not.toBeInTheDocument()
    })

    it('avisa cuando no hay citas', async () => {
        listarCitas.mockResolvedValue([])
        await renderPagina()

        expect(await screen.findByRole('alert')).toHaveTextContent(`No hay citas para el ${DIA}.`)
    })

    it('elimina la cita en el backend y la saca de la lista', async () => {
        await renderPagina()
        await screen.findByText('Luna')

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar cita 1' }))

        await waitFor(() => expect(screen.queryByText('Luna')).not.toBeInTheDocument())
        expect(eliminarCita).toHaveBeenCalledWith(1)
        expect(screen.getByText('Rocky')).toBeInTheDocument()
    })

    it('si no se puede eliminar, muestra el error y la cita sigue en la lista', async () => {
        eliminarCita.mockRejectedValue(new Error('No tienes permiso para esta acción'))
        await renderPagina()
        await screen.findByText('Luna')

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar cita 1' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.getByText('Luna')).toBeInTheDocument()
    })

    it('reagenda la cita con nueva fecha y hora, y queda como Reagendada', async () => {
        await renderPagina()
        await screen.findByText('Luna')

        fireEvent.click(screen.getByRole('button', { name: 'Reagendar cita 1' }))
        fireEvent.change(screen.getByLabelText('Nueva fecha de la cita 1'), { target: { value: '2030-01-22' } })
        fireEvent.change(screen.getByLabelText('Nuevo horario de la cita 1'), { target: { value: '16:00' } })
        fireEvent.click(screen.getByRole('button', { name: 'Guardar reagendamiento de la cita 1' }))

        // la cita sale del día original...
        await waitFor(() => expect(screen.queryByText('Luna')).not.toBeInTheDocument())
        expect(actualizarCita).toHaveBeenCalledWith(1, {
            mascota: { id: 101 }, servicio: { id: 301 },
            fecha: '2030-01-22', hora: '16:00', motivo: null, estado: 'Reagendada',
        })

        // ...y aparece en el día nuevo, con la hora elegida y estado Reagendada
        fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2030-01-22' } })
        expect(screen.getByText('Luna')).toBeInTheDocument()
        expect(screen.getByText('16:00')).toBeInTheDocument()
        expect(screen.getByLabelText('Cambiar estado de la cita 1')).toHaveValue('Reagendada')
    })

    it('si el backend rechaza el reagendamiento (ej. hora ocupada), muestra el mensaje y no cambia la cita', async () => {
        actualizarCita.mockRejectedValue(new Error('Ese horario ya está ocupado'))
        await renderPagina()
        await screen.findByText('Luna')

        fireEvent.click(screen.getByRole('button', { name: 'Reagendar cita 1' }))
        fireEvent.change(screen.getByLabelText('Nuevo horario de la cita 1'), { target: { value: '09:00' } })
        fireEvent.click(screen.getByRole('button', { name: 'Guardar reagendamiento de la cita 1' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('Ese horario ya está ocupado')
        // el formulario sigue abierto para elegir otra hora
        expect(screen.getByRole('button', { name: 'Guardar reagendamiento de la cita 1' })).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
        expect(screen.getByLabelText('Cambiar estado de la cita 1')).toHaveValue('Pendiente')
    })

    it('no reagenda con una fecha pasada: ni siquiera llama al backend', async () => {
        await renderPagina()
        await screen.findByText('Luna')

        fireEvent.click(screen.getByRole('button', { name: 'Reagendar cita 1' }))
        fireEvent.change(screen.getByLabelText('Nueva fecha de la cita 1'), { target: { value: '2020-01-01' } })
        fireEvent.click(screen.getByRole('button', { name: 'Guardar reagendamiento de la cita 1' }))

        expect(screen.getByRole('alert')).toHaveTextContent('La fecha no puede ser anterior a hoy')
        expect(actualizarCita).not.toHaveBeenCalled()
    })

    it('los horarios para reagendar son los bloques de media hora del backend (sin colación)', async () => {
        await renderPagina()
        await screen.findByText('Luna')

        fireEvent.click(screen.getByRole('button', { name: 'Reagendar cita 1' }))

        expect(screen.getByRole('option', { name: '09:30 hrs' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: '17:00 hrs' })).toBeInTheDocument()
        expect(screen.queryByRole('option', { name: '13:00 hrs' })).not.toBeInTheDocument()
    })

    it('cancelar el reagendamiento no cambia la cita', async () => {
        await renderPagina()
        await screen.findByText('Luna')

        fireEvent.click(screen.getByRole('button', { name: 'Reagendar cita 1' }))
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

        expect(screen.getByRole('button', { name: 'Reagendar cita 1' })).toBeInTheDocument()
        expect(screen.getByLabelText('Cambiar estado de la cita 1')).toHaveValue('Pendiente')
        expect(actualizarCita).not.toHaveBeenCalled()
    })
})