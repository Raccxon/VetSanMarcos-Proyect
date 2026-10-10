import { useState } from 'react'
import { ROLES } from '../constants/roles'
import { obtenerSesion } from '../utils/sesion'
import { avisarCambioSesion } from '../utils/sesionEventos'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rol: ROLES.CLIENTE
  })

  const [error, setError] = useState('')
  const [usuarioLogueado, setUsuarioLogueado] = useState(obtenerSesion)

  const handleChange = (e) => {
    const { name, value } = e.target

    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!credentials.email || !credentials.password) {
      setError('Por favor complete todos los campos')
      return
    }

    setError('')

    const mockUser = {
      email: credentials.email,
      rol: credentials.rol,
      nombre:
        credentials.rol === ROLES.ADMIN
          ? 'Administrador Sistema'
          : credentials.rol === ROLES.RECEPCION
            ? 'Recepcionista San Marcos'
            : 'Dueño de Mascota'
    }

    setUsuarioLogueado(mockUser)

    localStorage.setItem(
      'userSession',
      JSON.stringify(mockUser)
    )

    // Avisa al Navbar para que actualice sus enlaces
    avisarCambioSesion()
  }

  const handleLogout = () => {
    localStorage.removeItem('userSession')
    setUsuarioLogueado(null)

    // Avisa al Navbar para que actualice sus enlaces
    avisarCambioSesion()

    setCredentials({
      email: '',
      password: '',
      rol: ROLES.CLIENTE
    })
  }

  return (
    <div className="container py-5">
      <div
        className="card shadow-sm mx-auto"
        style={{ maxWidth: '450px' }}
      >
        <div className="card-body p-4">
          <h2 className="text-center mb-2">
            Acceso al Sistema
          </h2>

          <p className="text-center text-muted mb-4">
            Veterinaria San Marcos - Portal Web
          </p>

          {usuarioLogueado ? (
            <div className="text-center">
              <div className="alert alert-success">
                <h3 className="h5 mb-2">
                  ¡Sesión Iniciada!
                </h3>

                <p className="mb-1">
                  <strong>Usuario:</strong>{' '}
                  {usuarioLogueado.nombre}
                </p>

                <p className="mb-0">
                  <strong>Rol:</strong>{' '}
                  {usuarioLogueado.rol.toUpperCase()}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-danger w-100"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  className="alert alert-danger text-center"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label
                  htmlFor="login-email"
                  className="form-label fw-bold"
                >
                  Correo Electrónico
                </label>

                <input
                  type="email"
                  id="login-email"
                  name="email"
                  autoComplete="email"
                  className="form-control"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="usuario@sanmarcos.cl"
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="login-password"
                  className="form-label fw-bold"
                >
                  Contraseña
                </label>

                <input
                  type="password"
                  id="login-password"
                  name="password"
                  autoComplete="current-password"
                  className="form-control"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="login-rol"
                  className="form-label fw-bold"
                >
                  Seleccionar Rol (Simulación P2)
                </label>

                <select
                  id="login-rol"
                  name="rol"
                  className="form-select"
                  value={credentials.rol}
                  onChange={handleChange}
                >
                  <option value={ROLES.CLIENTE}>
                    Dueño de Mascota (Cliente)
                  </option>

                  <option value={ROLES.RECEPCION}>
                    Recepcionista / Operador
                  </option>

                  <option value={ROLES.ADMIN}>
                    Administrador
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                Iniciar Sesión
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}