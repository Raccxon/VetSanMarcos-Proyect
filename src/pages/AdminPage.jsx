import { useEffect, useState } from 'react'
import { ROLES } from '../constants/roles'

const CLAVE_STORAGE = 'usuariosAdmin'

// Texto que se muestra al usuario para cada rol (el valor guardado es el de ROLES)
const ETIQUETAS_ROL = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.RECEPCION]: 'Recepcionista',
  [ROLES.CLIENTE]: 'Cliente',
}

const USUARIOS_INICIALES = [
  { id: 1, nombre: 'Ana López', email: 'alopez@sanmarcos.cl', rol: ROLES.ADMIN, estado: 'Activo' },
  { id: 2, nombre: 'Carlos Gómez', email: 'cgomez@sanmarcos.cl', rol: ROLES.RECEPCION, estado: 'Activo' },
  { id: 3, nombre: 'Juan Pérez', email: 'jperez@gmail.com', rol: ROLES.CLIENTE, estado: 'Activo' },
]

const FORM_VACIO = { nombre: '', email: '', rol: ROLES.CLIENTE }

// Lee los usuarios guardados; si no hay (o están dañados) usa los iniciales
function cargarUsuarios() {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE_STORAGE))
    return Array.isArray(guardados) ? guardados : USUARIOS_INICIALES
  } catch {
    return USUARIOS_INICIALES
  }
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState(cargarUsuarios)
  const [form, setForm] = useState(FORM_VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [errores, setErrores] = useState({})

  // Cada vez que cambia la lista se guarda para que no se pierda al recargar
  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(usuarios))
  }, [usuarios])

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

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const limpiarFormulario = () => {
    setForm(FORM_VACIO)
    setEditandoId(null)
    setErrores({})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validar()) return

    const datos = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      rol: form.rol,
    }

    if (editandoId !== null) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === editandoId ? { ...u, ...datos } : u))
      )
    } else {
      setUsuarios((prev) => [...prev, { id: Date.now(), ...datos, estado: 'Activo' }])
    }

    limpiarFormulario()
  }

  const handleEditar = (usuario) => {
    setForm({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol })
    setEditandoId(usuario.id)
    setErrores({})
  }

  const handleToggleEstado = (id) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' }
          : u
      )
    )
  }

  const handleEliminar = (id) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id))
    if (id === editandoId) limpiarFormulario()
  }

  return (
    <div className="container py-4">
      <h1>Panel de Administración de Usuarios</h1>
      <p className="text-muted mb-4">
        Módulo exclusivo para Administradores: gestión de cuentas y roles de acceso.
      </p>

      {/* Formulario crear / editar */}
      <div className="card bg-light mb-4">
        <div className="card-body">
          <h2 className="h4 mb-3">
            {editandoId !== null ? 'Editar usuario' : 'Registrar nuevo usuario'}
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-12 col-md-4">
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

              <div className="col-12 col-md-4">
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

              <div className="col-12 col-md-4">
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
                <button type="submit" className="btn btn-success">
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
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td><strong>{ETIQUETAS_ROL[u.rol] ?? u.rol}</strong></td>
                <td>
                  <span className={`badge ${u.estado === 'Activo' ? 'text-bg-success' : 'text-bg-danger'}`}>
                    {u.estado}
                  </span>
                </td>
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
                      className={`btn btn-sm ${u.estado === 'Activo' ? 'btn-warning' : 'btn-info'}`}
                      aria-label={`${u.estado === 'Activo' ? 'Desactivar' : 'Activar'} ${u.nombre}`}
                      onClick={() => handleToggleEstado(u.id)}
                    >
                      {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      aria-label={`Eliminar ${u.nombre}`}
                      onClick={() => handleEliminar(u.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}