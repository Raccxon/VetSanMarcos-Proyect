import { Link } from 'react-router-dom'
import MapaClinica from '../components/ui/MapaClinica'
import { CATEGORIAS } from '../constants/categorias'

export default function HomePage() {
    return (
        <div className="container py-4">
            {/* Hero Banner */}
            <div className="hero-section text-center">
                <h1>Bienvenido a Veterinaria San Marcos</h1>
                <p className="mt-2">Cuidado profesional, compasivo y especializado para la salud de tus mascotas en Rancagua.</p>
                <div className="mt-4">
                    <Link
                        to="/agendar"
                        className="btn btn-light btn-lg fw-bold text-success me-2 px-4"
                    >
                        Agendar Cita
                    </Link>
                    <Link
                        to="/servicios"
                        className="btn btn-outline-light btn-lg px-4"
                    >
                        Ver Servicios
                    </Link>
                </div>
            </div>

            {/* Categorías: cada cuadro lleva a los servicios de esa categoría */}
            <div className="row g-4 mb-5">
                {CATEGORIAS.map((cat) => (
                    <div className="col-12 col-md-6 col-lg-3" key={cat.nombre}>
                        <Link
                            to={`/servicios?categoria=${encodeURIComponent(cat.nombre)}`}
                            className="text-decoration-none"
                        >
                            <div className="custom-card p-4 text-center h-100">
                                <div className="fs-1 text-success mb-2">{cat.icono}</div>
                                <h4 className="fw-bold text-success">{cat.nombre}</h4>
                                <p className="text-muted">{cat.descripcion}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Ubicación y Mapa */}
            <div className="custom-card p-4">
                <h3 className="fw-bold text-success mb-3">📍 ¿Cómo Llegar?</h3>
                <p className="text-muted mb-4">Nos encontramos ubicados en un punto central de Rancagua. Ven a visitarnos o contáctanos directamente.</p>
                <div style={{ height: '380px', width: '100%' }}>
                    <MapaClinica />
                </div>
            </div>
        </div>
    )
}