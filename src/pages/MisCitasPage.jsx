import { Link } from "react-router-dom"
import { useCitas } from "../context/CitasContext"
import { obtenerSesion } from "../utils/sesion"
import { filtrarCitasPorEmail } from "../utils/citas"

const BADGE_POR_ESTADO = {
    Pendiente: 'bg-warning text-dark',
    Confirmada: 'bg-success',
    Reagendada: 'bg-info text-dark',
    Cancelada: 'bg-secondary'
}

export default function MisCitasPage() {
    const { citas } = useCitas()
    const sesion = obtenerSesion()
    const misCitas = filtrarCitasPorEmail(citas, sesion?.email)

    return (
        <div className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h1 className = "h3 fw-bold text-success mb-0">Mis Citas</h1>
                <Link to="/agendar" className="btn btn-success">
                    Agendar nueva cita
                </Link>
            </div>

            {misCitas.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    Aun no tienes citas solicitadas en tu correo {sesion?.email}.
                </div>
            ) : (
                <div className="row g-3">
                    {misCitas.map((cita) => (
                        <div className="col-12 col-md-6 col-xl-4" key={cita.id}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body"> 
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h2 className="h5 mb-0">{cita.nombreMascota} </h2>
                                        <span
                                            className={`badge ${BADGE_POR_ESTADO[cita.estado]} ?? 'bg-secondary'}`}
                                        >
                                            {cita.estado}
                                        </span>
                                    </div>
                                    <p className="mb-1">
                                        <strong>Servicio:</strong> {cita.servicioNombre}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Fecha:</strong> {cita.fecha} · {cita.hora}
                                    </p>
                                    <p className="mb-0 text-muted small">N° {cita.id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}