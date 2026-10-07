import { useState } from 'react'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rol: 'cliente'
  })

  const [error, setError] = useState('')
  const [usuarioLogueado, setUsuarioLogueado] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!credentials.email || !credentials.password) {
      setError('Por favor complete todos los campos')
      return
    }

    // Simulación de autenticación exitosa
    setError('')
    const mockUser = {
      email: credentials.email,
      rol: credentials.rol,
      nombre: credentials.rol === 'admin' ? 'Administrador Sistema' :
        credentials.rol === 'recepcion' ? 'Recepcionista San Marcos' : 'Dueño de Mascota'
    }

    setUsuarioLogueado(mockUser)
    // Guardar en localStorage para simular persistencia
    localStorage.setItem('userSession', JSON.stringify(mockUser))
  }

  const handleLogout = () => {
    localStorage.removeItem('userSession')
    setUsuarioLogueado(null)
    setCredentials({ email: '', password: '', rol: 'cliente' })
  }

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Acceso al Sistema</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '25px', fontSize: '14px' }}>
        Veterinaria San Marcos - Portal Web
      </p>

      {usuarioLogueado ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <h3 style={{ color: '#2e7d32', margin: '0 0 5px 0' }}>¡Sesión Iniciada!</h3>
            <p style={{ margin: '5px 0' }}><strong>Usuario:</strong> {usuarioLogueado.nombre}</p>
            <p style={{ margin: '5px 0' }}><strong>Rol:</strong> {usuarioLogueado.rol.toUpperCase()}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div style={{ backgroundColor: '#ffebee', color: 'red', padding: '8px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="login-email"
              style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="usuario@sanmarcos.cl"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="login-password"
              style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="login-rol"
              style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}
            >
              Seleccionar Rol (Simulación P2)
            </label>
            <select
              id="login-rol"
              name="rol"
              value={credentials.rol}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="cliente">Dueño de Mascota (Cliente)</option>
              <option value="recepcion">Recepcionista / Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            Iniciar Sesión
          </button>
        </form>
      )}
    </div>
  )
}