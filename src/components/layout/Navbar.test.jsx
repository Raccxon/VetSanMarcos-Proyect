import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'
import { ROLES } from '../../constants/roles'
import { EVENTO_SESION, avisarCambioSesion } from '../../utils/sesionEventos'

const renderNavbar = () =>
    render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    )

const iniciarSesion = (rol) =>
    localStorage.setItem(
        'userSession',
        JSON.stringify({ email: 'ana@correo.cl', rol, nombre: 'Ana' })
    )

const enlace = (nombre) => screen.queryByRole('link', { name: nombre })

beforeEach(() => {
    localStorage.clear()
})

describe('Navbar', () => {
    it('sin sesión muestra solo los enlaces públicos', () => {
        renderNavbar()

        expect(enlace('Servicios')).toBeInTheDocument()
        expect(enlace('Agendar Cita')).toBeInTheDocument()
        expect(enlace('Iniciar Sesión')).toBeInTheDocument()

        expect(enlace('Mis Citas')).not.toBeInTheDocument()
        expect(enlace('Gestión de Citas')).not.toBeInTheDocument()
        expect(enlace('Administración')).not.toBeInTheDocument()
    })

    it('el cliente ve Mis Citas y no los enlaces de otros roles', () => {
        iniciarSesion(ROLES.CLIENTE)
        renderNavbar()

        expect(enlace('Mis Citas')).toBeInTheDocument()
        expect(enlace('Gestión de Citas')).not.toBeInTheDocument()
        expect(enlace('Administración')).not.toBeInTheDocument()
        expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
    })

    it('recepción ve Gestión de Citas y no Mis Citas', () => {
        iniciarSesion(ROLES.RECEPCION)
        renderNavbar()

        expect(enlace('Gestión de Citas')).toBeInTheDocument()
        expect(enlace('Mis Citas')).not.toBeInTheDocument()
        expect(enlace('Administración')).not.toBeInTheDocument()
    })

    it('el administrador ve Administración', () => {
        iniciarSesion(ROLES.ADMIN)
        renderNavbar()

        expect(enlace('Administración')).toBeInTheDocument()
        expect(enlace('Mis Citas')).not.toBeInTheDocument()
        expect(enlace('Gestión de Citas')).not.toBeInTheDocument()
    })

    it('cerrar sesión borra la sesión, avisa el cambio y vuelve a mostrar Iniciar Sesión', () => {
        iniciarSesion(ROLES.ADMIN)
        const escuchar = vi.fn()
        window.addEventListener(EVENTO_SESION, escuchar)

        renderNavbar()
        fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

        expect(localStorage.getItem('userSession')).toBeNull()
        expect(escuchar).toHaveBeenCalled()
        expect(enlace('Iniciar Sesión')).toBeInTheDocument()
        expect(enlace('Administración')).not.toBeInTheDocument()

        window.removeEventListener(EVENTO_SESION, escuchar)
    })

    it('se actualiza cuando alguien inicia sesión después de cargar', () => {
        renderNavbar()
        expect(enlace('Mis Citas')).not.toBeInTheDocument()

        act(() => {
            iniciarSesion(ROLES.CLIENTE)
            avisarCambioSesion()
        })

        expect(enlace('Mis Citas')).toBeInTheDocument()
    })
})