import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

vi.mock('../components/ui/MapaClinica', () => ({
    default: () => <div data-testid="mapa-clinica" />,
}))

const renderPagina = () =>
    render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    )

describe('HomePage', () => {
    it('muestra la bienvenida, las secciones informativas y el mapa', () => {
        renderPagina()

        expect(
            screen.getByRole('heading', { name: 'Bienvenido a Veterinaria San Marcos' })
        ).toBeInTheDocument()
        expect(screen.getByText('Consultas y Urgencias')).toBeInTheDocument()
        expect(screen.getByText('Vacunación y Fichas')).toBeInTheDocument()
        expect(screen.getByTestId('mapa-clinica')).toBeInTheDocument()
    })

    it('los botones principales llevan a Agendar y a Servicios', () => {
        renderPagina()

        expect(screen.getByRole('link', { name: 'Agendar Cita' })).toHaveAttribute('href', '/agendar')
        expect(screen.getByRole('link', { name: 'Ver Servicios' })).toHaveAttribute('href', '/servicios')
    })
})