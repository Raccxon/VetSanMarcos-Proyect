import { useState } from "react";
import { useCitas } from "../context/CitasContext";
import {ESTADOS_CITA, CLASE_BADGE_ESTADO} from "../constants/estadosCitas";

export default function GestionCitasPage() {
    const { citas, actualizarEstadoCita } = useCitas();
    const [filtro, setFiltro] = useState("Todas");

    const citasVisibles =
        filtro === "Todas" ? citas : citas.filter((c) => c.estado === filtro);

    return (
        <div className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h1 className="h3 fw-bold text-success mb-0">Gestión de Citas</h1>

                <div className="d-flex align-items-center gap-2">
                    <label htmlFor="filtro-estado" className="form-label mb-0">
                        Mostrar
                    </label>
                    <select
                        id="filtro-estado"
                        className="form-select"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    >
                        <option value="Todas">Todas</option>
                        {ESTADOS_CITA.map((estado) => (
                            <option key={estado} value={estado}>
                                {estado}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {citasVisibles.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    No hay citas para mostrar.
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-success">
                            <tr>
                                <th>N°</th>
                                <th>Dueño</th>
                                <th>Mascota</th>
                                <th>Servicio</th>
                                <th>Fecha y hora</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citasVisibles.map((cita) => (
                                <tr key={cita.id}>
                                    <td>{cita.id}</td>
                                    <td>{cita.nombreDuenio}</td>
                                    <td>{cita.nombreMascota}</td>
                                    <td>{cita.servicioNombre}</td>
                                    <td>
                                        {cita.fecha} · {cita.hora}
                                    </td>
                                    <td>
                                        <span
                                            className={`badge me-2 ${CLASE_BADGE_ESTADO[cita.estado] ?? "bg-secondary"}`}
                                        >
                                            {cita.estado}
                                        </span>
                                        <select
                                            className="form-select form-select-sm d-inline-block w-auto"
                                            aria-label={`Cambiar estado de la cita ${cita.id}`}
                                            value={cita.estado}
                                            onChange={(e) => actualizarEstadoCita(cita.id, e.target.value)}
                                        >
                                            {ESTADOS_CITA.map((estado) => (
                                                <option key={estado} value={estado}>
                                                    {estado}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}               