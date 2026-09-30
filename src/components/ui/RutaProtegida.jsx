import { Navigate } from 'react-router-dom'

export default function RutaProtegida({ children, rolRequerido }) {
    const session = JSON.parse(localStorage.getItem('userSession'))

    if (!session) {
        return <Navigate to="/login" replace />
    }

    if (rolRequerido && session.rol !== rolRequerido) {
        return (
            <div className="container py-5 text-center">
                <h2 className="text-danger">Acceso Restringido</h2>
                <p>No tienes los permisos necesarios para ver esta página.</p>
            </div>
        )
    }

    return children
}