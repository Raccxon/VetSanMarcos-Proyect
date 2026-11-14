import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AdminPage from './AdminPage'
import { CitasProvider } from '../context/CitasContext'
import {
    getServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
} from '../services/apiServices'

// Se reemplaza el servicio: el test no necesita el backend encendido
vi.mock('../services/apiServices', () => ({
    getServicios: vi.fn(),
    crearServicio: vi.fn(),
    actualizarServicio: vi.fn(),
    eliminarServicio: vi.fn(),
}))

const citas = [
    {
        id: 'CIT-1', nombreDuenio: 'Ana', rutDuenio: '11111111-1', telefono: '+56 9 11111111 (Chile)',
        nombreMascota: 'Luna', especie: 'Gato', servicioNombre: 'Consulta general',
        fecha: '2030-01-15', hora: '10:00', estado: 'Pendiente'
    },
    {
        id: 'CIT-2', nombreDuenio: 'Pedro', rutDuenio: '22222222-2', telefono: '+56 9 22222222 (Chile)',
        nombreMascota: 'Rocky', especie: 'Perro', servicioNombre: 'Vacunación',
        fecha: '2030-01-16', hora: '11:00', estado: 'Confirmada'
    }
]

// Lo que devolvería GET /api/servicios
const SERVICIOS_BACKEND = [
    { id: 1, nombre: 'Consulta general', categoria: 'Consultas y Urgencias', especie: 'Perro / Gato', duracion: 30, precio: 15000, stock: 15 },
    { id: 2, nombre: 'Vacuna triple felina', categoria: 'Vacunación', especie: 'Gato', duracion: 15, precio: 14000, stock: 8 },
    { id: 3, nombre: 'Hemograma completo', categoria: 'Procedimientos', especie: 'Perro / Gato', duracion: 30, precio: 22000, stock: 10 },
]

// Renderiza y espera a que el backend responda con los servicios
const renderPanel = async (lista = citas) => {
    render(
        <CitasProvider citasIniciales={lista}>
            <AdminPage />
        </CitasProvider>
    )
    await vi.waitFor(() => expect(getServicios).toHaveBeenCalled())
    // el dashboard muestra la cantidad de servicios cuando terminó de cargar
    await screen.findByText('3')
}

const irAStock = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Stock y Servicios' }))
    await screen.findByText('Hemograma completo')
}

beforeEach(() => {
    vi.clearAllMocks()
    getServicios.mockResolvedValue(SERVICIOS_BACKEND)
})

describe('AdminPage', () => {
    it('muestra el dashboard con el total de citas', async () => {
        await renderPanel()

        expect(screen.getByText('Panel de Control Administrativo')).toBeInTheDocument()
        expect(screen.getByText('Citas Totales').closest('.card')).toHaveTextContent('2')
    })

    it('cuenta los clientes distintos a partir de las citas', async () => {
        await renderPanel()

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
        render(
            <CitasProvider citasIniciales={citas}>
                <AdminPage />
            </CitasProvider>
        )

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