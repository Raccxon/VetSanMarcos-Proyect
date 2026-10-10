import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import GestionCitasPage from './GestionCitasPage'
import { CitasProvider } from '../context/CitasContext'

const citas = [
    {
        id: 'CIT-1', nombreDuenio: 'Ana', nombreMascota: 'Luna',
        servicioNombre: 'Consulta general', fecha: '2026-10-20', hora: '10:00', estado: 'Pendiente'
    },
    {
        id: 'CIT-2', nombreDuenio: 'Pedro', nombreMascota: 'Rocky',
        servicioNombre: 'Vacunación', fecha: '2025-10-21', hora: '10:00', estado: 'Confirmada'
    }
]

const renderPagina = (lista) =>
    render(
        <CitasProvider citasIniciales={lista}>
            <GestionCitasPage />
        </CitasProvider>
    )

describe('GestionCitasPage', () => {
    it('muestra las citas de todos los dueños', () => {
        renderPagina(citas)
        expect(screen.getByText('Luna')).toBeInTheDocument()
        expect(screen.getByText('Rocky')).toBeInTheDocument()
    })

    it('cambia el estado de la cita elegida', () => {
        renderPagina(citas)
        const selector = screen.getByLabelText('Cambiar estado de la cita CIT-1')

        fireEvent.change(selector, { target: { value: 'Cancelada' } })

        expect(selector.value).toBe('Cancelada')
        // la otra cita no debe cambiar
        expect(screen.getByLabelText('Cambiar estado de la cita CIT-2').value).toBe('Confirmada')
    })

    it('filtra las citas por estado', () => {
        renderPagina(citas)

        fireEvent.change(screen.getByLabelText('Mostrar'), { target: { value: 'Pendiente' } })

        expect(screen.getByText('Luna')).toBeInTheDocument()
        expect(screen.queryByText('Rocky')).not.toBeInTheDocument()
    })

    it('avisa cuando no hay citas', () => {
        renderPagina([])
        expect(screen.getByText('No hay citas para mostrar.')).toBeInTheDocument()
    })

    it('elimina la cita elegida', () => {
        renderPagina(citas)
        fireEvent.click(screen.getByRole('button', { name: 'Eliminar cita CIT-1' }))
        expect(screen.queryByText('Luna')).not.toBeInTheDocument()
        expect(screen.getByText('Rocky')).toBeInTheDocument()
    })

    it('reagenda la cita con nueva fecha y hora', () => {
        renderPagina(citas)
        fireEvent.click(screen.getByRole('button', {name: 'Reagendar cita CIT-1'}))
        fireEvent.change(screen.getByLabelText('Nueva fecha de la cita CIT-1'), { target: {value: '2030-01-15'} })
        fireEvent.change(screen.getByLabelText('Nuevo horario de la cita CIT-1'), { target: { value: '16:00' } })
        fireEvent.click(screen.getByRole('button', { name: 'Guardar reagendamiento de la cita CIT-1' }))

        expect(screen.getByText(/2030-01-15/)).toBeInTheDocument()
        expect(screen.getByLabelText('Cambiar estado de la cita CIT-1').value).toBe('Reagendada')
    })

    it('no reagenda con una fecha pasada y muestra el error', () => {
        renderPagina(citas)
        fireEvent.click(screen.getByRole('button', { name: 'Reagendar cita CIT-1'}))
        fireEvent.change(screen.getByLabelText('Nueva fecha de la cita CIT-1'),{ target: { value: '2020-01-01' } })
        fireEvent.click(screen.getByRole('button', { name: 'Guardar reagendamiento de la cita CIT-1'}))

        expect(screen.getByRole('alert')).toHaveTextContent('La fecha no puede ser anterior a hoy')
        expect(screen.getByLabelText('Cambiar estado de la cita CIT-1').value).toBe('Pendiente')
    })

    it('cancelar el reagendamiento no cambia la cita', () => {
        renderPagina(citas)
        fireEvent.click(screen.getByRole('button', { name: 'Reagendar cita CIT-1'}))
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar'}))

        expect(screen.getByRole('button', { name: 'Reagendar cita CIT-1' })).toBeInTheDocument()
        expect(screen.getByLabelText('Cambiar estado de la cita CIT-1').value).toBe('Pendiente')
    })
})