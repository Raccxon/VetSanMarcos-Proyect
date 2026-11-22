import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import HistorialPage from './HistorialPage'
import { listarMascotas, listarMisMascotas } from '../services/mascotaService'
import { listarCitas, listarMisCitas } from '../services/citasService'
import { listarVacunas } from '../services/vacunaService'
import { listarAtenciones } from '../services/atencionService'

// Se reemplazan las llamadas al backend: el test no necesita el servidor encendido
vi.mock('../services/mascotaService', () => ({ listarMascotas: vi.fn(), listarMisMascotas: vi.fn() }))
vi.mock('../services/citasService', () => ({ listarCitas: vi.fn(), listarMisCitas: vi.fn() }))
vi.mock('../services/vacunaService', () => ({
    listarVacunas: vi.fn(), crearVacuna: vi.fn(), actualizarVacuna: vi.fn(), eliminarVacuna: vi.fn(),
}))
vi.mock('../services/atencionService', () => ({
    listarAtenciones: vi.fn(), crearAtencion: vi.fn(), actualizarAtencion: vi.fn(), eliminarAtencion: vi.fn(),
}))

// Lo que devolvería el backend
const ANA = { id: 4, nombre: 'Ana Pérez', rut: '11111111-1', telefono: '+56911111111', rol: 'cliente' }
const PEDRO = { id: 5, nombre: 'Pedro Soto', rut: '22222222-2', telefono: null, rol: 'cliente' }
const FIRULAIS = { id: 3, nombre: 'Firulais', especie: 'Perro', raza: 'Quiltro', edad: 3, chip: '985112003456789', dueno: ANA }
const MICHI = { id: 6, nombre: 'Michi', especie: 'Gato', raza: 'Siamés', edad: 2, chip: null, dueno: PEDRO }

const CONSULTA = { id: 1, nombre: 'Consulta general', categoria: 'Consultas y Urgencias' }
const VACUNA = { id: 2, nombre: 'Vacuna antirrábica canina', categoria: 'Vacunación' }

const CITA_ANA_1 = { id: 10, fecha: '2026-10-20', hora: '10:00', estado: 'Pendiente', motivo: 'x', mascota: FIRULAIS, servicio: CONSULTA }
const CITA_ANA_2 = { id: 11, fecha: '2026-10-22', hora: '11:00', estado: 'Confirmada', motivo: 'x', mascota: FIRULAIS, servicio: VACUNA }
const CITA_PEDRO = { id: 12, fecha: '2026-10-23', hora: '09:00', estado: 'Atendida', motivo: 'x', mascota: MICHI, servicio: CONSULTA }

const iniciarSesion = (rol) =>
    localStorage.setItem('userSession', JSON.stringify({ email: 'x@x.cl', rol, nombre: 'Prueba' }))

const renderComoStaff = async () => {
    iniciarSesion('recepcion')
    render(<HistorialPage />)
    await waitFor(() => expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument())
}

const renderComoCliente = async () => {
    iniciarSesion('cliente')
    render(<HistorialPage />)
    await waitFor(() => expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument())
}

const buscar = (rut) => {
    fireEvent.change(screen.getByLabelText('RUT del dueño'), { target: { value: rut } })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
}

beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    listarMascotas.mockResolvedValue([FIRULAIS, MICHI])
    listarCitas.mockResolvedValue([CITA_ANA_1, CITA_ANA_2, CITA_PEDRO])
    listarMisMascotas.mockResolvedValue([FIRULAIS])
    listarMisCitas.mockResolvedValue([CITA_ANA_1, CITA_ANA_2])
    listarVacunas.mockResolvedValue([
        { id: 1, nombre: 'Antirrábica', fechaAplicacion: '2026-01-10', fechaVencimiento: '2099-01-10' },
    ])
    listarAtenciones.mockResolvedValue([
        { id: 1, fecha: '2026-02-10', motivo: 'Control anual', diagnostico: 'Sano', tratamiento: null },
    ])
})

