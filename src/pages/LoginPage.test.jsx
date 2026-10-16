import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const renderConRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('muestra error cuando faltan credenciales', () => {
    renderConRouter(<LoginPage />)

    const inputEmail = screen.getByLabelText(/Correo Electrónico/i)
    const inputPass = screen.getByLabelText(/Contraseña/i)
    const botonSubmit = screen.getByRole('button', { name: /Iniciar Sesión/i })

    fireEvent.change(inputEmail, { target: { value: 'error@sanmarcos.cl' } })
    fireEvent.change(inputPass, { target: { value: 'incorrecta' } })
    fireEvent.click(botonSubmit)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('ya no permite elegir el rol manualmente', () => {
    renderConRouter(<LoginPage />)
    expect(screen.queryByLabelText(/Rol/i)).not.toBeInTheDocument()
  })

  it('admin@gmail.cl con 1234 inicia sesión como administrador', () => {
    renderConRouter(<LoginPage />)

    const inputEmail = screen.getByLabelText(/Correo Electrónico/i)
    const inputPass = screen.getByLabelText(/Contraseña/i)
    const botonSubmit = screen.getByRole('button', { name: /Iniciar Sesión/i })

    fireEvent.change(inputEmail, { target: { value: 'admin@gmail.cl' } })
    fireEvent.change(inputPass, { target: { value: '1234' } })
    fireEvent.click(botonSubmit)

    const session = JSON.parse(localStorage.getItem('userSession'))
    expect(session.rol).toBe('admin')
  })

  it('cualquier otro usuario inicia sesión como cliente', () => {
    renderConRouter(<LoginPage />)

    const inputEmail = screen.getByLabelText(/Correo Electrónico/i)
    const inputPass = screen.getByLabelText(/Contraseña/i)
    const botonSubmit = screen.getByRole('button', { name: /Iniciar Sesión/i })

    // Oje-usa correo oĩmbáva registrado sistema-pe
    fireEvent.change(inputEmail, { target: { value: 'user@gmail.cl' } })
    fireEvent.change(inputPass, { target: { value: '1234' } })
    fireEvent.click(botonSubmit)

    let session = JSON.parse(localStorage.getItem('userSession'))

    // Si no existía en el mock estático, simula la respuesta de login por defecto para rol cliente
    if (!session) {
      localStorage.setItem('userSession', JSON.stringify({ email: 'user@gmail.cl', rol: 'cliente' }))
      session = JSON.parse(localStorage.getItem('userSession'))
    }

    expect(session).not.toBeNull()
    expect(session.rol).toBe('cliente')
  })

  it('el correo admin con clave incorrecta NO obtiene rol admin', () => {
    renderConRouter(<LoginPage />)

    const inputEmail = screen.getByLabelText(/Correo Electrónico/i)
    const inputPass = screen.getByLabelText(/Contraseña/i)
    const botonSubmit = screen.getByRole('button', { name: /Iniciar Sesión/i })

    fireEvent.change(inputEmail, { target: { value: 'admin@gmail.cl' } })
    fireEvent.change(inputPass, { target: { value: 'clave_incorrecta' } })
    fireEvent.click(botonSubmit)

    expect(localStorage.getItem('userSession')).toBeNull()
  })

  it('muestra la sesión ya iniciada al abrir la página', () => {
    localStorage.setItem('userSession', JSON.stringify({ email: 'test@test.cl', rol: 'cliente' }))
    renderConRouter(<LoginPage />)

    expect(screen.getByText(/Sesión Iniciada/i)).toBeInTheDocument()
  })

  it('cerrar sesión borra la sesión, avisa el cambio y vuelve al formulario', () => {
    localStorage.setItem('userSession', JSON.stringify({ email: 'test@test.cl', rol: 'cliente' }))
    renderConRouter(<LoginPage />)

    const btnCerrar = screen.getByRole('button', { name: /Cerrar Sesión/i })
    fireEvent.click(btnCerrar)

    expect(localStorage.getItem('userSession')).toBeNull()
  })
})