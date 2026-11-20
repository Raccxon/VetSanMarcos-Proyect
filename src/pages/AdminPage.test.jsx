import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import AdminPage from './AdminPage'
import {
    getServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
} from '../services/apiServices'
import { listarCitas, actualizarCita } from '../services/citasService'
import { listarMascotas } from '../services/mascotaService'
import { listarUsuarios } from '../services/usuarioService'

// Se reemplazan los servicios: el test no necesita el backend encendido
vi.mock('../services/apiServices', () => ({
    getServicios: vi.fn(),
    crearServicio: vi.fn(),
    actualizarServicio: vi.fn(),
    eliminarServicio: vi.fn(),
}))
vi.mock('../services/citasService', async (original) => ({
    ...(await original()),
    listarCitas: vi.fn(),
    actualizarCita: vi.fn(),
}))
vi.mock('../services/mascotaService', () => ({ listarMascotas: vi.fn() }))
vi.mock('../services/usuarioService', () => ({ listarUsuarios: vi.fn() }))

// Lo que devolvería el backend
const ANA = { id: 4, nombre: 'Ana', rut: '11111111-1', telefono: '+56911111111', rol: 'cliente' }
const PEDRO = { id: 5, nombre: 'Pedro', rut: '22222222-2', telefono: '912345678', rol: 'cliente' }
const ADMIN = { id: 1, nombre: 'Administrador', email: 'admin@sanmarcos.cl', rol: 'admin' }

const MASCOTAS = [
    { id: 3, nombre: 'Luna', especie: 'Gato', raza: 'Mestizo', edad: 2, dueno: ANA },
    { id: 6, nombre: 'Rocky', especie: 'Perro', raza: 'Labrador', edad: 4, dueno: PEDRO },
]

const SERVICIO_CONSULTA = { id: 1, nombre: 'Consulta general', duracion: 30, precio: 15000 }
const SERVICIO_VACUNA = { id: 2, nombre: 'Vacunación', duracion: 15, precio: 14000 }

const CITAS = [
    { id: 11, mascota: MASCOTAS[0], servicio: SERVICIO_CONSULTA, fecha: '2030-01-15', hora: '10:00', motivo: null, estado: 'Pendiente' },
    { id: 12, mascota: MASCOTAS[1], servicio: SERVICIO_VACUNA, fecha: '2030-01-16', hora: '11:00', motivo: null, estado: 'Confirmada' },
]

// Lo que devolvería GET /api/servicios
const SERVICIOS_BACKEND = [
    { id: 1, nombre: 'Consulta general', categoria: 'Consultas y Urgencias', especie: 'Perro / Gato', duracion: 30, precio: 15000, stock: 15 },
    { id: 2, nombre: 'Vacuna triple felina', categoria: 'Vacunación', especie: 'Gato', duracion: 15, precio: 14000, stock: 8 },
    { id: 3, nombre: 'Hemograma completo', categoria: 'Procedimientos', especie: 'Perro / Gato', duracion: 30, precio: 22000, stock: 10 },
]

// Renderiza y espera a que el backend responda con servicios, citas y clientes
const renderPanel = async () => {
    render(<AdminPage />)
    await vi.waitFor(() => {
        expect(screen.getByText('Servicios Activos').closest('.card')).toHaveTextContent('3')
        expect(screen.getByText('Citas Totales').closest('.card')).toHaveTextContent('2')
        expect(screen.getByText('Clientes Registrados').closest('.card')).toHaveTextContent('2')
    })
}

const irA = (pestania) => fireEvent.click(screen.getByRole('button', { name: pestania }))

const irAStock = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Stock y Servicios' }))
    await screen.findByText('Hemograma completo')
}

beforeEach(() => {
    vi.clearAllMocks()
    getServicios.mockResolvedValue(SERVICIOS_BACKEND)
    listarCitas.mockResolvedValue(CITAS)
    listarMascotas.mockResolvedValue(MASCOTAS)
    listarUsuarios.mockResolvedValue([ADMIN, ANA, PEDRO])
    actualizarCita.mockImplementation(async (id, cuerpo) => ({
        ...CITAS.find((c) => c.id === id), estado: cuerpo.estado,
    }))
})

