import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import UsuariosPage from './UsuariosPage'
import { ROLES } from '../constants/roles'
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../services/usuarioService'

// Se reemplaza el servicio: el test no necesita el backend encendido
vi.mock('../services/usuarioService', () => ({
  listarUsuarios: vi.fn(),
  crearUsuario: vi.fn(),
  actualizarUsuario: vi.fn(),
  eliminarUsuario: vi.fn(),
}))

// Lo que devolvería GET /api/usuarios (el backend nunca devuelve la contraseña)
const USUARIOS_BACKEND = [
  { id: 1, nombre: 'Administrador', email: 'admin@sanmarcos.cl', rol: ROLES.ADMIN },
  { id: 2, nombre: 'Recepcionista', email: 'recepcion@sanmarcos.cl', rol: ROLES.RECEPCION },
  { id: 3, nombre: 'Juan Pérez', email: 'jperez@gmail.com', rol: ROLES.CLIENTE },
]

const completarFormulario = ({ nombre, email, password, rol, rut, telefono }) => {
  if (nombre !== undefined) {
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: nombre } })
  }
  if (email !== undefined) {
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } })
  }
  if (password !== undefined) {
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: password } })
  }
  if (rol !== undefined) {
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: rol } })
  }
  if (rut !== undefined) {
    fireEvent.change(screen.getByLabelText('RUT'), { target: { value: rut } })
  }
  if (telefono !== undefined) {
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: telefono } })
  }
}

// Renderiza y espera a que termine la carga inicial
const renderCargada = async () => {
  render(<UsuariosPage />)
  await screen.findByText('Juan Pérez')
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  listarUsuarios.mockResolvedValue(USUARIOS_BACKEND)
})

