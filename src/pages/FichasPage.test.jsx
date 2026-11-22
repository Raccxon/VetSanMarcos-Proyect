import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import FichasPage from './FichasPage'
import { listarMascotas, actualizarMascota } from '../services/mascotaService'
import { listarVacunas } from '../services/vacunaService'
import { listarAtenciones } from '../services/atencionService'

// Se reemplazan las llamadas al backend: el test no necesita el servidor encendido
vi.mock('../services/mascotaService', () => ({ listarMascotas: vi.fn(), actualizarMascota: vi.fn() }))
vi.mock('../services/vacunaService', () => ({
    listarVacunas: vi.fn(), crearVacuna: vi.fn(), actualizarVacuna: vi.fn(), eliminarVacuna: vi.fn(),
}))
vi.mock('../services/atencionService', () => ({
    listarAtenciones: vi.fn(), crearAtencion: vi.fn(), actualizarAtencion: vi.fn(), eliminarAtencion: vi.fn(),
}))

// Lo que devolvería GET /api/mascotas
const ANA = { id: 4, nombre: 'Ana Pérez', rut: '11111111-1', telefono: '+56911111111', rol: 'cliente' }
const PEDRO = { id: 5, nombre: 'Pedro Soto', rut: null, telefono: null, rol: 'cliente' }
const MASCOTAS = [
    { id: 3, nombre: 'Firulais', especie: 'Perro', raza: 'Quiltro', edad: 3, chip: '985112003456789', dueno: ANA },
    { id: 6, nombre: 'Michi', especie: 'Gato', raza: 'Siamés', edad: 2, chip: null, dueno: PEDRO },
]

const renderPagina = async () => {
    render(<FichasPage />)
    await screen.findByText('Firulais (Perro)')
}

const verFicha = (nombre) => fireEvent.click(screen.getByRole('button', { name: `Ver ficha de ${nombre}` }))
const escribir = (etiqueta, valor) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })
const guardar = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar datos' }))

beforeEach(() => {
    vi.clearAllMocks()
    listarMascotas.mockResolvedValue(MASCOTAS)
    listarVacunas.mockResolvedValue([])
    listarAtenciones.mockResolvedValue([])
    actualizarMascota.mockImplementation(async (id, datos) => ({
        ...MASCOTAS.find((m) => m.id === id), ...datos,
    }))
})

