import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import HistorialPage from './HistorialPage'

const buscar = (rut) => {
    fireEvent.change(screen.getByPlaceholderText(/RUT del dueño/), {
        target: { value: rut },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Ficha' }))
}

const iniciarSesion = (email, rol) =>
    localStorage.setItem('userSession', JSON.stringify({ email, rol, nombre: 'Prueba'}))

beforeEach(() => {
    localStorage.clear()
    iniciarSesion('recepcion@sanmarcos.cl','recepcion')
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-25T12:00:00'))
})

afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
})

describe('HistorialPage', () => {
    it('no muestra ninguna ficha al abrir la página', () => {
        render(<HistorialPage />)

        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('muestra la ficha de la mascota con un RUT existente', () => {
        render(<HistorialPage />)

        buscar('12345678-9')

        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
        expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument()
        expect(screen.getByText(/981000001234567/)).toBeInTheDocument()
    })

    it('encuentra la ficha aunque el RUT tenga espacios', () => {
        render(<HistorialPage />)

        buscar('  12345678-9  ')

        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
    })

    it('muestra un error con un RUT que no existe', () => {
        render(<HistorialPage />)

        buscar('99999999-9')

        expect(screen.getByRole('alert')).toHaveTextContent(/No se encontraron registros/)
        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
    })

    it('calcula el estado de cada vacuna según la fecha actual', () => {
        render(<HistorialPage />)

        buscar('12345678-9')

        const vencida = screen.getByText('Antirrábica').closest('tr')
        const proxima = screen.getByText('Sextuple Canina').closest('tr')

        expect(within(vencida).getByText('Vencida')).toBeInTheDocument()
        expect(within(proxima).getByText('Próxima a vencer')).toBeInTheDocument()
    })

    it('muestra el historial de consultas médicas', () => {
        render(<HistorialPage />)

        buscar('12345678-9')

        expect(screen.getByText(/Consulta general y desparasitación/)).toBeInTheDocument()
        expect(screen.getByText(/Dr. Roberto Silva/)).toBeInTheDocument()
        expect(screen.getByText(/Dra. Camila Morales/)).toBeInTheDocument()
    })

    it('quita la ficha anterior si la nueva búsqueda no encuentra nada', () => {
        render(<HistorialPage />)

        buscar('12345678-9')
        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()

        buscar('00000000-0')

        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
        expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('un dueño ve la ficha de su mascota',() => {
        iniciarSesion('jperez@gmail.com','cliente')
        render(<HistorialPage />)
        buscar('12345678-9')

        expect(screen.getByText('Ficha del Paciente: Firulais')).toBeInTheDocument()
    })

    it('un dueño no puede ver la ficha de otro dueño', () => {
        iniciarSesion('otra.persona@gmail.com','cliente')
        render(<HistorialPage />)
        
        buscar('12345678-9')
        expect(screen.queryByText(/Ficha del Paciente/)).not.toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent(/No se encontraron registros/)
    })

    it('sin sesión no muestra ninguna ficha', () => {
        localStorage.clear()
        render(<HistorialPage />)

        buscar('12345678-9')

        expect(screen.queryByText(/Ficha del paciente/)).not.toBeInTheDocument()
    })

    it('muestra una ficha registrada por recepcion', () => {
        localStorage.setItem('fichas',JSON.stringify([{
            rutDuenio: '11222333-4',
            emailDuenio: 'maria@correo.cl',
            nombreDuenio: 'Maria Soto',
            mascota: { nombre: 'Luna', especie: 'Gato', raza: '', edad: '', chip: ''},
            vacunas: [],
            atenciones: [],
        }]))
        render(<HistorialPage />)
        buscar('11222333-4')
        expect(screen.getByText('Ficha del Paciente: Luna')).toBeInTheDocument()
    })
})