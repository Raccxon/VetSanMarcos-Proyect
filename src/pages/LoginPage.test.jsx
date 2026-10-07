import {
  beforeEach,
  describe,
  expect,
  it
} from 'vitest'

import {
  fireEvent,
  render,
  screen
} from '@testing-library/react'

import LoginPage from './LoginPage'

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
      screen.getByLabelText(
        'Correo Electrónico'
      ),
      {
        target: {
          value: 'admin@sanmarcos.cl'
        }
      }
    )

    fireEvent.change(
      screen.getByLabelText(
        'Contraseña'
      ),
      {
        target: {
          value: '123456'
        }
      }
    )

    fireEvent.change(
      screen.getByLabelText(
        /Seleccionar Rol/
      ),
      {
        target: {
          value: 'admin'
        }
      }
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Iniciar Sesión'
      })
    )

    expect(
      screen.getByText(
        '¡Sesión Iniciada!'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Administrador Sistema'
      )
    ).toBeInTheDocument()

    expect(
      JSON.parse(
        localStorage.getItem(
          'userSession'
        )
      )
    ).toEqual({
      email: 'admin@sanmarcos.cl',
      rol: 'admin',
      nombre: 'Administrador Sistema'
    })
  })

})