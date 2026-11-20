import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServicios } from '../services/apiServices';
import { listarMisMascotas, crearMascota } from '../services/mascotaService';
import { crearCita, horasOcupadas } from '../services/citasService';
import { obtenerSesion } from '../utils/sesion';
import { fechaNoPasada } from '../utils/validaciones';
import { obtenerFechaHoy } from '../utils/fechas';
import { BLOQUES_HORARIO, esDomingo, bloqueNoDisponible } from '../utils/agenda';

// Valor del selector de mascota para registrar una nueva
const NUEVA = 'nueva';

const FORM_VACIO = {
    mascotaId: '',
    nombreMascota: '',
    especie: 'Perro',
    raza: '',
    edad: '',
    servicioId: '',
    fecha: '',
    hora: '',
    motivo: ''
};

// Si el cliente no tiene mascotas se abre directo el registro de una nueva;
// si tiene una sola, queda elegida
const mascotaPorDefecto = (mascotas) => {
    if (mascotas.length === 0) return NUEVA;
    if (mascotas.length === 1) return String(mascotas[0].id);
    return '';
};

export default function AgendarPage() {
    const sesion = obtenerSesion();

    const [servicios, setServicios] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');

    const [formData, setFormData] = useState(FORM_VACIO);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [citaConfirmada, setCitaConfirmada] = useState(null);

    // Horas ocupadas del día elegido, tal como las entrega el backend.
    // Se guarda junto a la fecha a la que corresponden para no mostrar las de otro día.
    const [ocupadas, setOcupadas] = useState({ fecha: '', lista: [], fallo: false });
    const [recarga, setRecarga] = useState(0);

    // Al abrir la pantalla se piden al backend el catálogo y las mascotas del cliente
    useEffect(() => {
        let activo = true;

        Promise.all([getServicios(), listarMisMascotas()])
            .then(([serviciosBackend, mascotasBackend]) => {
                if (!activo) return;
                setServicios(serviciosBackend);
                setMascotas(mascotasBackend);
                setFormData((prev) => ({ ...prev, mascotaId: mascotaPorDefecto(mascotasBackend) }));
            })
            .catch((err) => {
                if (activo) setErrorCarga(err.message);
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, []);

    // Cada vez que cambia la fecha se piden las horas ya tomadas de ese día
    useEffect(() => {
        const fecha = formData.fecha;
        if (!fecha || esDomingo(fecha)) return;

        let activo = true;

        horasOcupadas(fecha)
            .then((lista) => {
                if (activo) setOcupadas({ fecha, lista, fallo: false });
            })
            .catch(() => {
                if (activo) setOcupadas({ fecha, lista: [], fallo: true });
            });

        return () => {
            activo = false;
        };
    }, [formData.fecha, recarga]);

    const ocupadasDelDia = ocupadas.fecha === formData.fecha ? ocupadas.lista : [];
    const falloHoras = ocupadas.fecha === formData.fecha && ocupadas.fallo;

    const servicioSeleccionado = servicios.find((s) => String(s.id) === formData.servicioId);
    const duracionActual = servicioSeleccionado ? servicioSeleccionado.duracion : 30;

    const noDisponible = (bloque) => bloqueNoDisponible(bloque, duracionActual, ocupadasDelDia);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'fecha' || name === 'servicioId' ? { hora: '' } : {})
        }));

        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.mascotaId) nuevosErrores.mascotaId = 'Debe seleccionar una mascota';

        if (formData.mascotaId === NUEVA) {
            if (!formData.nombreMascota.trim()) nuevosErrores.nombreMascota = 'El nombre de la mascota es obligatorio';
            if (!formData.raza.trim()) nuevosErrores.raza = 'La raza es obligatoria';

            const edad = Number(formData.edad);
            if (formData.edad === '') {
                nuevosErrores.edad = 'La edad es obligatoria';
            } else if (!Number.isInteger(edad) || edad < 0 || edad > 40) {
                nuevosErrores.edad = 'La edad debe ser un número entero entre 0 y 40';
            }
        }

        if (!formData.servicioId) nuevosErrores.servicioId = 'Debe seleccionar un servicio';

        if (!formData.fecha) {
            nuevosErrores.fecha = 'Debe seleccionar una fecha';
        } else if (!fechaNoPasada(formData.fecha)) {
            nuevosErrores.fecha = 'La fecha no puede ser anterior a hoy';
        } else if (esDomingo(formData.fecha)) {
            nuevosErrores.fecha = 'La veterinaria se encuentra cerrada los días domingos';
        }

        if (!formData.hora) {
            nuevosErrores.hora = 'Debe seleccionar un horario';
        } else if (noDisponible(formData.hora)) {
            nuevosErrores.hora = 'El horario seleccionado no está disponible o excede la jornada de atención';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        setEnviando(true);
        setErrorGeneral('');

        try {
            let mascotaId = formData.mascotaId;

            // Mascota nueva: primero se registra a nombre del cliente de la sesión
            if (mascotaId === NUEVA) {
                const creada = await crearMascota({
                    nombre: formData.nombreMascota.trim(),
                    especie: formData.especie,
                    raza: formData.raza.trim(),
                    edad: Number(formData.edad),
                    dueno: { id: sesion?.id }
                });

                // Queda elegida: si la cita falla y el cliente reintenta, no se crea otra mascota igual
                setMascotas((prev) => [...prev, creada]);
                setFormData((prev) => ({ ...prev, mascotaId: String(creada.id) }));
                mascotaId = String(creada.id);
            }

            // El estado no se envía: el backend deja toda cita nueva como Pendiente
            const cita = await crearCita({
                mascota: { id: Number(mascotaId) },
                servicio: { id: Number(formData.servicioId) },
                fecha: formData.fecha,
                hora: formData.hora,
                motivo: formData.motivo.trim() || null
            });

            setCitaConfirmada(cita);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            // Ej.: 409 "Ese horario ya está ocupado" o 400 por una regla de horario
            setErrorGeneral(err.message);

            if (err.status === 409) {
                // Alguien más tomó esa hora: se vuelve a pedir qué horas quedan libres
                setFormData((prev) => ({ ...prev, hora: '' }));
                setRecarga((n) => n + 1);
            }
        } finally {
            setEnviando(false);
        }
    };

    const handleNuevaCita = () => {
        setCitaConfirmada(null);
        setErrorGeneral('');
        setErrores({});
        setFormData({ ...FORM_VACIO, mascotaId: mascotaPorDefecto(mascotas) });
    };

    const clase = (campo, base = 'form-control') => `${base} ${errores[campo] ? 'is-invalid' : ''}`;

    if (cargando) {
        return (
            <div className="container py-4">
                <p className="text-muted">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <h1 className="text-center mb-2">Agendar Cita Médica</h1>
                    <p className="text-center text-muted mb-4">Reserva la atención para tu mascota en Veterinaria San Marcos (Rancagua)</p>

                    {errorCarga && (
                        <div className="alert alert-danger" role="alert">
                            {errorCarga}
                        </div>
                    )}

                    {citaConfirmada ? (
                        <div className="alert alert-success text-center p-4">
                            <h2 className="h3 text-success mt-0">¡Cita Solicitada con Éxito!</h2>
                            <p>Tu solicitud ha sido registrada y está a la espera de confirmación.</p>

                            <div className="bg-white rounded p-3 my-4 text-start">
                                <p><strong>Código de Reserva:</strong> {citaConfirmada.id}</p>
                                <p><strong>Mascota:</strong> {citaConfirmada.mascota.nombre} ({citaConfirmada.mascota.especie})</p>
                                <p><strong>Servicio:</strong> {citaConfirmada.servicio.nombre}</p>
                                <p><strong>Fecha y Hora:</strong> {citaConfirmada.fecha} a las {citaConfirmada.hora} hrs</p>
                                <p><strong>Duración Estimada:</strong> {citaConfirmada.servicio.duracion} min</p>
                                <p className="mb-0"><strong>Valor Estimado:</strong> ${citaConfirmada.servicio.precio.toLocaleString('es-CL')}</p>
                            </div>

                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                <button type="button" onClick={handleNuevaCita} className="btn btn-success">
                                    Agendar otra cita
                                </button>
                                <Link to="/mis-citas" className="btn btn-outline-success">
                                    Ver mis citas
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="custom-card p-3 p-md-4">
                            {errorGeneral && (
                                <div className="alert alert-danger" role="alert">
                                    {errorGeneral}
                                </div>
                            )}

                            <p className="text-muted mb-4">
                                Agendando como <strong>{sesion?.nombre}</strong> ({sesion?.email})
                            </p>

                            <h3 className="h5 border-bottom pb-2 mb-3">1. Tu Mascota</h3>
                            <div className="row g-3 mb-4">
                                <div className="col-12">
                                    <label htmlFor="mascotaId" className="form-label fw-bold">Mascota *</label>
                                    <select
                                        id="mascotaId"
                                        name="mascotaId"
                                        value={formData.mascotaId}
                                        onChange={handleChange}
                                        className={clase('mascotaId', 'form-select')}
                                    >
                                        <option value="">-- Seleccione una mascota --</option>
                                        {mascotas.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.nombre} ({m.especie})
                                            </option>
                                        ))}
                                        <option value={NUEVA}>+ Registrar una nueva mascota</option>
                                    </select>
                                    {errores.mascotaId && <div className="invalid-feedback">{errores.mascotaId}</div>}
                                </div>

                                {formData.mascotaId === NUEVA && (
                                    <>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="nombreMascota" className="form-label fw-bold">Nombre Mascota *</label>
                                            <input
                                                type="text"
                                                id="nombreMascota"
                                                name="nombreMascota"
                                                value={formData.nombreMascota}
                                                onChange={handleChange}
                                                placeholder="Ej. Cachupín"
                                                className={clase('nombreMascota')}
                                            />
                                            {errores.nombreMascota && <div className="invalid-feedback">{errores.nombreMascota}</div>}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="especie" className="form-label fw-bold">Especie *</label>
                                            <select
                                                name="especie"
                                                id="especie"
                                                value={formData.especie}
                                                onChange={handleChange}
                                                className="form-select"
                                            >
                                                <option value="Perro">Perro</option>
                                                <option value="Gato">Gato</option>
                                                <option value="Conejo">Conejo</option>
                                                <option value="Ave">Ave</option>
                                            </select>
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="raza" className="form-label fw-bold">Raza *</label>
                                            <input
                                                type="text"
                                                id="raza"
                                                name="raza"
                                                value={formData.raza}
                                                onChange={handleChange}
                                                placeholder="Ej. Mestizo"
                                                className={clase('raza')}
                                            />
                                            {errores.raza && <div className="invalid-feedback">{errores.raza}</div>}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label htmlFor="edad" className="form-label fw-bold">Edad (años) *</label>
                                            <input
                                                type="number"
                                                id="edad"
                                                name="edad"
                                                min="0"
                                                max="40"
                                                value={formData.edad}
                                                onChange={handleChange}
                                                className={clase('edad')}
                                            />
                                            {errores.edad && <div className="invalid-feedback">{errores.edad}</div>}
                                        </div>
                                    </>
                                )}
                            </div>

                            <h3 className="h5 border-bottom pb-2 mb-3">2. Selección de Hora</h3>
                            <div className="row g-3 mb-4">
                                <div className="col-12 col-md-6">
                                    <label htmlFor="servicioId" className="form-label fw-bold">Servicio Requerido *</label>
                                    <select
                                        name="servicioId"
                                        id="servicioId"
                                        value={formData.servicioId}
                                        onChange={handleChange}
                                        className={clase('servicioId', 'form-select')}
                                    >
                                        <option value="">-- Seleccione un servicio --</option>
                                        {servicios.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.nombre} (${s.precio.toLocaleString('es-CL')})
                                            </option>
                                        ))}
                                    </select>
                                    {errores.servicioId && <div className="invalid-feedback">{errores.servicioId}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label htmlFor="fecha" className="form-label fw-bold">Fecha *</label>
                                    <input
                                        type="date"
                                        id="fecha"
                                        name="fecha"
                                        min={obtenerFechaHoy()}
                                        value={formData.fecha}
                                        onChange={handleChange}
                                        className={clase('fecha')}
                                    />
                                    {errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label htmlFor="hora" className="form-label fw-bold">
                                        Horario Disponible *
                                        {formData.servicioId && (
                                            <span className="badge bg-info ms-2">
                                                Duración: {duracionActual} min
                                            </span>
                                        )}
                                    </label>
                                    <select
                                        name="hora"
                                        id="hora"
                                        value={formData.hora}
                                        onChange={handleChange}
                                        className={clase('hora', 'form-select')}
                                        disabled={!formData.fecha || esDomingo(formData.fecha)}
                                    >
                                        <option value="">
                                            {!formData.fecha
                                                ? '-- Seleccione primero una fecha --'
                                                : esDomingo(formData.fecha)
                                                    ? '-- Cerrado los domingos --'
                                                    : '-- Seleccione un bloque --'}
                                        </option>
                                        {BLOQUES_HORARIO.map((bloque) => {
                                            const ocupado = noDisponible(bloque);
                                            return (
                                                <option key={bloque} value={bloque} disabled={ocupado}>
                                                    {bloque} hrs {ocupado ? '(No disponible)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errores.hora && <div className="invalid-feedback">{errores.hora}</div>}

                                    {falloHoras && (
                                        <small className="text-warning d-block mt-1">
                                            No se pudieron cargar los horarios ocupados. Puedes elegir uno igual: el servidor comprobará que esté libre.
                                        </small>
                                    )}

                                    {formData.servicioId && duracionActual > 30 && (
                                        <small className="text-muted d-block mt-1">
                                            ℹ️ Requiere {duracionActual} min ({duracionActual / 30} bloques seguidos).
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="motivo" className="form-label fw-bold">Motivo de la consulta / Observaciones</label>
                                <textarea
                                    id="motivo"
                                    name="motivo"
                                    rows="3"
                                    value={formData.motivo}
                                    onChange={handleChange}
                                    placeholder="Describa brevemente el síntoma..."
                                    className="form-control"
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 fw-bold py-2" disabled={enviando}>
                                Confirmar y Agendar Cita
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}