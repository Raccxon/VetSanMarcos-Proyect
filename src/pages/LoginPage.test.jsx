import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  fireEvent,
  render,
  screen
} from '@testing-library/react'

import LoginPage from './LoginPage'
import { EVENTO_SESION } from '../utils/sesionEventos'

beforeEach(() => {
  localStorage.clear()
})

describe('LoginPage', () => {
  it('muestra error cuando faltan credenciales', () => {
    render(<LoginPage />)

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Iniciar Sesión'
      })
    )

    expect(
      screen.getByText(
        'Por favor complete todos los campos'
      )
    ).toBeInTheDocument()
  })

  it('guarda la sesión al iniciar correctamente', () => {
    render(<LoginPage />)

    fireEvent.change(
      screen.getByLabelText('Correo Electrónico'),
      {
        target: {
          value: 'admin@sanmarcos.cl'
        }
      }
    )

    fireEvent.change(
      screen.getByLabelText('Contraseña'),
      {
        target: {
          value: '123456'
        }
      }
    )

    fireEvent.change(
      screen.getByLabelText(/Seleccionar Rol/),
      {
        target: {
          value: "admin"
        }
      }
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Iniciar Sesión'
      })
    )

    expect(
      screen.getByText('¡Sesión Iniciada!')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Administrador Sistema')
    ).toBeInTheDocument()

    expect(
      JSON.parse(
        localStorage.getItem('userSession')
      )
    ).toEqual({
      email: 'admin@sanmarcos.cl',
      rol: "admin",
      nombre: 'Administrador Sistema'
    })
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

    expect(
      screen.getByText('¡Sesión Iniciada!')
    ).toBeInTheDocument()

    expect(
      screen.getByText('Recepcionista San Marcos')
    ).toBeInTheDocument()

    expect(
      screen.queryByLabelText('Contraseña')
    ).not.toBeInTheDocument()
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

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cerrar Sesión'
      })
    )

    expect(
      localStorage.getItem('userSession')
    ).toBeNull()

    expect(escuchar).toHaveBeenCalled()

    expect(
      screen.getByLabelText('Correo Electrónico')
    ).toBeInTheDocument()

    window.removeEventListener(EVENTO_SESION, escuchar)
  })
})