import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AdminPage from './AdminPage'
import { CitasProvider } from '../context/CitasContext'

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

const renderPanel = (lista = citas) =>
    render(
        <CitasProvider citasIniciales={lista}>
            <AdminPage />
        </CitasProvider>
    )

const irAStock = () =>
    fireEvent.click(screen.getByRole('button', { name: 'Stock y Servicios' }))

afterEach(() => {
    vi.restoreAllMocks()
})

describe('AdminPage', () => {
    it('muestra el dashboard con el total de citas', () => {
        renderPanel()

        expect(screen.getByText('Panel de Control Administrativo')).toBeInTheDocument()
        expect(screen.getByText('Citas Totales').closest('.card')).toHaveTextContent('2')
    })

    it('cuenta los clientes distintos a partir de las citas', () => {
        renderPanel()

        expect(screen.getByText('Clientes Registrados').closest('.card')).toHaveTextContent('2')
    })

    it('la pestaña Stock y Servicios lista el catálogo inicial', () => {
        renderPanel()
        irAStock()

        expect(screen.getByText('Consulta General')).toBeInTheDocument()
        expect(screen.getByText('Cirugía Menor')).toBeInTheDocument()
    })

    it('agrega un servicio nuevo al catálogo', () => {
        renderPanel()
        irAStock()

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Peluquería canina' } })
        fireEvent.click(screen.getByRole('button', { name: 'Guardar Servicio' }))

        expect(screen.getByText('Peluquería canina')).toBeInTheDocument()
    })

    it('el stock de un servicio nunca baja de cero', () => {
        renderPanel()
        irAStock()

        const primerStock = screen.getAllByRole('spinbutton')[0]
        fireEvent.change(primerStock, { target: { value: '-5' } })

        expect(primerStock.value).toBe('0')
    })

    it('elimina un servicio cuando se confirma', () => {
        const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderPanel()
        irAStock()

        fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])

        expect(confirmar).toHaveBeenCalled()
        expect(screen.queryByText('Consulta General')).not.toBeInTheDocument()
    })

    it('no elimina el servicio si se cancela la confirmación', () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        renderPanel()
        irAStock()

        fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar' })[0])

        expect(screen.getByText('Consulta General')).toBeInTheDocument()
    })
})