import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import HistorialPage from './HistorialPage'

const buscar = (rut) => {
    fireEvent.change(screen.getByPlaceholderText(/RUT del dueño/), {
        target: { value: rut },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Ficha' }))
}

beforeEach(() => {
    // Fecha fija para que el estado de las vacunas no cambie con el tiempo
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-25T12:00:00'))
})

afterEach(() => {
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
})