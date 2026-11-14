import { useEffect, useState } from 'react'
import { ROLES } from '../constants/roles'
import { obtenerSesion } from '../utils/sesion'
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../services/usuarioService'

// Texto que se muestra al usuario para cada rol (el valor guardado es el de ROLES)
const ETIQUETAS_ROL = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.RECEPCION]: 'Recepcionista',
  [ROLES.CLIENTE]: 'Cliente',
}

const FORM_VACIO = { nombre: '', email: '', password: '', rol: ROLES.CLIENTE }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  // Correo de quien tiene la sesión abierta: no puede eliminar su propia cuenta
  const miEmail = obtenerSesion()?.email?.toLowerCase()

  // Al abrir la pantalla se piden los usuarios reales al backend (GET /api/usuarios)
  useEffect(() => {
    let activo = true

    listarUsuarios()
      .then((datos) => {
        if (activo) setUsuarios(datos)
      })
      .catch((err) => {
        if (activo) setErrorGeneral(err.message)
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validar = () => {
    const nuevosErrores = {}
    const email = form.email.trim().toLowerCase()

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio'
    }

    if (!email) {
      nuevosErrores.email = 'El correo electrónico es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nuevosErrores.email = 'Ingrese un correo electrónico válido'
    } else if (usuarios.some((u) => u.id !== editandoId && u.email.toLowerCase() === email)) {
      nuevosErrores.email = 'Ya existe un usuario con ese correo'
    }

    // El backend exige contraseña tanto al crear como al editar
    if (!form.password) {
      nuevosErrores.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 4) {
      nuevosErrores.password = 'La contraseña debe tener al menos 4 caracteres'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const limpiarFormulario = () => {
    setForm(FORM_VACIO)
    setEditandoId(null)
    setErrores({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    const datos = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      password: form.password,
      rol: form.rol,
    }

    setGuardando(true)
    setErrorGeneral('')

    try {
      if (editandoId !== null) {
        const actualizado = await actualizarUsuario(editandoId, datos)
        setUsuarios((prev) => prev.map((u) => (u.id === editandoId ? actualizado : u)))
      } else {
        const creado = await crearUsuario(datos)
        setUsuarios((prev) => [...prev, creado])
      }
      limpiarFormulario()
    } catch (err) {
      // Ej.: correo repetido (409) o datos inválidos (400): se muestra el mensaje del backend
      setErrorGeneral(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (usuario) => {
    // La contraseña no se devuelve nunca desde el backend, por eso queda vacía
    setForm({ nombre: usuario.nombre, email: usuario.email, password: '', rol: usuario.rol })
    setEditandoId(usuario.id)
    setErrores({})
  }

  const handleEliminar = async (id) => {
    setErrorGeneral('')

    try {
      await eliminarUsuario(id)
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
      if (id === editandoId) limpiarFormulario()
    } catch (err) {
      setErrorGeneral(err.message)
    }
  }

  return (
    <div className="container py-4">
      <h1>Panel de Administración de Usuarios</h1>
      <p className="text-muted mb-4">
        Módulo exclusivo para Administradores: gestión de cuentas y roles de acceso.
      </p>

      {errorGeneral && (
        <div className="alert alert-danger" role="alert">
          {errorGeneral}
        </div>
      )}

      {/* Formulario crear / editar */}
      <div className="card bg-light mb-4">
        <div className="card-body">
          <h2 className="h4 mb-3">
            {editandoId !== null ? 'Editar usuario' : 'Registrar nuevo usuario'}
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label htmlFor="admin-nombre" className="form-label">Nombre completo</label>
                <input
                  id="admin-nombre"
                  name="nombre"
                  type="text"
                  className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                  value={form.nombre}
                  onChange={handleChange}
                />
                {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
              </div>

              <div className="col-12 col-md-3">
                <label htmlFor="admin-email" className="form-label">Correo electrónico</label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                />
                {errores.email && <div className="invalid-feedback">{errores.email}</div>}
              </div>

              <div className="col-12 col-md-3">
                <label htmlFor="admin-password" className="form-label">
                  {editandoId !== null ? 'Nueva contraseña' : 'Contraseña'}
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                />
                {errores.password && <div className="invalid-feedback">{errores.password}</div>}
              </div>

              <div className="col-12 col-md-3">
                <label htmlFor="admin-rol" className="form-label">Rol</label>
                <select
                  id="admin-rol"
                  name="rol"
                  className="form-select"
                  value={form.rol}
                  onChange={handleChange}
                >
                  {Object.values(ROLES).map((rol) => (
                    <option key={rol} value={rol}>{ETIQUETAS_ROL[rol]}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 d-flex flex-wrap gap-2">
                <button type="submit" className="btn btn-success" disabled={guardando}>
                  {editandoId !== null ? 'Guardar cambios' : '+ Crear usuario'}
                </button>
                {editandoId !== null && (
                  <button type="button" className="btn btn-outline-secondary" onClick={limpiarFormulario}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <h2 className="h4">Usuarios del Sistema</h2>

      {cargando ? (
        <p className="text-muted">Cargando usuarios...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const esMiCuenta = u.email.toLowerCase() === miEmail

                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td><strong>{ETIQUETAS_ROL[u.rol] ?? u.rol}</strong></td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <button
                          className="btn btn-sm btn-primary"
                          aria-label={`Editar ${u.nombre}`}
                          onClick={() => handleEditar(u)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          aria-label={`Eliminar ${u.nombre}`}
                          title={esMiCuenta ? 'No puedes eliminar tu propia cuenta' : undefined}
                          disabled={esMiCuenta}
                          onClick={() => handleEliminar(u.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}