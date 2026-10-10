import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ROLES } from '../../constants/roles'
import { obtenerSesion } from '../../utils/sesion'
import { EVENTO_SESION, avisarCambioSesion } from '../../utils/sesionEventos'

// "rol" indica quién puede ver el enlace; sin "rol" lo ve cualquiera
const ENLACES = [
    { to: '/', texto: 'Inicio' },
    { to: '/servicios', texto: 'Servicios' },
    { to: '/agendar', texto: 'Agendar Cita' },
    { to: '/mis-citas', texto: 'Mis Citas', rol: ROLES.CLIENTE },
    { to: '/gestion-citas', texto: 'Gestión de Citas', rol: ROLES.RECEPCION },
    { to: '/historial', texto: 'Ficha y Vacunas' },
    { to: '/admin', texto: 'Administración', rol: ROLES.ADMIN },
]

function Navbar() {
    const navigate = useNavigate()
    const [sesion, setSesion] = useState(obtenerSesion)

    // Se vuelve a leer la sesión cuando el Login avisa un cambio
    // (o cuando cambia en otra pestaña del navegador)
    useEffect(() => {
        const actualizar = () => setSesion(obtenerSesion())

        window.addEventListener(EVENTO_SESION, actualizar)
        window.addEventListener('storage', actualizar)

        return () => {
            window.removeEventListener(EVENTO_SESION, actualizar)
            window.removeEventListener('storage', actualizar)
        }
    }, [])

    const handleCerrarSesion = () => {
        localStorage.removeItem('userSession')
        avisarCambioSesion()
        navigate('/')
    }

    const enlacesVisibles = ENLACES.filter(
        (enlace) => !enlace.rol || enlace.rol === sesion?.rol
    )

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success sticky-top">
            <div className="container">
                <NavLink className="navbar-brand fw-bold" to="/">
                    Veterinaria San Marcos
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navMain"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navMain">
                    <ul className="navbar-nav ms-auto align-items-lg-center">
                        {enlacesVisibles.map((enlace) => (
                            <li className="nav-item" key={enlace.to}>
                                <NavLink
                                    className="nav-link"
                                    to={enlace.to}
                                    end={enlace.to === '/'}
                                >
                                    {enlace.texto}
                                </NavLink>
                            </li>
                        ))}

                        {sesion ? (
                            <>
                                <li className="nav-item ms-lg-2">
                                    <span className="navbar-text text-white">
                                        Hola, {sesion.nombre}
                                    </span>
                                </li>
                                <li className="nav-item ms-lg-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-light px-3"
                                        onClick={handleCerrarSesion}
                                    >
                                        Cerrar sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item ms-lg-2">
                                <NavLink className="btn btn-outline-light nav-link px-3 text-white" to="/login">
                                    Iniciar Sesión
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar