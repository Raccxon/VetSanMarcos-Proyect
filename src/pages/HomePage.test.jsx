import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import HomePage from './HomePage'

const renderConRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('HomePage', () => {
    it('muestra la bienvenida, las secciones informativas y el mapa', () => {
        renderConRouter(<HomePage />)

        expect(screen.getByText('Bienvenido a Veterinaria San Marcos')).toBeInTheDocument()
        expect(screen.getByText('Consultas y Urgencias')).toBeInTheDocument()
        expect(screen.getByText('Vacunación')).toBeInTheDocument()

        // Verifica que el contenedor del mapa de Leaflet está presente
        expect(document.querySelector('.leaflet-container')).toBeInTheDocument()
    })

    it('los botones principales llevan a Agendar y a Servicios', () => {
        renderConRouter(<HomePage />)

        const btnAgendar = screen.getByRole('link', { name: /Agendar Cita/i })
        const btnServicios = screen.getByRole('link', { name: /Ver Servicios/i })

        expect(btnAgendar).toHaveAttribute('href', '/agendar')
        expect(btnServicios).toHaveAttribute('href', '/servicios')
    })
})