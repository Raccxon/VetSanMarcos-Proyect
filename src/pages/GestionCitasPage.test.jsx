import { describe, expect, it} from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import GestionCitasPage from './GestionCitasPage'
import { CitasProvider } from '../context/CitasContext'

const citas = [
    { id: 'CIT-1', nombreDuenio: 'Ana', nombreMascota: 'Luna',
    servicioNombre: 'Consulta general', fecha:'2026-10-20', hora:'10:00', estado: 'Pendiente'},
    { id: 'CIT-2', nombreDuenio: 'Pedro', nombreMascota: 'Rocky',
    servicioNombre: 'Vacunación', fecha: '2025-10-21', hora: '10:00', estado: 'Confirmada'}
]

const renderPagina = (lista) =>
    render(
        <CitasProvider citasIniciales={lista}>
            <GestionCitasPage/>
        </CitasProvider>
    )

describe('GestionCitasPage',() => {
    it('muestra las citas de todos los dueños', () => {
        renderPagina(citas)
        expect(screen.getByText('Luna')).toBeInTheDocument()
        expect(screen.getByText('Rocky')).toBeInTheDocument()
    })

    it('cambia el estado de la cita elegida', () => {
        renderPagina(citas)
        const selector = screen.getByLabelText('Cambiar estado de la cita CIT-1')
        
        fireEvent.change(selector, {target: {value: 'Cancelada'}})

        expect(selector.value).toBe('Cancelada')
        // la otra cita no debe cambiar
        expect(screen.getByLabelText('Cambiar estado de la cita CIT-2').value).toBe('Confirmada')
    })

    it('filtra las citas por estado', () => {
        renderPagina(citas)

        fireEvent.change(screen.getByLabelText('Mostrar'), {target: {value: 'Pendiente'} })

        expect(screen.getByText('Luna')).toBeInTheDocument()
        expect(screen.queryByText('Rocky')).not.toBeInTheDocument()
    })

    it('avisa cuando no hay citas', () => {
        renderPagina([])
        expect(screen.getByText('No hay citas para mostrar.')).toBeInTheDocument()
    })
})