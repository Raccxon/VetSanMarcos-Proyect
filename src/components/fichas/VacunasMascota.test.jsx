import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import VacunasMascota from './VacunasMascota'
import { listarVacunas, crearVacuna, actualizarVacuna, eliminarVacuna } from '../../services/vacunaService'

// Se reemplazan las llamadas al backend: el test no necesita el servidor encendido
vi.mock('../../services/vacunaService', () => ({
    listarVacunas: vi.fn(),
    crearVacuna: vi.fn(),
    actualizarVacuna: vi.fn(),
    eliminarVacuna: vi.fn(),
}))

// Lo que devolvería GET /api/mascotas/5/vacunas
const VIGENTE = { id: 1, nombre: 'Antirrábica', fechaAplicacion: '2026-01-10', fechaVencimiento: '2099-01-10' }
const VENCIDA = { id: 2, nombre: 'Sextuple', fechaAplicacion: '2020-01-01', fechaVencimiento: '2021-01-01' }
const SIN_FECHA = { id: 3, nombre: 'Leptospirosis', fechaAplicacion: '2025-06-01', fechaVencimiento: null }

const renderBloque = async (props = {}) => {
    render(<VacunasMascota mascotaId={5} {...props} />)
    await waitFor(() => expect(screen.queryByText('Cargando vacunas...')).not.toBeInTheDocument())
}

const escribir = (etiqueta, valor) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

const registrar = () => fireEvent.click(screen.getByRole('button', { name: 'Registrar vacuna' }))

beforeEach(() => {
    vi.clearAllMocks()
    listarVacunas.mockResolvedValue([VIGENTE, VENCIDA, SIN_FECHA])
    crearVacuna.mockImplementation(async (mascotaId, datos) => ({ id: 10, ...datos }))
    actualizarVacuna.mockImplementation(async (id, datos) => ({ id, ...datos }))
    eliminarVacuna.mockResolvedValue(null)
})

