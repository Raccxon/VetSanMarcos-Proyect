import { useState } from 'react'
import { obtenerSesion, guardarSesion, cerrarSesion } from '../utils/sesion'
import { login } from '../services/authService'

const CREDENCIALES_VACIAS = {
  email: '',
  password: '' 
}

export default function LoginPage() {
  const [credentials, setCredentials] = useState(CREDENCIALES_VACIAS)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [usuarioLogueado, setUsuarioLogueado] = useState(obtenerSesion)

  const handleChange = (e) => {
    const { name, value } = e.target

    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!credentials.email || !credentials.password) {
      setError('Por favor complete todos los campos')
      return
    }

    setError('')
    setCargando(true)

    try {
      // El backend valida el correo y la clave, y responde con el token
      const respuesta = await login(credentials.email, credentials.password)

      guardarSesion(respuesta)
      setUsuarioLogueado(obtenerSesion())
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const handleLogout = () => {
    cerrarSesion()
    setUsuarioLogueado(null)
    setCredentials(CREDENCIALES_VACIAS)
    setError('')
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
                  required
                />
              </div>

              <div className="mb-4">
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
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={cargando}
              >
                {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
