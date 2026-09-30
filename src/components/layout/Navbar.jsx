import { NavLink } from 'react-router-dom'

function Navbar() {
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
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/">Inicio</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/servicios">Servicios</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/agendar">Agendar Cita</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/historial">Ficha y Vacunas</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/admin">Administración</NavLink>
                        </li>
                        <li className="nav-item ms-lg-2">
                            <NavLink className="btn btn-outline-light nav-link px-3 text-white" to="/login">
                                Iniciar Sesión
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar