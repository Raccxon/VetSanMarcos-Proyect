import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { obtenerSesion } from "../utils/sesion"
import { CLASE_BADGE_ESTADO } from "../constants/estadosCitas"
import { listarMisCitas, actualizarCita, cuerpoCita } from "../services/citasService"

export default function MisCitasPage() {
    const sesion = obtenerSesion()
    const [citas, setCitas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    // Al abrir la pantalla se piden al backend las citas de quien inició sesión
    useEffect(() => {
        let activo = true

        listarMisCitas()
            .then((datos) => {
                if (activo) setCitas(datos)
            })
            .catch((err) => {
                if (activo) setError(err.message)
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => {
            activo = false
        }
    }, [])

    // El backend pide la cita completa en el PUT: se reenvía igual, cambiando solo el estado
    const handleCancelar = async (cita) => {
        setError('')

        try {
            const actualizada = await actualizarCita(cita.id, cuerpoCita(cita, { estado: 'Cancelada' }))
            setCitas((prev) => prev.map((c) => (c.id === cita.id ? actualizada : c)))
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h1 className="h3 fw-bold text-success mb-0">Mis Citas</h1>
                <Link to="/agendar" className="btn btn-success">
                    Agendar nueva cita
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <p className="text-muted">Cargando tus citas...</p>
            ) : citas.length === 0 ? (
                <div className="alert alert-info" role="status">
                    Aun no tienes citas solicitadas en tu correo {sesion?.email}.
                </div>
            ) : (
                <div className="row g-3">
                    {citas.map((cita) => (
                        <div className="col-12 col-md-6 col-xl-4" key={cita.id}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h2 className="h5 mb-0">{cita.mascota.nombre} </h2>
                                        <span
                                            className={`badge ${CLASE_BADGE_ESTADO[cita.estado] ?? 'bg-secondary'}`}
                                        >
                                            {cita.estado}
                                        </span>
                                    </div>
                                    <p className="mb-1">
                                        <strong>Servicio:</strong> {cita.servicio.nombre}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Fecha:</strong> {cita.fecha} · {cita.hora}
                                    </p>
                                    <p className="mb-0 text-muted small">N° {cita.id}</p>
                                    {cita.estado !== 'Cancelada' && cita.estado !== 'Atendida' && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm mt-3"
                                            aria-label={`Cancelar cita ${cita.id}`}
                                            onClick={() => handleCancelar(cita)}
                                        >
                                            Cancelar cita
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}