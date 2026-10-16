import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HistorialPage from './HistorialPage'
import { CitasProvider } from '../context/CitasContext'

const renderConProviders = (ui) => {
    return render(
        <CitasProvider>
            {ui}
        </CitasProvider>
    )
}

describe('HistorialPage Component', () => {
    it('renderiza correctamente el componente HistorialPage sin fallar por falta de CitasProvider', () => {
        renderConProviders(<HistorialPage />)
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('muestra el historial de citas correctamente', () => {
        renderConProviders(<HistorialPage />)
        // Agrega tus expectativas adicionales aquí
    })
})