describe('UsuariosPage', () => {
  it('muestra "Cargando" y luego los usuarios que entrega el backend', async () => {
    render(<UsuariosPage />)

    expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument()

    const fila = (await screen.findByText('Recepcionista', { selector: 'td' })).closest('tr')
    expect(within(fila).getByText('recepcion@sanmarcos.cl')).toBeInTheDocument()
    // 1 fila de encabezado + 3 usuarios
    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(listarUsuarios).toHaveBeenCalledTimes(1)
  })

  it('si el backend falla al cargar, muestra el error', async () => {
    listarUsuarios.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
    render(<UsuariosPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
  })

  it('el select de rol usa los valores de ROLES', async () => {
    await renderCargada()

    const valores = within(screen.getByLabelText('Rol'))
      .getAllByRole('option')
      .map((o) => o.value)

    expect(valores).toEqual(Object.values(ROLES))
  })

  it('muestra errores al enviar el formulario vacío y no llama al backend', async () => {
    await renderCargada()

    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El correo electrónico es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
    expect(crearUsuario).not.toHaveBeenCalled()
  })

  it('rechaza un correo con formato inválido', async () => {
    await renderCargada()

    completarFormulario({ nombre: 'Laura Soto', email: 'laura-sin-arroba', password: '1234' })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(screen.getByText('Ingrese un correo electrónico válido')).toBeInTheDocument()
    expect(crearUsuario).not.toHaveBeenCalled()
  })

  it('rechaza una contraseña de menos de 4 caracteres', async () => {
    await renderCargada()

    completarFormulario({ nombre: 'Laura Soto', email: 'laura@sanmarcos.cl', password: 'abc' })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(screen.getByText('La contraseña debe tener al menos 4 caracteres')).toBeInTheDocument()
    expect(crearUsuario).not.toHaveBeenCalled()
  })

  it('rechaza un correo que ya existe en la lista', async () => {
    await renderCargada()

    completarFormulario({ nombre: 'Otro Admin', email: 'ADMIN@sanmarcos.cl', password: '1234' })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(screen.getByText('Ya existe un usuario con ese correo')).toBeInTheDocument()
    expect(crearUsuario).not.toHaveBeenCalled()
  })

  it('crea un usuario enviando los datos al backend y lo agrega a la tabla', async () => {
    crearUsuario.mockResolvedValue({ id: 9, nombre: 'Laura Soto', email: 'laura@sanmarcos.cl', rol: ROLES.RECEPCION })
    await renderCargada()

    completarFormulario({ nombre: 'Laura Soto', email: 'laura@sanmarcos.cl', password: '1234', rol: ROLES.RECEPCION })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    const fila = (await screen.findByText('Laura Soto')).closest('tr')
    expect(within(fila).getByText('Recepcionista')).toBeInTheDocument()
    expect(crearUsuario).toHaveBeenCalledWith({
      nombre: 'Laura Soto',
      email: 'laura@sanmarcos.cl',
      password: '1234',
      rol: ROLES.RECEPCION,
    })
    expect(screen.getAllByRole('row')).toHaveLength(5)
    // el formulario queda limpio
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('')
  })

  it('si el backend rechaza la creación, muestra su mensaje y no agrega la fila', async () => {
    crearUsuario.mockRejectedValue(new Error('Ya existe un usuario con ese correo'))
    await renderCargada()

    completarFormulario({ nombre: 'Laura Soto', email: 'laura@sanmarcos.cl', password: '1234' })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un usuario con ese correo')
    expect(screen.queryByText('Laura Soto', { selector: 'td' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('edita un usuario existente y actualiza la fila con la respuesta del backend', async () => {
    actualizarUsuario.mockResolvedValue({ id: 3, nombre: 'Juan Pérez Soto', email: 'jperez@gmail.com', rol: ROLES.ADMIN })
    await renderCargada()

    fireEvent.click(screen.getByRole('button', { name: 'Editar Juan Pérez' }))

    // el formulario se llena con los datos del usuario; la contraseña queda vacía
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Juan Pérez')
    expect(screen.getByLabelText('Rol')).toHaveValue(ROLES.CLIENTE)
    expect(screen.getByLabelText('Nueva contraseña')).toHaveValue('')

    completarFormulario({ nombre: 'Juan Pérez Soto', password: 'nueva1', rol: ROLES.ADMIN })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    const fila = (await screen.findByText('Juan Pérez Soto')).closest('tr')
    expect(within(fila).getByText('Administrador')).toBeInTheDocument()
    expect(actualizarUsuario).toHaveBeenCalledWith(3, {
      nombre: 'Juan Pérez Soto',
      email: 'jperez@gmail.com',
      password: 'nueva1',
      rol: ROLES.ADMIN,
    })
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('al editar también exige la contraseña, porque el backend la pide', async () => {
    await renderCargada()

    fireEvent.click(screen.getByRole('button', { name: 'Editar Juan Pérez' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
    expect(actualizarUsuario).not.toHaveBeenCalled()
  })

  it('cancelar la edición limpia el formulario', async () => {
    await renderCargada()

    fireEvent.click(screen.getByRole('button', { name: 'Editar Juan Pérez' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }))

    expect(screen.getByLabelText('Nombre completo')).toHaveValue('')
    expect(screen.getByRole('button', { name: '+ Crear usuario' })).toBeInTheDocument()
  })

  it('elimina un usuario en el backend y lo quita de la tabla', async () => {
    eliminarUsuario.mockResolvedValue(null)
    await renderCargada()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Juan Pérez' }))

    await vi.waitFor(() => {
      expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument()
    })
    expect(eliminarUsuario).toHaveBeenCalledWith(3)
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('si el backend no deja eliminar, muestra el error y mantiene la fila', async () => {
    eliminarUsuario.mockRejectedValue(new Error('No tienes permiso para realizar esta acción'))
    await renderCargada()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Juan Pérez' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No tienes permiso')
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('no permite eliminar la cuenta con la que se inició sesión', async () => {
    localStorage.setItem('userSession', JSON.stringify({ email: 'admin@sanmarcos.cl', rol: 'admin', nombre: 'Administrador' }))
    await renderCargada()

    expect(screen.getByRole('button', { name: 'Eliminar Administrador' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminar Juan Pérez' })).toBeEnabled()
  })
  
  it('muestra el RUT y el teléfono de cada usuario, o un guion si no tiene', async () => {
    listarUsuarios.mockResolvedValue([
      ...USUARIOS_BACKEND.slice(0, 2),
      { ...USUARIOS_BACKEND[2], rut: '11111111-1', telefono: '912345678' },
    ])
    await renderCargada()

    const cliente = screen.getByText('Juan Pérez', { selector: 'td' }).closest('tr')
    expect(within(cliente).getByText('11111111-1')).toBeInTheDocument()
    expect(within(cliente).getByText('912345678')).toBeInTheDocument()

    const admin = screen.getByText('Administrador', { selector: 'td' }).closest('tr')
    expect(within(admin).getAllByText('—')).toHaveLength(2)
  })

  it('rechaza un RUT o un teléfono mal escritos, pero acepta dejarlos vacíos', async () => {
    await renderCargada()

    completarFormulario({ nombre: 'Laura Soto', email: 'laura@sanmarcos.cl', password: '1234', rut: '123', telefono: '12345' })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    expect(screen.getByText('El RUT debe tener formato 12345678-9')).toBeInTheDocument()
    expect(screen.getByText('Ingrese un celular chileno válido (ej: 912345678)')).toBeInTheDocument()
    expect(crearUsuario).not.toHaveBeenCalled()
  })

  it('envía el RUT y el teléfono normalizados cuando se escriben', async () => {
    crearUsuario.mockResolvedValue({ id: 9, nombre: 'Laura Soto', email: 'laura@sanmarcos.cl', rol: ROLES.CLIENTE })
    await renderCargada()

    completarFormulario({
      nombre: 'Laura Soto',
      email: 'laura@sanmarcos.cl',
      password: '1234',
      rut: '11.111.111-k',
      telefono: '+56 9 1234 5678',
    })
    fireEvent.click(screen.getByRole('button', { name: '+ Crear usuario' }))

    await screen.findByText('Laura Soto')
    expect(crearUsuario).toHaveBeenCalledWith({
      nombre: 'Laura Soto',
      email: 'laura@sanmarcos.cl',
      password: '1234',
      rol: ROLES.CLIENTE,
      rut: '11111111-K',
      telefono: '912345678',
    })
  })

  it('al editar carga el RUT y el teléfono del usuario en el formulario', async () => {
    listarUsuarios.mockResolvedValue([
      ...USUARIOS_BACKEND.slice(0, 2),
      { ...USUARIOS_BACKEND[2], rut: '11111111-1', telefono: '912345678' },
    ])
    await renderCargada()

    fireEvent.click(screen.getByRole('button', { name: 'Editar Juan Pérez' }))

    expect(screen.getByLabelText('RUT')).toHaveValue('11111111-1')
    expect(screen.getByLabelText('Teléfono')).toHaveValue('912345678')
  })
})