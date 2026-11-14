import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { obtenerSesion } from '../../utils/sesion'
import { avisarCambioSesion } from '../../utils/sesionEventos'

export default function RutaProtegida({ children, rolRequerido, rolesPermitidos }) {
  // obtenerSesion devuelve null si no hay sesión, si está dañada o si el token venció
  const session = obtenerSesion()

  // Si la sesión no es válida, avisa al Navbar para que deje de mostrar enlaces de usuario
  useEffect(() => {
    if (!session) avisarCambioSesion()
  }, [session])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  const permitidos = rolesPermitidos ?? (rolRequerido ? [rolRequerido] : null)

  if (
    permitidos &&
    !permitidos.includes(session.rol)
  ) {
    return (
      <div className="container py-5 text-center">

        <div className="alert alert-danger" role="alert">

          <h2 className="h4">
            Acceso restringido
          </h2>

          <p className="mb-0">
            No tienes los permisos necesarios para ver esta página.
          </p>

        </div>

      </div>
    )
  }

  return children
}