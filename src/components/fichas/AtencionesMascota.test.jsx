import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AtencionesMascota from './AtencionesMascota'
import {
    listarAtenciones,
    crearAtencion,
    actualizarAtencion,
    eliminarAtencion,
} from '../../services/atencionService'

// Se reemplazan las llamadas al backend: el test no necesita el servidor encendido
vi.mock('../../services/atencionService', () => ({
    listarAtenciones: vi.fn(),
    crearAtencion: vi.fn(),
    actualizarAtencion: vi.fn(),
    eliminarAtencion: vi.fn(),
}))

// Lo que devolvería GET /api/mascotas/5/atenciones
const RECIENTE = { id: 1, fecha: '2026-11-15', motivo: 'Cojera', diagnostico: 'Esguince leve', tratamiento: 'Reposo 7 días' }
const ANTIGUA = { id: 2, fecha: '2026-02-10', motivo: 'Control anual', diagnostico: null, tratamiento: null }

const renderBloque = async (props = {}) => {
    render(<AtencionesMascota mascotaId={5} {...props} />)
    await waitFor(() => expect(screen.queryByText('Cargando atenciones...')).not.toBeInTheDocument())
}

const escribir = (etiqueta, valor) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

const registrar = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar atención' }))

beforeEach(() => {
    vi.clearAllMocks()
    listarAtenciones.mockResolvedValue([ANTIGUA, RECIENTE])
    crearAtencion.mockImplementation(async (mascotaId, datos) => ({ id: 10, ...datos }))
    actualizarAtencion.mockImplementation(async (id, datos) => ({ id, ...datos }))
    eliminarAtencion.mockResolvedValue(null)
})

describe('AtencionesMascota', () => {
    it('pide al backend el historial de la mascota, de la más reciente a la más antigua', async () => {
        await renderBloque()

        expect(listarAtenciones).toHaveBeenCalledWith(5)
        const filas = screen.getAllByRole('row')
        // filas[0] es el encabezado
        expect(filas[1]).toHaveTextContent('Cojera')
        expect(filas[2]).toHaveTextContent('Control anual')
    })

    it('un diagnóstico o tratamiento vacío se muestra como guion', async () => {
        await renderBloque()

        expect(screen.getByText('Control anual').closest('tr')).toHaveTextContent('—')
        expect(screen.getByText('Esguince leve')).toBeInTheDocument()
    })

    it('avisa cuando no hay atenciones', async () => {
        listarAtenciones.mockResolvedValue([])
        await renderBloque()

        expect(screen.getByText('Sin atenciones registradas.')).toBeInTheDocument()
    })

    it('si falla la carga muestra el error y no el aviso de "sin atenciones"', async () => {
        listarAtenciones.mockRejectedValue(new Error('No tienes permiso para acceder a esta mascota'))
        await renderBloque()

        expect(screen.getByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.queryByText('Sin atenciones registradas.')).not.toBeInTheDocument()
    })

    it('registra una atención: la envía al backend, la agrega a la lista y limpia el formulario', async () => {
        listarAtenciones.mockResolvedValue([])
        await renderBloque()

        escribir('Fecha de la atención', '2026-11-18')
        escribir('Motivo', '  Vómitos ')
        escribir('Diagnóstico', 'Gastritis')
        escribir('Tratamiento', 'Dieta blanda')
        registrar()

        expect(await screen.findByText('Vómitos')).toBeInTheDocument()
        expect(crearAtencion).toHaveBeenCalledWith(5, {
            fecha: '2026-11-18', motivo: 'Vómitos', diagnostico: 'Gastritis', tratamiento: 'Dieta blanda',
        })
        expect(screen.getByLabelText('Motivo')).toHaveValue('')
    })

    it('diagnóstico y tratamiento son opcionales: se envían como null', async () => {
        listarAtenciones.mockResolvedValue([])
        await renderBloque()

        escribir('Fecha de la atención', '2026-11-18')
        escribir('Motivo', 'Control')
        registrar()

        await screen.findByText('Control')
        expect(crearAtencion.mock.calls[0][1]).toMatchObject({ diagnostico: null, tratamiento: null })
    })

    it('valida el formulario antes de llamar al backend', async () => {
        await renderBloque()

        registrar()
        expect(screen.getByRole('alert')).toHaveTextContent('La fecha de la atención es obligatoria')

        escribir('Fecha de la atención', '2999-01-01')
        registrar()
        expect(screen.getByRole('alert')).toHaveTextContent('no puede ser futura')

        escribir('Fecha de la atención', '2026-11-18')
        registrar()
        expect(screen.getByRole('alert')).toHaveTextContent('El motivo es obligatorio')

        expect(crearAtencion).not.toHaveBeenCalled()
    })

    it('si el backend rechaza la atención, muestra su mensaje y no la agrega', async () => {
        crearAtencion.mockRejectedValue(new Error('Solo el personal puede modificar la ficha clínica'))
        await renderBloque()

        escribir('Fecha de la atención', '2026-11-18')
        escribir('Motivo', 'Control')
        registrar()

        expect(await screen.findByRole('alert')).toHaveTextContent('Solo el personal')
        expect(screen.queryByText('Control')).not.toBeInTheDocument()
    })

    it('edita una atención: carga sus datos, la guarda en el backend y la actualiza en la lista', async () => {
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Editar atención del 2026-02-10' }))
        expect(screen.getByLabelText('Motivo')).toHaveValue('Control anual')
        expect(screen.getByLabelText('Diagnóstico')).toHaveValue('')

        escribir('Diagnóstico', 'Sana')
        fireEvent.click(screen.getByRole('button', { name: 'Guardar atención' }))

        expect(await screen.findByText('Sana')).toBeInTheDocument()
        expect(actualizarAtencion).toHaveBeenCalledWith(2, {
            fecha: '2026-02-10', motivo: 'Control anual', diagnostico: 'Sana', tratamiento: null,
        })
        expect(crearAtencion).not.toHaveBeenCalled()
    })

    it('cancelar la edición vuelve al formulario de registro', async () => {
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Editar atención del 2026-02-10' }))
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición de atención' }))

        expect(screen.getByRole('button', { name: 'Registrar atención' })).toBeInTheDocument()
        expect(screen.getByLabelText('Motivo')).toHaveValue('')
        expect(actualizarAtencion).not.toHaveBeenCalled()
    })

    it('elimina una atención en el backend cuando se confirma', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar atención del 2026-02-10' }))

        await waitFor(() => expect(screen.queryByText('Control anual')).not.toBeInTheDocument())
        expect(eliminarAtencion).toHaveBeenCalledWith(2)
        expect(screen.getByText('Cojera')).toBeInTheDocument()
    })

    it('no elimina si se cancela la confirmación', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar atención del 2026-02-10' }))

        expect(eliminarAtencion).not.toHaveBeenCalled()
        expect(screen.getByText('Control anual')).toBeInTheDocument()
    })

    it('si el backend no deja eliminar, muestra el error y mantiene la fila', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        eliminarAtencion.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar atención del 2026-02-10' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.getByText('Control anual')).toBeInTheDocument()
    })

    it('en modo solo lectura muestra el historial pero sin formulario ni botones', async () => {
        await renderBloque({ soloLectura: true })

        expect(screen.getByText('Cojera')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Motivo')).not.toBeInTheDocument()
    })
})