import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import { login } from '../services/authService'

vi.mock('../services/authService', () => ({
  login: vi.fn()
}))

const tokenVigente = () =>
  `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.firma`

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<p>Pantalla de inicio</p>} />
        <Route path="/admin" element={<p>Pantalla del dashboard</p>} />
      </Routes>
    </MemoryRouter>
  )

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
    renderLogin()

    fireEvent.submit(screen.getByRole('button', { name: /Iniciar Sesión/i }).closest('form'))

    expect(screen.getByRole('alert')).toHaveTextContent(/complete todos los campos/i)
    expect(login).not.toHaveBeenCalled()
  })

  it('no permite elegir el rol manualmente', () => {
    renderLogin()
    expect(screen.queryByLabelText(/Rol/i)).not.toBeInTheDocument()
  })

  it('el administrador va directo al dashboard', async () => {
    const token = tokenVigente()
    login.mockResolvedValue({ token, id: 1, nombre: 'Administrador', email: 'admin@sanmarcos.cl', rol: 'admin' })
    renderLogin()

    completarYEnviar('admin@sanmarcos.cl', '1234')

    expect(await screen.findByText('Pantalla del dashboard')).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith('admin@sanmarcos.cl', '1234')
    expect(JSON.parse(localStorage.getItem('userSession')).token).toBe(token)
  })

  it('un cliente va a la pantalla de inicio', async () => {
    login.mockResolvedValue({ token: tokenVigente(), id: 7, nombre: 'Ana', email: 'ana@correo.cl', rol: 'cliente' })
    renderLogin()

    completarYEnviar('ana@correo.cl', '1234')

    expect(await screen.findByText('Pantalla de inicio')).toBeInTheDocument()
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('userSession')).rol).toBe('cliente')
    })
  })

  it('con credenciales incorrectas muestra el mensaje del backend y no guarda sesión', async () => {
    login.mockRejectedValue(new Error('Correo o contraseña incorrectos'))
    renderLogin()

    completarYEnviar('admin@sanmarcos.cl', 'clave_incorrecta')

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
    expect(localStorage.getItem('userSession')).toBeNull()
  })

  it('si no hay conexión con el servidor muestra el error', async () => {
    login.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
    renderLogin()

    completarYEnviar('ana@correo.cl', '1234')

    expect(await screen.findByRole('alert')).toHaveTextContent(/No se pudo conectar/i)
  })

  it('con sesión de cliente ya iniciada, /login redirige al inicio', () => {
    localStorage.setItem('userSession', JSON.stringify({ token: tokenVigente(), email: 'test@test.cl', rol: 'cliente', nombre: 'Test' }))
    renderLogin()

    expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument()
  })

  it('con sesión de admin ya iniciada, /login redirige al dashboard', () => {
    localStorage.setItem('userSession', JSON.stringify({ token: tokenVigente(), email: 'admin@sanmarcos.cl', rol: 'admin', nombre: 'Admin' }))
    renderLogin()

    expect(screen.getByText('Pantalla del dashboard')).toBeInTheDocument()
  })

  it('una sesión con token vencido vuelve al formulario', () => {
    const vencido = `cabecera.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 10 }))}.firma`
    localStorage.setItem('userSession', JSON.stringify({ token: vencido, email: 'test@test.cl', rol: 'cliente', nombre: 'Test' }))
    renderLogin()

    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument()
  })
})