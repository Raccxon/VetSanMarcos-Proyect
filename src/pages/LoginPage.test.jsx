import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { login } from '../services/authService'

// Reemplazamos el servicio: así el test no necesita el backend encendido
vi.mock('../services/authService', () => ({
  login: vi.fn()
}))

// JWT falso con vencimiento en 1 hora (el front solo lee la fecha "exp")
const tokenVigente = () =>
  `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`

const renderConRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

const completarYEnviar = (email, password) => {
  fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('no llama al backend si faltan campos', () => {
    renderConRouter(<LoginPage />)

    // los inputs tienen "required", así que probamos la validación del código con el formulario directo
    fireEvent.submit(screen.getByRole('button', { name: /Iniciar Sesión/i }).closest('form'))

    expect(screen.getByRole('alert')).toHaveTextContent(/complete todos los campos/i)
    expect(login).not.toHaveBeenCalled()
  })

  it('ya no permite elegir el rol manualmente', () => {
    renderConRouter(<LoginPage />)
    expect(screen.queryByLabelText(/Rol/i)).not.toBeInTheDocument()
  })

  it('un login correcto guarda token y rol de admin en la sesión', async () => {
    const token = tokenVigente()
    login.mockResolvedValue({ token, id: 1, nombre: 'Administrador', email: 'admin@sanmarcos.cl', rol: 'admin' })
    renderConRouter(<LoginPage />)

    completarYEnviar('admin@sanmarcos.cl', '1234')

    await waitFor(() => {
      const session = JSON.parse(localStorage.getItem('userSession'))
      expect(session.rol).toBe('admin')
      expect(session.token).toBe(token)
    })
    expect(login).toHaveBeenCalledWith('admin@sanmarcos.cl', '1234')
    expect(await screen.findByText(/Sesión Iniciada/i)).toBeInTheDocument()
  })

  it('un cliente inicia sesión con el rol que entrega el backend', async () => {
    login.mockResolvedValue({ token: tokenVigente(), id: 7, nombre: 'Ana', email: 'ana@correo.cl', rol: 'cliente' })
    renderConRouter(<LoginPage />)

    completarYEnviar('ana@correo.cl', '1234')

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('userSession')).rol).toBe('cliente')
    })
  })

  it('con credenciales incorrectas muestra el mensaje del backend y no guarda sesión', async () => {
    login.mockRejectedValue(new Error('Correo o contraseña incorrectos'))
    renderConRouter(<LoginPage />)

    completarYEnviar('admin@sanmarcos.cl', 'clave_incorrecta')

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
    expect(localStorage.getItem('userSession')).toBeNull()
  })

  it('si no hay conexión con el servidor muestra el error', async () => {
    login.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
    renderConRouter(<LoginPage />)

    completarYEnviar('ana@correo.cl', '1234')

    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo conectar/i)
  })

  it('muestra la sesión ya iniciada al abrir la página (persiste tras recargar)', () => {
    localStorage.setItem('userSession', JSON.stringify({ token: tokenVigente(), email: 'test@test.cl', rol: 'cliente', nombre: 'Test' }))
    renderConRouter(<LoginPage />)

    expect(screen.getByText(/Sesión Iniciada/i)).toBeInTheDocument()
  })

  it('una sesión con token vencido no se muestra y vuelve al formulario', () => {
    const vencido = `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 10 }))}.firma`
    localStorage.setItem('userSession', JSON.stringify({ token: vencido, email: 'test@test.cl', rol: 'cliente', nombre: 'Test' }))
    renderConRouter(<LoginPage />)

    expect(screen.queryByText(/Sesión Iniciada/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument()
  })

  it('cerrar sesión borra la sesión y vuelve al formulario', () => {
    localStorage.setItem('userSession', JSON.stringify({ token: tokenVigente(), email: 'test@test.cl', rol: 'cliente', nombre: 'Test' }))
    renderConRouter(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }))

    expect(localStorage.getItem('userSession')).toBeNull()
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument()
  })
})