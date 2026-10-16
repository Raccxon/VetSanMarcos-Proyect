import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import HistorialPage from './HistorialPage'
import { CitasProvider } from '../context/CitasContext'

const citasDePrueba = [
    {
        id: 'CIT-1', nombreDuenio: 'Juan Pérez', rutDuenio: '12345678-9', emailDuenio: 'jperez@gmail.com',
        nombreMascota: 'Firulais', servicioId: 'SV001', servicioNombre: 'Consulta general',
        fecha: '2026-10-20', hora: '10:00', estado: 'Pendiente'
    },
    {
        id: 'CIT-2', nombreDuenio: 'Juan Pérez', rutDuenio: '12345678-9', emailDuenio: 'jperez@gmail.com',
        nombreMascota: 'Firulais', servicioId: 'VA001', servicioNombre: 'Vacuna antirrábica canina',
        fecha: '2026-10-22', hora: '11:00', estado: 'Confirmada'
    }
]

const renderPagina = (citas = []) =>
    render(
        <CitasProvider citasIniciales={citas}>
            <HistorialPage />
        </CitasProvider>
    )

const buscar = (rut) => {
    fireEvent.change(screen.getByPlaceholderText(/RUT del dueño/), { target: { value: rut } })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
}

const iniciarSesion = (email, rol) =>
    localStorage.setItem('userSession', JSON.stringify({ email, rol, nombre: 'Prueba' }))

beforeEach(() => {
    localStorage.clear()
    iniciarSesion('recepcion@gmail.cl', 'recepcion')
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-25T12:00:00'))
})

afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
})

describe('HistorialPage', () => {
    it('recepción no ve ninguna ficha hasta que busca un RUT', () => {
        renderPagina()

        expect(screen.getByRole('heading', { level: 1, name: 'Historial y Control' })).toBeInTheDocument()
        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('muestra la ficha de la mascota con un RUT existente', () => {
        renderPagina()

        buscar('12345678-9')

        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
        expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument()
        expect(screen.getByText(/981000001234567/)).toBeInTheDocument()
    })

    it('encuentra la ficha aunque el RUT tenga espacios', () => {
        renderPagina()

        buscar('  12345678-9  ')

        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
    })

    it('muestra un error con un RUT que no existe', () => {
        renderPagina()

        buscar('99999999-9')

        expect(screen.getByRole('alert')).toHaveTextContent(/No se encontraron registros/)
        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
    })

    it('calcula el estado de cada vacuna según la fecha actual', () => {
        renderPagina()

        buscar('12345678-9')

        const vencida = screen.getByText('Antirrábica').closest('tr')
        const proxima = screen.getByText('Sextuple Canina').closest('tr')

        expect(within(vencida).getByText('Vencida')).toBeInTheDocument()
        expect(within(proxima).getByText('Próxima a vencer')).toBeInTheDocument()
    })

    it('muestra el historial de consultas médicas', () => {
        renderPagina()

        buscar('12345678-9')

        expect(screen.getByText(/Consulta general y desparasitación/)).toBeInTheDocument()
        expect(screen.getByText(/Dr. Roberto Silva/)).toBeInTheDocument()
        expect(screen.getByText(/Dra. Camila Morales/)).toBeInTheDocument()
    })

    it('quita la ficha anterior si la nueva búsqueda no encuentra nada', () => {
        renderPagina()

        buscar('12345678-9')
        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()

        buscar('00000000-0')

        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
        expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('un dueño ve automáticamente la ficha de su mascota', () => {
        iniciarSesion('jperez@gmail.com', 'cliente')
        renderPagina()

        expect(screen.getByRole('heading', { level: 1, name: 'Mi Historial' })).toBeInTheDocument()
        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
    })

    it('un dueño no puede ver la ficha de otro dueño', () => {
        iniciarSesion('otra.persona@gmail.com', 'cliente')
        renderPagina()

        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent('Aún no tienes registros.')
    })

    it('sin sesión no muestra ninguna ficha', () => {
        localStorage.clear()
        renderPagina()

        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
    })

    it('muestra una ficha registrada por recepción', () => {
        localStorage.setItem('fichas', JSON.stringify([{
            rutDuenio: '11222333-4',
            emailDuenio: 'maria@correo.cl',
            nombreDuenio: 'Maria Soto',
            mascota: { nombre: 'Luna', especie: 'Gato', raza: '', edad: '', chip: '' },
            vacunas: [],
            atenciones: [],
        }]))
        renderPagina()

        buscar('11222333-4')

        expect(screen.getByText('Ficha del Paciente: Luna')).toBeInTheDocument()
    })

    it('lista las reservas del dueño buscado', () => {
        renderPagina(citasDePrueba)

        buscar('12345678-9')

        expect(screen.getByText('Reservas (2)')).toBeInTheDocument()
        expect(screen.getByText('Consulta general')).toBeInTheDocument()
        expect(screen.getByText('Vacuna antirrábica canina')).toBeInTheDocument()
    })

    it('filtra las reservas por categoría de servicio', () => {
        renderPagina(citasDePrueba)

        buscar('12345678-9')
        fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Vacunación' } })

        expect(screen.getByText('Reservas (1)')).toBeInTheDocument()
        expect(screen.getByText('Vacuna antirrábica canina')).toBeInTheDocument()
        expect(screen.queryByText('Consulta general')).not.toBeInTheDocument()
    })
})