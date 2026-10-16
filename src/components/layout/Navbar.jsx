
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ROLES } from '../../constants/roles'
import { obtenerSesion } from '../../utils/sesion'
import { EVENTO_SESION, avisarCambioSesion } from '../../utils/sesionEventos'

const PUBLICOS = [
    { to: '/', texto: 'Inicio' },
    { to: '/servicios', texto: 'Servicios' },
]

const VISTAS_ADMIN = [
    { vista: 'dashboard', texto: 'Dashboard' },
    { vista: 'stock', texto: 'Stock y Servicios' },
    { vista: 'citas', texto: 'Citas y Agenda' },
    { vista: 'clientes', texto: 'Clientes y Mascotas' },
    { vista: 'estadisticas', texto: 'Estadísticas' },
]

const ENLACES_POR_ROL = {
    [ROLES.CLIENTE]: [
        ...PUBLICOS,
        { to: '/agendar', texto: 'Agendar Cita' },
        { to: '/mis-citas', texto: 'Mis Citas' },
        { to: '/historial', texto: 'Ficha y Vacunas' },
    ],

    [ROLES.RECEPCION]: [
        ...PUBLICOS,
        { to: '/historial', texto: 'Ficha y Vacunas' },
        { to: '/gestion-citas', texto: 'Gestión de Citas' },
        { to: '/fichas', texto: 'Gestión de Fichas' },
    ],

    [ROLES.ADMIN]: [
        { texto: 'Administración', submenu: VISTAS_ADMIN },
        { to: '/gestion-citas', texto: 'Gestión de Citas' },
        { to: '/fichas', texto: 'Gestión de Fichas' },
        { to: '/usuarios', texto: 'Usuarios' },
    ],
}

function Navbar() {
    const navigate = useNavigate()
    const { pathname, search } = useLocation()
    const [sesion, setSesion] = useState(obtenerSesion)

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
        setSesion(null)
        avisarCambioSesion()
        navigate('/')
    }

    const rol = sesion?.rol
    const enlacesVisibles = ENLACES_POR_ROL[rol] ?? PUBLICOS

    const inicio =
        rol === ROLES.ADMIN ? '/admin' : '/'

    const vistaActual =
        new URLSearchParams(search).get('vista') ?? 'dashboard'

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-success sticky-top">
            <div className="container">
                <NavLink className="navbar-brand fw-bold" to={inicio}>
                    Veterinaria San Marcos
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navMain"
                    aria-controls="navMain"
                    aria-expanded="false"
                    aria-label="Abrir menú de navegación"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navMain">
                    <ul className="navbar-nav ms-auto align-items-lg-center">
                        {enlacesVisibles.map((enlace) =>
                            enlace.submenu ? (
                                <li className="nav-item dropdown" key={enlace.texto}>
                                    <button
                                        type="button"
                                        className={`nav-link dropdown-toggle ${
                                            pathname === '/admin' ? 'active fw-bold' : ''
                                        }`}
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {enlace.texto}
                                    </button>

                                    <ul className="dropdown-menu">
                                        {enlace.submenu.map((item) => (
                                            <li key={item.vista}>
                                                <Link
                                                    className={`dropdown-item ${
                                                        pathname === '/admin' &&
                                                        vistaActual === item.vista
                                                            ? 'active'
                                                            : ''
                                                    }`}
                                                    to={`/admin?vista=${item.vista}`}
                                                >
                                                    {item.texto}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ) : (
                                <li className="nav-item" key={enlace.to}>
                                    <NavLink
                                        className="nav-link"
                                        to={enlace.to}
                                        end={enlace.to === '/'}
                                    >
                                        {enlace.texto}
                                    </NavLink>
                                </li>
                            )
                        )}

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
                            <>
                                <li className="nav-item ms-lg-2">
                                    <NavLink
                                        className="btn btn-outline-light nav-link px-3 text-white"
                                        to="/login"
                                    >
                                        Iniciar Sesión
                                    </NavLink>
                                </li>

                                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                                    <NavLink
                                        className="btn btn-light text-success px-3 fw-bold"
                                        to="/registro"
                                    >
                                        Registrarse
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
