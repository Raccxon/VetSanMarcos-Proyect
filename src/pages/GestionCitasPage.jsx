import { useState } from "react";
import { useCitas } from "../context/CitasContext";
import { ESTADOS_CITA, CLASE_BADGE_ESTADO } from "../constants/estadosCitas";
import { fechaNoPasada } from "../utils/validaciones";
import { obtenerFechaHoy } from "../utils/fechas";
import { citasDelDia } from "../utils/historial";

const HORARIOS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];

export default function GestionCitasPage() {
    const { citas, actualizarEstadoCita, reagendarCita, eliminarCita } = useCitas();
    const [filtro, setFiltro] = useState("Todas");
    const [fecha, setFecha] = useState(obtenerFechaHoy);

    // id de la cita que se está reagendando (null = ninguna)
    const [reagendando, setReagendando] = useState(null);
    const [nuevaFecha, setNuevaFecha] = useState("");
    const [nuevaHora, setNuevaHora] = useState("");
    const [errorReagendar, setErrorReagendar] = useState("");

    const delDia = citasDelDia(citas, fecha);
    const citasVisibles =
        filtro === "Todas" ? delDia : delDia.filter((c) => c.estado === filtro);

    const abrirReagendar = (cita) => {
        setReagendando(cita.id);
        setNuevaFecha(cita.fecha);
        setNuevaHora(cita.hora);
        setErrorReagendar("");
    };

    const cancelarReagendar = () => {
        setReagendando(null);
        setErrorReagendar("");
    };

    const guardarReagendar = (id) => {
        if (!nuevaFecha || !nuevaHora) {
            setErrorReagendar("Debes elegir fecha y horario");
            return;
        }
        if (!fechaNoPasada(nuevaFecha)) {
            setErrorReagendar("La fecha no puede ser anterior a hoy");
            return;
        }
        reagendarCita(id, nuevaFecha, nuevaHora);
        setReagendando(null);
        setErrorReagendar("");
    };

    return (
        <div className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h1 className="h3 fw-bold text-success mb-0">Citas del Día</h1>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    <label htmlFor="fecha-citas" className="form-label mb-0">
                        Fecha
                    </label>
                    <input
                        id="fecha-citas"
                        type="date"
                        className="form-control w-auto"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value || obtenerFechaHoy())}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={() => setFecha(obtenerFechaHoy())}
                    >
                        Hoy
                    </button>

                    <label htmlFor="filtro-estado" className="form-label mb-0">
                        Mostrar
                    </label>
                    <select
                        id="filtro-estado"
                        className="form-select w-auto"
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
                    No hay citas para el {fecha}.
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
                                <th>Hora</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citasVisibles.map((cita) => (
                                <tr key={cita.id}>
                                    <td>{cita.id}</td>
                                    <td>{cita.nombreDuenio}</td>
                                    <td>{cita.nombreMascota}</td>
                                    <td>{cita.servicioNombre}</td>
                                    <td>{cita.hora}</td>
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
                                    <td>
                                        {reagendando === cita.id ? (
                                            <div className="d-flex flex-column gap-1">
                                                <input
                                                    type="date"
                                                    className="form-control form-control-sm"
                                                    aria-label={`Nueva fecha de la cita ${cita.id}`}
                                                    value={nuevaFecha}
                                                    onChange={(e) => setNuevaFecha(e.target.value)}
                                                />
                                                <select
                                                    className="form-select form-select-sm"
                                                    aria-label={`Nuevo horario de la cita ${cita.id}`}
                                                    value={nuevaHora}
                                                    onChange={(e) => setNuevaHora(e.target.value)}
                                                >
                                                    <option value="">-- Horario --</option>
                                                    {HORARIOS.map((h) => (
                                                        <option key={h} value={h}>
                                                            {h} hrs
                                                        </option>
                                                    ))}
                                                </select>
                                                {errorReagendar && (
                                                    <span className="text-danger small" role="alert">
                                                        {errorReagendar}
                                                    </span>
                                                )}
                                                <div className="d-flex gap-1">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-success"
                                                        aria-label={`Guardar reagendamiento de la cita ${cita.id}`}
                                                        onClick={() => guardarReagendar(cita.id)}
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={cancelarReagendar}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="d-flex gap-1">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    aria-label={`Reagendar cita ${cita.id}`}
                                                    onClick={() => abrirReagendar(cita)}
                                                >
                                                    Reagendar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    aria-label={`Eliminar cita ${cita.id}`}
                                                    onClick={() => eliminarCita(cita.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
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