describe('FichasPage', () => {
    it('lista las mascotas que entrega el backend con su dueño y RUT', async () => {
        await renderPagina()

        expect(listarMascotas).toHaveBeenCalledTimes(1)
        const fila = screen.getByText('Firulais (Perro)').closest('tr')
        expect(fila).toHaveTextContent('Ana Pérez')
        expect(fila).toHaveTextContent('11111111-1')
        expect(screen.getByText('Michi (Gato)').closest('tr')).toHaveTextContent('Sin RUT')
    })

    it('muestra "Cargando mascotas..." mientras responde el backend', async () => {
        render(<FichasPage />)
        expect(screen.getByText('Cargando mascotas...')).toBeInTheDocument()
        await screen.findByText('Firulais (Perro)')
    })

    it('si falla la carga muestra el error', async () => {
        listarMascotas.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
        render(<FichasPage />)

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.queryByText(/No se encontraron mascotas/)).not.toBeInTheDocument()
    })

    it('busca por nombre de mascota, de dueño o por RUT', async () => {
        await renderPagina()
        const buscador = screen.getByLabelText('Buscar por mascota, dueño o RUT')

        fireEvent.change(buscador, { target: { value: 'michi' } })
        expect(screen.getByText('Michi (Gato)')).toBeInTheDocument()
        expect(screen.queryByText('Firulais (Perro)')).not.toBeInTheDocument()

        fireEvent.change(buscador, { target: { value: 'ana' } })
        expect(screen.getByText('Firulais (Perro)')).toBeInTheDocument()
        expect(screen.queryByText('Michi (Gato)')).not.toBeInTheDocument()

        fireEvent.change(buscador, { target: { value: '11111111' } })
        expect(screen.getByText('Firulais (Perro)')).toBeInTheDocument()
        expect(screen.queryByText('Michi (Gato)')).not.toBeInTheDocument()
    })

    it('avisa cuando la búsqueda no encuentra nada', async () => {
        await renderPagina()

        fireEvent.change(screen.getByLabelText('Buscar por mascota, dueño o RUT'), { target: { value: 'zzz' } })

        expect(screen.getByText('No se encontraron mascotas.')).toBeInTheDocument()
    })

    it('antes de elegir una mascota pide seleccionarla y no pide vacunas ni atenciones', async () => {
        await renderPagina()

        expect(screen.getByText('Selecciona una mascota para ver su ficha.')).toBeInTheDocument()
        expect(listarVacunas).not.toHaveBeenCalled()
        expect(listarAtenciones).not.toHaveBeenCalled()
    })

    it('al elegir una mascota muestra su ficha y pide sus vacunas y atenciones', async () => {
        await renderPagina()

        verFicha('Firulais')

        expect(await screen.findByRole('heading', { name: 'Ficha de Firulais' })).toBeInTheDocument()
        expect(screen.getByLabelText('Nombre')).toHaveValue('Firulais')
        expect(screen.getByLabelText('N° de microchip')).toHaveValue('985112003456789')
        expect(screen.getByText(/Dueño:/)).toHaveTextContent('Ana Pérez')
        expect(screen.getByText(/Dueño:/)).toHaveTextContent('11111111-1')
        expect(listarVacunas).toHaveBeenCalledWith(3)
        expect(listarAtenciones).toHaveBeenCalledWith(3)
        expect(await screen.findByText('Sin vacunas registradas.')).toBeInTheDocument()
    })

    it('al cambiar de mascota la ficha muestra los datos de la nueva', async () => {
        await renderPagina()

        verFicha('Firulais')
        await screen.findByRole('heading', { name: 'Ficha de Firulais' })
        verFicha('Michi')

        expect(await screen.findByRole('heading', { name: 'Ficha de Michi' })).toBeInTheDocument()
        expect(screen.getByLabelText('Nombre')).toHaveValue('Michi')
        expect(screen.getByLabelText('N° de microchip')).toHaveValue('')
        expect(listarVacunas).toHaveBeenLastCalledWith(6)
    })

    it('guarda los datos de la mascota en el backend, con el chip y sin cambiar el dueño', async () => {
        await renderPagina()
        verFicha('Firulais')
        await screen.findByRole('heading', { name: 'Ficha de Firulais' })

        escribir('Nombre', '  Firu ')
        escribir('Edad (años)', '4')
        escribir('N° de microchip', '985112009999999')
        guardar()

        expect(await screen.findByText('Datos de la mascota actualizados.')).toBeInTheDocument()
        expect(actualizarMascota).toHaveBeenCalledWith(3, {
            nombre: 'Firu', especie: 'Perro', raza: 'Quiltro', edad: 4, chip: '985112009999999', dueno: { id: 4 },
        })
        // la tabla de la izquierda se actualiza con lo que devolvió el backend
        expect(screen.getByText('Firu (Perro)')).toBeInTheDocument()
    })

    it('un chip en blanco se envía vacío para borrarlo', async () => {
        await renderPagina()
        verFicha('Firulais')
        await screen.findByRole('heading', { name: 'Ficha de Firulais' })

        escribir('N° de microchip', '   ')
        guardar()

        await screen.findByText('Datos de la mascota actualizados.')
        expect(actualizarMascota.mock.calls[0][1].chip).toBe('')
    })

    it('valida los datos antes de llamar al backend', async () => {
        await renderPagina()
        verFicha('Firulais')
        await screen.findByRole('heading', { name: 'Ficha de Firulais' })

        escribir('Nombre', '')
        guardar()
        expect(screen.getByRole('alert')).toHaveTextContent('El nombre de la mascota es obligatorio')

        escribir('Nombre', 'Firu')
        escribir('Raza', '')
        guardar()
        expect(screen.getByRole('alert')).toHaveTextContent('La raza es obligatoria')

        escribir('Raza', 'Quiltro')
        escribir('Edad (años)', '50')
        guardar()
        expect(screen.getByRole('alert')).toHaveTextContent('La edad debe ser un número entero entre 0 y 40')

        expect(actualizarMascota).not.toHaveBeenCalled()
    })

    it('si el backend rechaza los cambios, muestra su mensaje y no actualiza la lista', async () => {
        actualizarMascota.mockRejectedValue(new Error('No tienes permiso para acceder a esta mascota'))
        await renderPagina()
        verFicha('Firulais')
        await screen.findByRole('heading', { name: 'Ficha de Firulais' })

        escribir('Nombre', 'Firu')
        guardar()

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
        await waitFor(() => expect(screen.getByText('Firulais (Perro)')).toBeInTheDocument())
        expect(screen.queryByText('Datos de la mascota actualizados.')).not.toBeInTheDocument()
    })
})