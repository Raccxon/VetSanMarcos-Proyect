import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ServicioCard from './ServicioCard'

const servicio = {
    id: 'SV001',
    categoria: 'Consultas',
    nombre: 'Consulta general',
    especie: 'Perro / Gato',
    duracion: '30 min',
    precio: 15000,
    observaciones: 'Atención preventiva básica',
}

describe('ServicioCard', () => {

    it('renderiza la información recibida mediante props', () => {
        render(
            <MemoryRouter>
                <ServicioCard servicio={servicio} />
            </MemoryRouter>
        )

        expect(
            screen.getByRole('heading', {
                name: 'Consulta general'
            })
        ).toBeInTheDocument()

        expect(
            screen.getByText('Consultas')
        ).toBeInTheDocument()

        expect(
            screen.getByText(/Perro \/ Gato/)
        ).toBeInTheDocument()

        expect(
            screen.getByText('$15.000')
        ).toBeInTheDocument()
    })

    it('muestra el enlace para agendar', () => {
        render(
            <MemoryRouter>
                <ServicioCard servicio={servicio} />
            </MemoryRouter>
        )

        expect(
            screen.getByRole('link', {
                name: 'Agendar'
            })
        ).toHaveAttribute('href', '/agendar')
    })

})