import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MisCitasPage from "./MisCitasPage";
import { CitasProvider } from "../context/CitasContext";
import { MemoryRouter } from "react-router-dom";

const citas = [
    { id: 'CIT-1', email: 'ana@correo.cl', nombreMascota: 'Luna', 
    servicioNombre: 'Consulta general', fecha: '2026-10-20', hora: '10:00', estado: 'Pendiente' },
    { id: 'CIT-2', email: 'pedro@correo.cl', nombreMascota: 'Rocky',
    servicioNombre: 'Vacunación', fecha: '2026-10-21', hora: '11:00', estado: 'Confirmada' }
]

const renderPagina = (lista) => 
    render(
        <MemoryRouter>
            <CitasProvider citasIniciales={lista}>
                <MisCitasPage />
            </CitasProvider>
        </MemoryRouter>
    )

beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('userSession',
    JSON.stringify({ email: 'ana@correo.cl', rol: 'cliente', nombre: 'Ana' }))
})

describe('MisCitasPage', () => {
    it('muestra solo las citas del dueño con sesion iniciada', () => {
        renderPagina(citas)
        expect(screen.getByText('Luna')).toBeInTheDocument()
        expect(screen.queryByText('Rocky')).not.toBeInTheDocument()
    })

    it('muestra el estado de la cita', () => {
        renderPagina(citas)
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('avisa cuando el dueño no tiene citas', () => {
        renderPagina([])
        expect(screen.getByText(/Aun no tienes citas/i)).toBeInTheDocument()
    })
})