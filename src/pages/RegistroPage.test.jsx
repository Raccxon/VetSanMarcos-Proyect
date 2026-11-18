import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegistroPage from './RegistroPage'
import { registrar } from '../services/authService'

// Se reemplaza useNavigate por un spy para comprobar a dónde se redirige
const navegar = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => ({
    ...(await importOriginal()),
    useNavigate: () => navegar,
}))

// Se reemplaza el servicio: el test no necesita el backend encendido
vi.mock('../services/authService', () => ({
    registrar: vi.fn(),
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
        'RUT': '12345678-9',
        'Teléfono': '912345678',
        'Contraseña': 'abcd',
        'Confirmar contraseña': 'abcd',
        ...campos,
    }
    Object.entries(valores).forEach(([etiqueta, value]) => {
        fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } })
    })
}

const enviar = () => fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }))

beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
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

        // el navegador bloquea el envío: el campo queda inválido y no se llama al backend
        expect(screen.getByLabelText('Nombre completo')).toBeInvalid()
        expect(registrar).not.toHaveBeenCalled()
    })

    it('rechaza una contraseña de menos de 4 caracteres', () => {
        renderPagina()

        llenar({ 'Contraseña': 'abc', 'Confirmar contraseña': 'abc' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('al menos 4 caracteres')
        expect(registrar).not.toHaveBeenCalled()
    })

    it('rechaza contraseñas que no coinciden', () => {
        renderPagina()

        llenar({ 'Confirmar contraseña': 'otra' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden')
        expect(registrar).not.toHaveBeenCalled()
    })

    it('muestra el mensaje del backend cuando el correo ya está registrado', async () => {
        registrar.mockRejectedValue(new Error('Ya existe un usuario con ese correo'))
        renderPagina()

        llenar()
        enviar()

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un usuario con ese correo')
        expect(navegar).not.toHaveBeenCalled()
    })

    it('si no hay conexión con el servidor muestra el error', async () => {
        registrar.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
        renderPagina()

        llenar()
        enviar()

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar')
    })

    it('rechaza un RUT con formato inválido', () => {
        renderPagina()

        llenar({ 'RUT': '123' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('El RUT debe tener formato 12345678-9')
        expect(registrar).not.toHaveBeenCalled()
    })

    it('rechaza un teléfono que no es un celular chileno', () => {
        renderPagina()

        llenar({ 'Teléfono': '12345' })
        enviar()

        expect(screen.getByRole('alert')).toHaveTextContent('celular chileno válido')
        expect(registrar).not.toHaveBeenCalled()
    })

    it('formatea el RUT mientras se escribe', () => {
        renderPagina()

        fireEvent.change(screen.getByLabelText('RUT'), { target: { value: '12.345.678-k' } })

        expect(screen.getByLabelText('RUT')).toHaveValue('12345678-K')
    })

    it('muestra el mensaje del backend cuando el RUT ya está registrado', async () => {
        registrar.mockRejectedValue(new Error('Ya existe un usuario con ese RUT'))
        renderPagina()

        llenar()
        enviar()

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un usuario con ese RUT')
        expect(navegar).not.toHaveBeenCalled()
    })

    it('registra un cliente nuevo enviando nombre, correo, RUT, teléfono y clave, y redirige al login', async () => {
        registrar.mockResolvedValue({})
        vi.useFakeTimers({ toFake: ['setTimeout'] })
        renderPagina()

        // el teléfono se escribe con +56 y espacios, pero al backend llegan solo los 9 dígitos
        llenar({ 'Correo electrónico': 'Ana@Correo.cl', 'Teléfono': '+56 9 1234 5678' })
        enviar()

        // deja resolver la promesa del backend y avanza el reloj simulado
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1500)
        })

        expect(registrar).toHaveBeenCalledWith({
            nombre: 'Ana Pérez',
            email: 'Ana@Correo.cl',
            rut: '12345678-9',
            telefono: '912345678',
            password: 'abcd',
        })
        expect(screen.getByRole('alert')).toHaveTextContent('¡Registro exitoso!')
        expect(navegar).toHaveBeenCalledWith('/login')
    })
})