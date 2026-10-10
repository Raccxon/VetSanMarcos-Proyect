import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import AdminPage from './AdminPage'
import { ROLES } from '../constants/roles'

const CLAVE = 'usuariosAdmin'

const completarFormulario = ({ nombre, email, rol }) => {
  if (nombre !== undefined) {
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: nombre } })
  }
  if (email !== undefined) {
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } })
  }
  if (rol !== undefined) {
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: rol } })
  }
}

const guardados = () => JSON.parse(localStorage.getItem(CLAVE))

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AdminPage', () => {
  it('muestra los usuarios iniciales con su rol', () => {
    render(<AdminPage />)

    // 1 fila de encabezado + 3 usuarios
    expect(screen.getAllByRole('row')).toHaveLength(4)
    const fila = screen.getByText('Carlos Gómez').closest('tr')
    expect(within(fila).getByText('Recepcionista')).toBeInTheDocument()
  })

  it('el select de rol usa los valores de ROLES', () => {
    render(<AdminPage />)

    const valores = within(screen.getByLabelText('Rol'))
      .getAllByRole('option')
      .map((o) => o.value)

    expect(valores).toEqual(Object.values(ROLES))
  })

  it('muestra errores al enviar el formulario vacío', () => {
    render(<AdminPage />)

    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El correo electrónico es obligatorio')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('rechaza un correo con formato inválido', () => {
    render(<AdminPage />)

    completarFormulario({ nombre: 'Laura Soto', email: 'laura-sin-arroba' })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(screen.getByText('Ingrese un correo electrónico válido')).toBeInTheDocument()
    expect(screen.queryByText('Laura Soto')).not.toBeInTheDocument()
  })

  it('rechaza un correo que ya existe', () => {
    render(<AdminPage />)

    completarFormulario({ nombre: 'Otra Ana', email: 'ALOPEZ@sanmarcos.cl' })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(screen.getByText('Ya existe un usuario con ese correo')).toBeInTheDocument()
  })

  it('crea un usuario con el rol elegido y lo guarda', () => {
    render(<AdminPage />)

    completarFormulario({ nombre: 'Laura Soto', email: 'laura@sanmarcos.cl', rol: ROLES.RECEPCION })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    const fila = screen.getByText('Laura Soto').closest('tr')
    expect(within(fila).getByText('Recepcionista')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(5)
    expect(
      guardados().some((u) => u.email === 'laura@sanmarcos.cl' && u.rol === ROLES.RECEPCION)
    ).toBe(true)
  })

  it('edita un usuario existente', () => {
    render(<AdminPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Editar Juan Pérez' }))

    // el formulario se llena con los datos del usuario
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Juan Pérez')
    expect(screen.getByLabelText('Rol')).toHaveValue(ROLES.CLIENTE)

    completarFormulario({ nombre: 'Juan Pérez Soto', rol: ROLES.ADMIN })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    const fila = screen.getByText('Juan Pérez Soto').closest('tr')
    expect(within(fila).getByText('Administrador')).toBeInTheDocument()
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('cancelar la edición limpia el formulario', () => {
    render(<AdminPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Editar Ana López' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }))

    expect(screen.getByLabelText('Nombre completo')).toHaveValue('')
    expect(screen.getByRole('button', { name: '+ Crear usuario' })).toBeInTheDocument()
  })

  it('activa y desactiva un usuario', () => {
    render(<AdminPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Desactivar Ana López' }))

    const fila = screen.getByText('Ana López').closest('tr')
    expect(within(fila).getByText('Inactivo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Activar Ana López' })).toBeInTheDocument()
  })

  it('elimina un usuario y guarda el cambio', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem')
    render(<AdminPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Carlos Gómez' }))

    expect(screen.queryByText('Carlos Gómez')).not.toBeInTheDocument()
    expect(spy).toHaveBeenCalledWith(CLAVE, expect.any(String))
    expect(guardados()).toHaveLength(2)
  })

  it('carga los usuarios guardados en localStorage', () => {
    localStorage.setItem(
      CLAVE,
      JSON.stringify([
        { id: 10, nombre: 'Marta Díaz', email: 'marta@sanmarcos.cl', rol: ROLES.CLIENTE, estado: 'Activo' },
      ])
    )

    render(<AdminPage />)

    expect(screen.getByText('Marta Díaz')).toBeInTheDocument()
    expect(screen.queryByText('Ana López')).not.toBeInTheDocument()
  })
})