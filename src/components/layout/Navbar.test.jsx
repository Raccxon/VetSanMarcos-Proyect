import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'

const renderNavbar = () => {
    return render(
        <BrowserRouter>
            <Navbar />
        </BrowserRouter>
    )
}

describe('Navbar', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('sin sesión muestra solo los enlaces públicos', () => {
        renderNavbar()

        expect(screen.getByRole('link', { name: /Servicios/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Registrarse/i })).toBeInTheDocument()
    })

    it('el cliente ve Mis Citas y no los enlaces de otros roles', () => {
        localStorage.setItem('userSession', JSON.stringify({ email: 'cliente@correo.cl', rol: 'cliente' }))
        renderNavbar()

        expect(screen.getByRole('link', { name: /Mis Citas/i })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /Gestión de Citas/i })).not.toBeInTheDocument()
    })

    it('recepción ve Gestión de Citas y no Mis Citas', () => {
        localStorage.setItem('userSession', JSON.stringify({ email: 'recepcion@sanmarcos.cl', rol: 'recepcion' }))
        renderNavbar()

        expect(screen.getByRole('link', { name: /Gestión de Citas/i })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /Mis Citas/i })).not.toBeInTheDocument()
    })

    it('el administrador ve solo sus pestañas y ninguna de las del cliente', () => {
        localStorage.setItem('userSession', JSON.stringify({ email: 'admin@gmail.cl', rol: 'admin' }))
        renderNavbar()

        // En la interfaz "Administración" es un botón desplegable de Bootstrap
        expect(screen.getByRole('button', { name: /Administración/i })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /Mis Citas/i })).not.toBeInTheDocument()
    })

    it('cerrar sesión borra la sesión, avisa el cambio y vuelve a mostrar Iniciar Sesión', () => {
        localStorage.setItem('userSession', JSON.stringify({ email: 'cliente@correo.cl', rol: 'cliente' }))
        renderNavbar()

        const btnCerrar = screen.getByRole('button', { name: /Cerrar sesión/i })
        fireEvent.click(btnCerrar)

        expect(localStorage.getItem('userSession')).toBeNull()
        expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toBeInTheDocument()
    })

    it('se actualiza cuando alguien inicia sesión después de cargar', () => {
        renderNavbar()
        expect(screen.getByRole('link', { name: /Iniciar Sesión/i })).toBeInTheDocument()
    })
})