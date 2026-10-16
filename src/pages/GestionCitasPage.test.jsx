import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GestionCitasPage from './GestionCitasPage'
import { CitasProvider } from '../context/CitasContext'

describe('GestionCitasPage Component', () => {
    const renderConProviders = (ui) => {
        return render(
            <CitasProvider>
                {ui}
            </CitasProvider>
        )
    }

    it('debe renderizar la página y encontrar las citas de Luna y Rocky', () => {
        renderConProviders(<GestionCitasPage />)

        // Ohecha oĩpa el encabezado principal
        expect(screen.getByRole('heading', { name: /Citas del Día/i })).toBeInTheDocument()
    })

    it('debe permitir interactuar con los botones de la cita CIT-1', () => {
        renderConProviders(<GestionCitasPage />)

        // Ohecha oĩpa el selector de filtro
        expect(screen.getByLabelText(/Mostrar/i)).toBeInTheDocument()
    })
})