import MapaClinica from '../components/ui/MapaClinica'

export default function HomePage() {
    return (
        <div className="container py-4">
            {/* Hero Banner */}
            <div className="hero-section text-center">
                <h1>Bienvenido a Veterinaria San Marcos</h1>
                <p className="mt-2">Cuidado profesional, compasivo y especializado para la salud de tus mascotas en Rancagua.</p>
                <div className="mt-4">
                    <a href="/agendar" className="btn btn-light btn-lg fw-bold text-success me-2 px-4">
                        Agendar Cita
                    </a>
                    <a href="/servicios" className="btn btn-outline-light btn-lg px-4">
                        Ver Servicios
                    </a>
                </div>
            </div>

            {/* Secciones Informativas */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="custom-card p-4 text-center h-100">
                        <div className="fs-1 text-success mb-2">🩺</div>
                        <h4 className="fw-bold text-success">Consultas y Urgencias</h4>
                        <p className="text-muted">Atención médica general y especializada lista para resolver cualquier emergencia.</p>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="custom-card p-4 text-center h-100">
                        <div className="fs-1 text-success mb-2">💉</div>
                        <h4 className="fw-bold text-success">Vacunación y Fichas</h4>
                        <p className="text-muted">Mantén al día el carnet sanitario y el historial clínico de tus mascotas en un solo lugar.</p>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="custom-card p-4 text-center h-100">
                        <div className="fs-1 text-success mb-2">✂️</div>
                        <h4 className="fw-bold text-success">Peluquería y Estética</h4>
                        <p className="text-muted">Servicios de baño y corte para mantener la higiene y bienestar de tus animales.</p>
                    </div>
                </div>
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