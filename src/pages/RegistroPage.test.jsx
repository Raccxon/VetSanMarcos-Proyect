import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegistroPage from './RegistroPage'

// Se reemplaza useNavigate por un spy para comprobar a dónde se redirige
const navegar = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => ({
    ...(await importOriginal()),
    useNavigate: () => navegar,
}))

const renderPagina = () =>
    render(
        <MemoryRouter>
            <RegistroPage />
        </MemoryRouter>
    )

const llenar = (campos = {}) => {
    const valores = {
        'Nombre completo': 'Ana Pérez',
        'Correo electrónico': 'ana@correo.cl',
        'Contraseña': 'abcd',
        'Confirmar contraseña': 'abcd',
        ...campos,
    }
    Object.entries(valores).forEach(([etiqueta, value]) => {
        fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } })
    })
}

const enviar = () => fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }))

const usuariosGuardados = () => JSON.parse(localStorage.getItem('usuariosRegistrados') || '[]')

beforeEach(() => {
    localStorage.clear()
    navegar.mockClear()
})

afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
})

describe('RegistroPage', () => {
    it('no envía el formulario si falta un campo obligatorio', () => {
        renderPagina()

        llenar({ 'Nombre completo': '' })
        enviar()

        // el navegador bloquea el envío: el campo queda inválido y no se guarda nada
        expect(screen.getByLabelText('Nombre completo')).toBeInvalid()
        expect(usuariosGuardados()).toHaveLength(0)
    })

    it('rechaza una contraseña de menos de 4 caracteres', () => {
        renderPagina()

        llenar({ 'Contraseña': 'abc', 'Confirmar contraseña': 'abc' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('al menos 4 caracteres')
    })

    it('rechaza contraseñas que no coinciden', () => {
        renderPagina()

        llenar({ 'Confirmar contraseña': 'otra' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden')
        expect(usuariosGuardados()).toHaveLength(0)
    })

    it('rechaza un correo ya registrado, sin importar mayúsculas', () => {
        localStorage.setItem('usuariosRegistrados', JSON.stringify([
            { nombre: 'Otra', email: 'ana@correo.cl', password: 'xxxx', rol: 'cliente' },
        ]))
        renderPagina()

        llenar({ 'Correo electrónico': 'ANA@correo.cl' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('Este correo electrónico ya está registrado')
        expect(usuariosGuardados()).toHaveLength(1)
    })

    it('no permite registrar el correo del administrador', () => {
        renderPagina()

        llenar({ 'Correo electrónico': 'admin@gmail.cl' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('ya está registrado')
    })

    it('registra un cliente nuevo y redirige al login', () => {
        vi.useFakeTimers()
        renderPagina()

        llenar({ 'Correo electrónico': 'Ana@Correo.cl' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('¡Registro exitoso!')
        expect(usuariosGuardados()).toEqual([
            { nombre: 'Ana Pérez', email: 'ana@correo.cl', password: 'abcd', rol: 'cliente' },
        ])

        act(() => vi.advanceTimersByTime(1500))
        expect(navegar).toHaveBeenCalledWith('/login')
    })
})