describe('HistorialPage como recepción', () => {
    it('pide al backend todas las mascotas y citas, no las "mías"', async () => {
        await renderComoStaff()

        expect(listarMascotas).toHaveBeenCalledTimes(1)
        expect(listarCitas).toHaveBeenCalledTimes(1)
        expect(listarMisMascotas).not.toHaveBeenCalled()
        expect(listarMisCitas).not.toHaveBeenCalled()
    })

    it('no muestra ninguna ficha hasta que busca un RUT', async () => {
        await renderComoStaff()

        expect(screen.getByRole('heading', { level: 1, name: 'Historial y Control' })).toBeInTheDocument()
        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('muestra la ficha, vacunas, atenciones y reservas del dueño buscado, y nada de otros', async () => {
        await renderComoStaff()

        buscar('11111111-1')

        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
        expect(screen.getByText(/985112003456789/)).toBeInTheDocument()
        expect(await screen.findByText('Antirrábica')).toBeInTheDocument()
        expect(await screen.findByText('Control anual')).toBeInTheDocument()
        expect(listarVacunas).toHaveBeenCalledWith(3)
        expect(screen.getByText('Reservas (2)')).toBeInTheDocument()
        expect(screen.queryByText(/Michi/)).not.toBeInTheDocument()
        expect(listarVacunas).not.toHaveBeenCalledWith(6)
    })

    it('las vacunas y atenciones se muestran en solo lectura (sin formularios ni botones de edición)', async () => {
        await renderComoStaff()

        buscar('11111111-1')
        await screen.findByText('Antirrábica')

        expect(screen.queryByRole('button', { name: /Registrar/ })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument()
    })

    it('encuentra al dueño aunque el RUT tenga puntos y espacios', async () => {
        await renderComoStaff()

        buscar('  11.111.111-1  ')

        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
    })

    it('muestra un error con un RUT que no existe', async () => {
        await renderComoStaff()

        buscar('99999999-9')

        expect(screen.getByRole('alert')).toHaveTextContent('No se encontraron registros')
        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
    })

    it('pide ingresar un RUT si se busca con el campo vacío', async () => {
        await renderComoStaff()

        buscar('   ')

        expect(screen.getByRole('alert')).toHaveTextContent('Ingresa el RUT del dueño')
        expect(screen.queryByText(/No se encontraron registros/)).not.toBeInTheDocument()
    })

    it('al buscar otro RUT reemplaza la ficha anterior', async () => {
        await renderComoStaff()

        buscar('11111111-1')
        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
        buscar('22222222-2')

        expect(screen.getByText('Ficha del Paciente: Michi')).toBeInTheDocument()
        expect(screen.queryByText('Ficha del Paciente: Firulais')).not.toBeInTheDocument()
        expect(screen.getByText('Reservas (1)')).toBeInTheDocument()
    })

    it('una mascota sin chip muestra un guion', async () => {
        await renderComoStaff()

        buscar('22222222-2')

        expect(screen.getByText(/N° Microchip:/).parentElement).toHaveTextContent('—')
    })

    it('filtra las reservas por categoría y oculta los bloques que no corresponden', async () => {
        await renderComoStaff()
        buscar('11111111-1')
        await screen.findByText('Antirrábica')

        fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Vacunación' } })

        expect(screen.getByText('Reservas (1)')).toBeInTheDocument()
        const tabla = screen.getAllByRole('table').at(-1)
        expect(within(tabla).getByText('Vacuna antirrábica canina')).toBeInTheDocument()
        expect(within(tabla).queryByText('Consulta general')).not.toBeInTheDocument()
        expect(screen.getByText('Antirrábica')).toBeInTheDocument()
        expect(screen.queryByText('Control anual')).not.toBeInTheDocument()

        fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Consultas y Urgencias' } })

        expect(screen.queryByText('Antirrábica')).not.toBeInTheDocument()
        expect(await screen.findByText('Control anual')).toBeInTheDocument()
    })

    it('ordena las reservas de la más reciente a la más antigua', async () => {
        await renderComoStaff()

        buscar('11111111-1')
        await screen.findByText('Antirrábica')

        const tabla = screen.getAllByRole('table').at(-1)
        const filas = within(tabla).getAllByRole('row')
        expect(filas[1]).toHaveTextContent('2026-10-22')
        expect(filas[2]).toHaveTextContent('2026-10-20')
    })

    it('si falla la carga muestra el error', async () => {
        listarMascotas.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
        iniciarSesion('recepcion')
        render(<HistorialPage />)

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
    })
})

describe('HistorialPage como cliente', () => {
    it('pide solo sus mascotas y citas', async () => {
        await renderComoCliente()

        expect(listarMisMascotas).toHaveBeenCalledTimes(1)
        expect(listarMisCitas).toHaveBeenCalledTimes(1)
        expect(listarMascotas).not.toHaveBeenCalled()
        expect(listarCitas).not.toHaveBeenCalled()
    })

    it('ve automáticamente la ficha de su mascota, sin buscador de RUT', async () => {
        await renderComoCliente()

        expect(screen.getByRole('heading', { level: 1, name: 'Mi Historial' })).toBeInTheDocument()
        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
        expect(screen.queryByLabelText('RUT del dueño')).not.toBeInTheDocument()
        expect(await screen.findByText('Antirrábica')).toBeInTheDocument()
        expect(screen.getByText('Reservas (2)')).toBeInTheDocument()
    })

    it('no puede registrar ni editar vacunas o atenciones', async () => {
        await renderComoCliente()
        await screen.findByText('Antirrábica')

        expect(screen.queryByRole('button', { name: /Registrar/ })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument()
    })

    it('si no tiene registros lo avisa', async () => {
        listarMisMascotas.mockResolvedValue([])
        listarMisCitas.mockResolvedValue([])
        await renderComoCliente()

        expect(screen.getByRole('alert')).toHaveTextContent('Aún no tienes registros.')
    })
})