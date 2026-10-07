import { Navigate } from 'react-router-dom'

export default function RutaProtegida({ children, rolRequerido }) {
  let session = null

  try {
    session = JSON.parse(
      localStorage.getItem('userSession')
    )
  } catch {
    localStorage.removeItem('userSession')
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (
    rolRequerido &&
    session.rol !== rolRequerido
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