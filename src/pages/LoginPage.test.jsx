import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import LoginPage from './LoginPage'
import { EVENTO_SESION } from '../utils/sesionEventos'

const escribir = (email, password) => {
  fireEvent.change(screen.getByLabelText('Correo Electrónico'), {
    target: { value: email }
  })
  fireEvent.change(screen.getByLabelText('Contraseña'), {
    target: { value: password }
  })
}

const enviar = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }))

beforeEach(() => {
  localStorage.clear()
})

describe('LoginPage', () => {
  it('muestra error cuando faltan credenciales', () => {
    render(<LoginPage />)

    enviar()

    expect(
      screen.getByText('Por favor complete todos los campos')
    ).toBeInTheDocument()
  })

  it('ya no permite elegir el rol manualmente', () => {
    render(<LoginPage />)

    expect(screen.queryByLabelText(/Seleccionar Rol/)).not.toBeInTheDocument()
  })

  it('admin@gmail.cl con 1234 inicia sesión como administrador', () => {
    render(<LoginPage />)

    escribir('admin@gmail.cl', '1234')
    enviar()

    expect(screen.getByText('¡Sesión Iniciada!')).toBeInTheDocument()
    expect(screen.getByText('Administrador Sistema')).toBeInTheDocument()

    expect(JSON.parse(localStorage.getItem('userSession'))).toEqual({
      email: 'admin@gmail.cl',
      rol: 'admin',
      nombre: 'Administrador Sistema'
    })
  })

  it('cualquier otro usuario inicia sesión como cliente', () => {
    render(<LoginPage />)

    escribir('ana@correo.cl', 'abcd')
    enviar()

    expect(screen.getByText('Dueño de Mascota')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('userSession')).rol).toBe('cliente')
  })

  it('el correo admin con clave incorrecta NO obtiene rol admin', () => {
    render(<LoginPage />)

    escribir('admin@gmail.cl', 'clave-mala')
    enviar()

    expect(JSON.parse(localStorage.getItem('userSession')).rol).toBe('cliente')
  })

  it('muestra la sesión ya iniciada al abrir la página', () => {
    localStorage.setItem(
      'userSession',
      JSON.stringify({
        email: 'recep@sanmarcos.cl',
        rol: 'recepcion',
        nombre: 'Recepcionista San Marcos'
      })
    )

    render(<LoginPage />)

    expect(screen.getByText('¡Sesión Iniciada!')).toBeInTheDocument()
    expect(screen.getByText('Recepcionista San Marcos')).toBeInTheDocument()
    expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument()
  })

  it('cerrar sesión borra la sesión, avisa el cambio y vuelve al formulario', () => {
    localStorage.setItem(
      'userSession',
      JSON.stringify({
        email: 'ana@correo.cl',
        rol: 'cliente',
        nombre: 'Dueño de Mascota'
      })
    )

    // espía para comprobar que se avisa el cambio de sesión (lo escucha el Navbar)
    const escuchar = vi.fn()
    window.addEventListener(EVENTO_SESION, escuchar)

    render(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }))

    expect(localStorage.getItem('userSession')).toBeNull()
    expect(escuchar).toHaveBeenCalled()
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument()

    window.removeEventListener(EVENTO_SESION, escuchar)
  })
})