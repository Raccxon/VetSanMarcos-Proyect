import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegistroPage from './RegistroPage'
import { registrar } from '../services/authService'

const navegar = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => ({
    ...(await importOriginal()),
    useNavigate: () => navegar,
}))

vi.mock('../services/authService', () => ({
    registrar: vi.fn(),
}))

const renderPagina = () =>
    render(
        <MemoryRouter>
            <RegistroPage />
        </MemoryRouter>
    )

const ETIQUETAS = {
    nombre: /^Nombre/,
    apellido: /^Apellido/,
    email: /^Correo/,
    rut: /^RUT/,
    telefono: /^Teléfono/,
    password: /^Contraseña/,
    confirmarPassword: /^Confirmar contraseña/,
}

const llenar = (campos = {}) => {
    const valores = {
        nombre: 'Ana',
        apellido: 'Pérez',
        email: 'ana@correo.cl',
        rut: '123456785',
        telefono: '912345678',
        password: 'Abcdefg1',
        confirmarPassword: 'Abcdefg1',
        ...campos,
    }
    Object.entries(valores).forEach(([campo, value]) => {
        fireEvent.change(screen.getByLabelText(ETIQUETAS[campo]), { target: { value } })
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
    it('indica desde el inicio que los campos con * son obligatorios', () => {
        renderPagina()

        expect(screen.getByText(/son obligatorios/i)).toBeInTheDocument()
    })

    it('muestra la guía de requisitos de la contraseña sin escribir nada', () => {
        renderPagina()

        expect(screen.getByText(/Mínimo 8 caracteres/)).toBeInTheDocument()
        expect(screen.getByText(/Una letra mayúscula/)).toBeInTheDocument()
        expect(screen.getByText(/Una letra minúscula/)).toBeInTheDocument()
        expect(screen.getByText(/Un número/)).toBeInTheDocument()
    })

    it('marca en verde los requisitos de la contraseña que se van cumpliendo', () => {
        renderPagina()

        fireEvent.change(screen.getByLabelText(ETIQUETAS.password), { target: { value: 'Abcdefg1' } })

        expect(screen.getByText(/Una letra mayúscula/)).toHaveClass('text-success')
        expect(screen.getByText(/Un número/)).toHaveClass('text-success')
    })

    it('con el formulario vacío muestra qué falta y no llama al backend', () => {
        renderPagina()

        enviar()

        expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
        expect(screen.getByText('El apellido es obligatorio')).toBeInTheDocument()
        expect(screen.getByText('El correo electrónico es obligatorio')).toBeInTheDocument()
        expect(screen.getByText('El RUT es obligatorio')).toBeInTheDocument()
        expect(screen.getByText('El teléfono es obligatorio')).toBeInTheDocument()
        expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
        expect(registrar).not.toHaveBeenCalled()
    })

    it('da formato al RUT con puntos y guion mientras se escribe', () => {
        renderPagina()

        fireEvent.change(screen.getByLabelText(ETIQUETAS.rut), { target: { value: '123456785' } })

        expect(screen.getByLabelText(ETIQUETAS.rut)).toHaveValue('12.345.678-5')
    })

    it('limita el RUT a 8 dígitos más el verificador', () => {
        renderPagina()

        fireEvent.change(screen.getByLabelText(ETIQUETAS.rut), { target: { value: '1234567891234' } })

        expect(screen.getByLabelText(ETIQUETAS.rut)).toHaveValue('12.345.678-9')
    })

    it('rechaza un RUT con dígito verificador incorrecto', () => {
        renderPagina()

        llenar({ rut: '123456789' })
        enviar()

        expect(screen.getByText(/dígito verificador/i)).toBeInTheDocument()
        expect(registrar).not.toHaveBeenCalled()
    })

    it('el teléfono solo acepta dígitos y respeta el largo del país', () => {
        renderPagina()

        fireEvent.change(screen.getByLabelText(ETIQUETAS.telefono), { target: { value: '9123-456789012' } })

        expect(screen.getByLabelText(ETIQUETAS.telefono)).toHaveValue('912345678')
    })

    it('al cambiar de país cambia el prefijo y el largo del teléfono', () => {
        renderPagina()

        fireEvent.change(screen.getByLabelText(/^País/), { target: { value: 'CO' } })

        expect(screen.getByText('+57', { selector: '.input-group-text' })).toBeInTheDocument()
        expect(screen.getByLabelText(ETIQUETAS.telefono)).toHaveAttribute('maxlength', '10')
    })

    it('rechaza un celular chileno que no empieza con 9', () => {
        renderPagina()

        llenar({ telefono: '812345678' })
        enviar()

        expect(screen.getByText(/empezar con 9/i)).toBeInTheDocument()
        expect(registrar).not.toHaveBeenCalled()
    })

    it('rechaza una contraseña que no cumple los requisitos', () => {
        renderPagina()

        llenar({ password: 'abcd', confirmarPassword: 'abcd' })
        enviar()

        expect(screen.getByText('La contraseña no cumple los requisitos')).toBeInTheDocument()
        expect(registrar).not.toHaveBeenCalled()
    })

    it('rechaza contraseñas que no coinciden', () => {
        renderPagina()

        llenar({ confirmarPassword: 'Otra1234' })
        enviar()

        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
        expect(registrar).not.toHaveBeenCalled()
    })

    it('el botón Mostrar deja ver las contraseñas', () => {
        renderPagina()

        fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseñas' }))

        expect(screen.getByLabelText(ETIQUETAS.password)).toHaveAttribute('type', 'text')
        expect(screen.getByLabelText(ETIQUETAS.confirmarPassword)).toHaveAttribute('type', 'text')
    })

    it('muestra el mensaje del backend cuando el correo ya está registrado', async () => {
        registrar.mockRejectedValue(new Error('Ya existe un usuario con ese correo'))
        renderPagina()

        llenar()
        enviar()

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un usuario con ese correo')
        expect(navegar).not.toHaveBeenCalled()
    })

    it('muestra el mensaje del backend cuando el RUT ya está registrado', async () => {
        registrar.mockRejectedValue(new Error('Ya existe un usuario con ese RUT'))
        renderPagina()

        llenar()
        enviar()

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un usuario con ese RUT')
        expect(navegar).not.toHaveBeenCalled()
    })

    it('si no hay conexión con el servidor muestra el error', async () => {
        registrar.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
        renderPagina()

        llenar()
        enviar()

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar')
    })

    it('registra al cliente enviando nombre completo, RUT sin puntos y teléfono con código de país', async () => {
        registrar.mockResolvedValue({})
        vi.useFakeTimers({ toFake: ['setTimeout'] })
        renderPagina()

        llenar({ email: 'Ana@Correo.cl' })
        enviar()

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1500)
        })

        expect(registrar).toHaveBeenCalledWith({
            nombre: 'Ana Pérez',
            email: 'Ana@Correo.cl',
            rut: '12345678-5',
            telefono: '+56912345678',
            password: 'Abcdefg1',
        })
        expect(screen.getByRole('alert')).toHaveTextContent('¡Registro exitoso!')
        expect(navegar).toHaveBeenCalledWith('/login')
    })
})