describe('VacunasMascota', () => {
    it('pide al backend las vacunas de la mascota y las lista con su estado', async () => {
        await renderBloque()

        expect(listarVacunas).toHaveBeenCalledWith(5)
        expect(screen.getByText('Antirrábica').closest('tr')).toHaveTextContent('Vigente')
        expect(screen.getByText('Sextuple').closest('tr')).toHaveTextContent('Vencida')
        expect(screen.getByText('Leptospirosis').closest('tr')).toHaveTextContent('Sin fecha')
    })

    it('las lista de la más reciente a la más antigua', async () => {
        await renderBloque()

        const filas = screen.getAllByRole('row')
        // filas[0] es el encabezado
        expect(filas[1]).toHaveTextContent('Antirrábica')
        expect(filas[2]).toHaveTextContent('Leptospirosis')
        expect(filas[3]).toHaveTextContent('Sextuple')
    })

    it('avisa cuando no hay vacunas', async () => {
        listarVacunas.mockResolvedValue([])
        await renderBloque()

        expect(screen.getByText('Sin vacunas registradas.')).toBeInTheDocument()
    })

    it('si falla la carga muestra el error y no el aviso de "sin vacunas"', async () => {
        listarVacunas.mockRejectedValue(new Error('No tienes permiso para acceder a esta mascota'))
        await renderBloque()

        expect(screen.getByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.queryByText('Sin vacunas registradas.')).not.toBeInTheDocument()
    })

    it('registra una vacuna: la envía al backend, la agrega a la lista y limpia el formulario', async () => {
        listarVacunas.mockResolvedValue([])
        await renderBloque()

        escribir('Vacuna', '  Triple felina ')
        escribir('Fecha de aplicación', '2026-11-10')
        escribir('Fecha de vencimiento (opcional)', '2027-11-10')
        registrar()

        expect(await screen.findByText('Triple felina')).toBeInTheDocument()
        expect(crearVacuna).toHaveBeenCalledWith(5, {
            nombre: 'Triple felina', fechaAplicacion: '2026-11-10', fechaVencimiento: '2027-11-10',
        })
        expect(screen.getByLabelText('Vacuna')).toHaveValue('')
    })

    it('el vencimiento es opcional: se envía como null', async () => {
        listarVacunas.mockResolvedValue([])
        await renderBloque()

        escribir('Vacuna', 'Rabia')
        escribir('Fecha de aplicación', '2026-11-10')
        registrar()

        await screen.findByText('Rabia')
        expect(crearVacuna.mock.calls[0][1].fechaVencimiento).toBeNull()
    })

    it('valida el formulario antes de llamar al backend', async () => {
        await renderBloque()

        registrar()
        expect(screen.getByRole('alert')).toHaveTextContent('El nombre de la vacuna es obligatorio')

        escribir('Vacuna', 'Rabia')
        registrar()
        expect(screen.getByRole('alert')).toHaveTextContent('La fecha de aplicación es obligatoria')

        escribir('Fecha de aplicación', '2999-01-01')
        registrar()
        expect(screen.getByRole('alert')).toHaveTextContent('no puede ser futura')

        escribir('Fecha de aplicación', '2026-11-10')
        escribir('Fecha de vencimiento (opcional)', '2026-11-01')
        registrar()
        expect(screen.getByRole('alert')).toHaveTextContent('El vencimiento no puede ser anterior')

        expect(crearVacuna).not.toHaveBeenCalled()
    })

    it('si el backend rechaza la vacuna, muestra su mensaje y no la agrega', async () => {
        crearVacuna.mockRejectedValue(new Error('Solo el personal puede modificar la ficha clínica'))
        await renderBloque()

        escribir('Vacuna', 'Rabia')
        escribir('Fecha de aplicación', '2026-11-10')
        registrar()

        expect(await screen.findByRole('alert')).toHaveTextContent('Solo el personal')
        expect(screen.queryByText('Rabia')).not.toBeInTheDocument()
    })

    it('edita una vacuna: carga sus datos, la guarda en el backend y la actualiza en la lista', async () => {
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Editar vacuna Sextuple' }))
        expect(screen.getByLabelText('Vacuna')).toHaveValue('Sextuple')
        expect(screen.getByLabelText('Fecha de aplicación')).toHaveValue('2020-01-01')

        escribir('Vacuna', 'Sextuple canina')
        fireEvent.click(screen.getByRole('button', { name: 'Guardar vacuna' }))

        expect(await screen.findByText('Sextuple canina')).toBeInTheDocument()
        expect(actualizarVacuna).toHaveBeenCalledWith(2, {
            nombre: 'Sextuple canina', fechaAplicacion: '2020-01-01', fechaVencimiento: '2021-01-01',
        })
        expect(screen.queryByText('Sextuple')).not.toBeInTheDocument()
        expect(crearVacuna).not.toHaveBeenCalled()
    })

    it('cancelar la edición vuelve al formulario de registro', async () => {
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Editar vacuna Sextuple' }))
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición de vacuna' }))

        expect(screen.getByRole('button', { name: 'Registrar vacuna' })).toBeInTheDocument()
        expect(screen.getByLabelText('Vacuna')).toHaveValue('')
        expect(actualizarVacuna).not.toHaveBeenCalled()
    })

    it('elimina una vacuna en el backend cuando se confirma', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar vacuna Sextuple' }))

        await waitFor(() => expect(screen.queryByText('Sextuple')).not.toBeInTheDocument())
        expect(eliminarVacuna).toHaveBeenCalledWith(2)
        expect(screen.getByText('Antirrábica')).toBeInTheDocument()
    })

    it('no elimina si se cancela la confirmación', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar vacuna Sextuple' }))

        expect(eliminarVacuna).not.toHaveBeenCalled()
        expect(screen.getByText('Sextuple')).toBeInTheDocument()
    })

    it('si el backend no deja eliminar, muestra el error y mantiene la fila', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        eliminarVacuna.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
        await renderBloque()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar vacuna Sextuple' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.getByText('Sextuple')).toBeInTheDocument()
    })

    it('en modo solo lectura muestra las vacunas pero sin formulario ni botones', async () => {
        await renderBloque({ soloLectura: true })

        expect(screen.getByText('Antirrábica')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Vacuna')).not.toBeInTheDocument()
        expect(within(screen.getByRole('table')).queryByText('Acciones')).not.toBeInTheDocument()
    })
})