describe('AdminPage', () => {
    it('muestra el dashboard con el total de citas que entrega el backend', async () => {
        await renderPanel()

        expect(screen.getByText('Panel de Control Administrativo')).toBeInTheDocument()
        expect(screen.getByText('Citas Totales').closest('.card')).toHaveTextContent('2')
        expect(listarCitas).toHaveBeenCalledTimes(1)
    })

    it('cuenta solo los usuarios con rol cliente (no el administrador)', async () => {
        await renderPanel()

        // el backend devolvió 3 usuarios: admin + 2 clientes
        expect(screen.getByText('Clientes Registrados').closest('.card')).toHaveTextContent('2')
    })

    it('el dashboard cuenta los servicios que entrega el backend', async () => {
        await renderPanel()

        expect(screen.getByText('Servicios Activos').closest('.card')).toHaveTextContent('3')
    })

    it('la pestaña Stock y Servicios lista el catálogo del backend', async () => {
        await renderPanel()
        await irAStock()

        expect(screen.getByText('Consulta general')).toBeInTheDocument()
        expect(screen.getByText('Vacuna triple felina')).toBeInTheDocument()
        expect(screen.getByLabelText('Cupos de Consulta general')).toHaveValue(15)
    })

    it('si el backend falla al cargar, muestra el error en la pestaña de servicios', async () => {
        getServicios.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
        render(<AdminPage />)

        fireEvent.click(screen.getByRole('button', { name: 'Stock y Servicios' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor')
    })

    it('agrega un servicio enviándolo al backend y lo muestra en la tabla', async () => {
        crearServicio.mockResolvedValue({
            id: 9, nombre: 'Peluquería canina', categoria: 'Peluquería y Estética',
            especie: 'Perro', duracion: 45, precio: 20000, stock: 10,
        })
        await renderPanel()
        await irAStock()

        fireEvent.change(screen.getByLabelText('Nombre del Servicio'), { target: { value: 'Peluquería canina' } })
        fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Peluquería y Estética' } })
        fireEvent.change(screen.getByLabelText('Especie'), { target: { value: 'Perro' } })
        fireEvent.change(screen.getByLabelText('Duración (Minutos)'), { target: { value: '45' } })
        fireEvent.click(screen.getByRole('button', { name: 'Guardar Servicio' }))

        expect(await screen.findByText('Peluquería canina')).toBeInTheDocument()
        expect(crearServicio).toHaveBeenCalledWith({
            nombre: 'Peluquería canina',
            categoria: 'Peluquería y Estética',
            especie: 'Perro',
            duracion: 45,
            stock: 10,
            precio: 20000,
        })
        // el formulario vuelve a sus valores iniciales
        expect(screen.getByLabelText('Nombre del Servicio')).toHaveValue('')
    })

    it('si el backend rechaza el servicio, muestra su mensaje y no agrega la fila', async () => {
        crearServicio.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
        await renderPanel()
        await irAStock()

        fireEvent.change(screen.getByLabelText('Nombre del Servicio'), { target: { value: 'Peluquería canina' } })
        fireEvent.click(screen.getByRole('button', { name: 'Guardar Servicio' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.queryByText('Peluquería canina')).not.toBeInTheDocument()
    })

    it('guarda el nuevo stock en el backend al salir de la casilla', async () => {
        actualizarServicio.mockResolvedValue({ ...SERVICIOS_BACKEND[0], stock: 20 })
        await renderPanel()
        await irAStock()

        const casilla = screen.getByLabelText('Cupos de Consulta general')
        fireEvent.change(casilla, { target: { value: '20' } })
        fireEvent.blur(casilla)

        await vi.waitFor(() => {
            expect(actualizarServicio).toHaveBeenCalledWith(1, { ...SERVICIOS_BACKEND[0], stock: 20 })
        })
        expect(screen.getByLabelText('Cupos de Consulta general')).toHaveValue(20)
    })

    it('el stock de un servicio nunca baja de cero', async () => {
        actualizarServicio.mockResolvedValue({ ...SERVICIOS_BACKEND[0], stock: 0 })
        await renderPanel()
        await irAStock()

        const casilla = screen.getByLabelText('Cupos de Consulta general')
        fireEvent.change(casilla, { target: { value: '-5' } })
        fireEvent.blur(casilla)

        await vi.waitFor(() => {
            expect(actualizarServicio).toHaveBeenCalledWith(1, { ...SERVICIOS_BACKEND[0], stock: 0 })
        })
    })

    it('no llama al backend si el stock no cambió', async () => {
        await renderPanel()
        await irAStock()

        fireEvent.blur(screen.getByLabelText('Cupos de Consulta general'))

        expect(actualizarServicio).not.toHaveBeenCalled()
    })

    it('si el backend rechaza el cambio de stock, vuelve al valor anterior y muestra el error', async () => {
        actualizarServicio.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
        await renderPanel()
        await irAStock()

        const casilla = screen.getByLabelText('Cupos de Consulta general')
        fireEvent.change(casilla, { target: { value: '99' } })
        fireEvent.blur(casilla)

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
        expect(screen.getByLabelText('Cupos de Consulta general')).toHaveValue(15)
    })

    it('elimina un servicio en el backend cuando se confirma', async () => {
        const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
        eliminarServicio.mockResolvedValue(null)
        await renderPanel()
        await irAStock()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar Consulta general' }))

        await vi.waitFor(() => {
            expect(screen.queryByText('Consulta general')).not.toBeInTheDocument()
        })
        expect(confirmar).toHaveBeenCalled()
        expect(eliminarServicio).toHaveBeenCalledWith(1)
    })

    it('no elimina el servicio si se cancela la confirmación', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        await renderPanel()
        await irAStock()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar Consulta general' }))

        expect(eliminarServicio).not.toHaveBeenCalled()
        expect(screen.getByText('Consulta general')).toBeInTheDocument()
    })

    it('si el backend no deja eliminar, muestra el error y mantiene la fila', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)
        eliminarServicio.mockRejectedValue(new Error('No se puede completar la operación: hay datos relacionados'))
        await renderPanel()
        await irAStock()

        fireEvent.click(screen.getByRole('button', { name: 'Eliminar Consulta general' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('hay datos relacionados')
        expect(screen.getByText('Consulta general')).toBeInTheDocument()
    })
})

describe('AdminPage: citas, clientes y estadísticas desde el backend', () => {
    it('la pestaña Citas lista las citas con el dueño y la mascota que entrega el backend', async () => {
        await renderPanel()
        irA(/Citas y Agenda/)

        const fila = screen.getByText('11').closest('tr')
        expect(within(fila).getByText('Ana')).toBeInTheDocument()
        expect(within(fila).getByText('11111111-1')).toBeInTheDocument()
        expect(within(fila).getByText('Luna (Gato)')).toBeInTheDocument()
        expect(within(fila).getByText('Consulta general (30 min)')).toBeInTheDocument()
        expect(screen.getByText('Rocky (Perro)')).toBeInTheDocument()
    })

    it('busca citas por nombre de mascota, de dueño o por RUT', async () => {
        await renderPanel()
        irA(/Citas y Agenda/)
        const buscador = screen.getByPlaceholderText(/Firulais/)

        fireEvent.change(buscador, { target: { value: 'luna' } })
        expect(screen.getByText('Luna (Gato)')).toBeInTheDocument()
        expect(screen.queryByText('Rocky (Perro)')).not.toBeInTheDocument()

        fireEvent.change(buscador, { target: { value: 'pedro' } })
        expect(screen.getByText('Rocky (Perro)')).toBeInTheDocument()
        expect(screen.queryByText('Luna (Gato)')).not.toBeInTheDocument()

        fireEvent.change(buscador, { target: { value: '11111111' } })
        expect(screen.getByText('Luna (Gato)')).toBeInTheDocument()
        expect(screen.queryByText('Rocky (Perro)')).not.toBeInTheDocument()
    })

    it('una cita cuyo dueño no tiene RUT se muestra igual', async () => {
        const sinRut = { ...ANA, rut: null, telefono: null }
        listarCitas.mockResolvedValue([{ ...CITAS[0], mascota: { ...MASCOTAS[0], dueno: sinRut } }])
        listarUsuarios.mockResolvedValue([sinRut, PEDRO])
        render(<AdminPage />)
        await screen.findByText('Servicios Activos')
        await vi.waitFor(() =>
            expect(screen.getByText('Citas Totales').closest('.card')).toHaveTextContent('1'))
        irA(/Citas y Agenda/)

        fireEvent.change(screen.getByPlaceholderText(/Firulais/), { target: { value: 'luna' } })
        expect(screen.getByText('Sin RUT')).toBeInTheDocument()
    })

    it('el admin cambia el estado: se envía la cita completa y se muestra lo que devuelve el backend', async () => {
        await renderPanel()
        irA(/Citas y Agenda/)
        const selector = screen.getByLabelText('Estado de la cita 11')

        fireEvent.change(selector, { target: { value: 'Atendida' } })

        await vi.waitFor(() => expect(selector).toHaveValue('Atendida'))
        expect(actualizarCita).toHaveBeenCalledWith(11, {
            mascota: { id: 3 }, servicio: { id: 1 },
            fecha: '2030-01-15', hora: '10:00', motivo: null, estado: 'Atendida',
        })
        expect(screen.getByLabelText('Estado de la cita 12')).toHaveValue('Confirmada')
    })

    it('el selector de estado ofrece los cinco estados del backend', async () => {
        await renderPanel()
        irA(/Citas y Agenda/)

        const opciones = within(screen.getByLabelText('Estado de la cita 11'))
            .getAllByRole('option').map((o) => o.textContent)
        expect(opciones).toEqual(['Pendiente', 'Confirmada', 'Reagendada', 'Atendida', 'Cancelada'])
    })

    it('si el backend rechaza el cambio de estado, muestra el mensaje y la cita queda como estaba', async () => {
        actualizarCita.mockRejectedValue(new Error('Ese horario ya está ocupado'))
        await renderPanel()
        irA(/Citas y Agenda/)

        fireEvent.change(screen.getByLabelText('Estado de la cita 11'), { target: { value: 'Confirmada' } })

        expect(await screen.findByRole('alert')).toHaveTextContent('Ese horario ya está ocupado')
        expect(screen.getByLabelText('Estado de la cita 11')).toHaveValue('Pendiente')
    })

    it('la pestaña Clientes y Mascotas lista las mascotas con los datos de su dueño', async () => {
        await renderPanel()
        irA('Clientes y Mascotas')

        const fila = screen.getByText('Luna').closest('tr')
        expect(within(fila).getByText('11111111-1')).toBeInTheDocument()
        expect(within(fila).getByText('Ana')).toBeInTheDocument()
        expect(within(fila).getByText('+56911111111')).toBeInTheDocument()
        expect(within(fila).getByText('Gato')).toBeInTheDocument()
        expect(screen.getByText('Rocky')).toBeInTheDocument()
    })

    it('Estadísticas cuenta confirmadas y canceladas según el backend', async () => {
        listarCitas.mockResolvedValue([
            ...CITAS,
            { ...CITAS[0], id: 13, estado: 'Cancelada' },
            { ...CITAS[0], id: 14, estado: 'Cancelada' },
        ])
        render(<AdminPage />)
        await vi.waitFor(() =>
            expect(screen.getByText('Citas Totales').closest('.card')).toHaveTextContent('4'))
        irA('Estadísticas')

        expect(screen.getByText('Citas Agendadas').parentElement).toHaveTextContent('4')
        expect(screen.getByText('Atenciones Confirmadas').parentElement).toHaveTextContent('1')
        expect(screen.getByText('Cancelaciones').parentElement).toHaveTextContent('2')
    })

    it('si falla la carga de citas, el dashboard muestra el error', async () => {
        listarCitas.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
        render(<AdminPage />)

        expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
    })
})