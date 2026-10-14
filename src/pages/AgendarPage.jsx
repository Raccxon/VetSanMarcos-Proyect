import { useState } from 'react';
import { servicios } from '../data/servicios';
import { useCitas } from '../context/CitasContext.jsx';
import {
    rutValido,
    fechaNoPasada,
    formatearRut,
    formatearTelefonoChileno,
    telefonoChilenoValido,
    telefonoExtranjeroValido
} from '../utils/validaciones';
import { obtenerFechaHoy } from '../utils/fechas';

const horaAMinutos = (horaStr) => {
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
};

// Obtiene la duración del servicio según el servicioId
const obtenerDuracionServicio = (servicioId) => {
    const serv = servicios.find((s) => s.id === servicioId);
    if (!serv) return 30;

    const nombre = serv.nombre.toLowerCase();

    // Esterilización, castración y cirugías asignan 60 minutos automáticamente
    if (
        nombre.includes('cirug') ||
        nombre.includes('esteriliza') ||
        nombre.includes('castra')
    ) {
        return 60;
    }
    if (nombre.includes('vacun')) return 15;
    if (nombre.includes('examen') || nombre.includes('hemograma')) return 45;
    return 30;
};

export default function AgendarPage() {
    const { agregarCita, citas } = useCitas();

    const [formData, setFormData] = useState({
        nombreDuenio: '',
        rutDuenio: '',
        telefono: '',
        esExtranjero: false,
        email: '',
        nombreMascota: '',
        especie: 'Perro',
        servicioId: '',
        fecha: '',
        hora: '',
        motivo: ''
    });

    const [errores, setErrores] = useState({});
    const [citaConfirmada, setCitaConfirmada] = useState(null);

    const bloquesHorario = [
        '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '15:00',
        '15:30', '16:00', '16:30', '17:00'
    ];

    // Cierre de jornada establecido en 17:30 hrs (1050 min)
    const HORA_CIERRE_MINUTOS = horaAMinutos('17:30');

    const esDomingo = (fechaStr) => {
        if (!fechaStr) return false;
        const date = new Date(fechaStr + 'T00:00:00');
        return date.getDay() === 0;
    };

    const esHoraOcupadaOExcedeCierre = (horaEvaluar) => {
        if (!formData.fecha) return false;

        const minEvaluarInicio = horaAMinutos(horaEvaluar);
        const duracionNueva = formData.servicioId ? obtenerDuracionServicio(formData.servicioId) : 30;
        const minEvaluarFin = minEvaluarInicio + duracionNueva;

        // Bloquea horas que sobrepasen el cierre de las 17:30 hrs
        if (minEvaluarFin > HORA_CIERRE_MINUTOS) return true;

        const citasDelDia = (citas || []).filter((c) => c.fecha === formData.fecha && c.estado !== 'Cancelada');

        return citasDelDia.some((cita) => {
            const minCitaInicio = horaAMinutos(cita.hora);
            const duracionCita = cita.duracion || obtenerDuracionServicio(cita.servicioId);
            const minCitaFin = minCitaInicio + duracionCita;

            return minEvaluarInicio < minCitaFin && minEvaluarFin > minCitaInicio;
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && name === 'esExtranjero') {
            setFormData((prev) => ({
                ...prev,
                esExtranjero: checked,
                telefono: ''
            }));
            return;
        }

        let nuevoValor = value;

        if (name === 'rutDuenio') {
            nuevoValor = formatearRut(value);
        } else if (name === 'telefono' && !formData.esExtranjero) {
            nuevoValor = formatearTelefonoChileno(value);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: nuevoValor,
            ...(name === 'fecha' || name === 'servicioId' ? { hora: '' } : {})
        }));

        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.nombreDuenio.trim()) nuevosErrores.nombreDuenio = 'El nombre del dueño es obligatorio';

        if (!formData.rutDuenio.trim()) {
            nuevosErrores.rutDuenio = 'El RUT es obligatorio';
        } else if (!rutValido(formData.rutDuenio)) {
            nuevosErrores.rutDuenio = 'Ingrese un RUT válido (ej. 12345678-K)';
        }

        if (!formData.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es obligatorio';
        } else if (!formData.esExtranjero) {
            if (!telefonoChilenoValido(formData.telefono)) {
                nuevosErrores.telefono = 'Ingrese los 8 dígitos de su celular chileno';
            }
        } else {
            if (!telefonoExtranjeroValido(formData.telefono)) {
                nuevosErrores.telefono = 'Ingrese un código de país y número válido (ej. +5511999999999)';
            }
        }

        if (!formData.email.trim()) {
            nuevosErrores.email = 'El correo electrónico es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            nuevosErrores.email = 'Ingrese un correo electrónico válido';
        }

        if (!formData.nombreMascota.trim()) nuevosErrores.nombreMascota = 'El nombre de la mascota es obligatorio';
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
        } else if (esHoraOcupadaOExcedeCierre(formData.hora)) {
            nuevosErrores.hora = 'El horario seleccionado no está disponible o excede la jornada de atención';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        const servicioSeleccionado = servicios.find((s) => s.id === formData.servicioId);
        const duracion = obtenerDuracionServicio(formData.servicioId);

        const telefonoCompleto = formData.esExtranjero
            ? `${formData.telefono} (Internacional)`
            : `+56 9 ${formData.telefono} (Chile)`;

        const nuevaCita = {
            id: `CIT-${Date.now().toString().slice(-4)}`,
            ...formData,
            duracion,
            telefono: telefonoCompleto,
            servicioNombre: servicioSeleccionado ? servicioSeleccionado.nombre : '',
            precio: servicioSeleccionado ? servicioSeleccionado.precio : 0,
            estado: 'Pendiente'
        };

        agregarCita(nuevaCita);
        setCitaConfirmada(nuevaCita);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNuevaCita = () => {
        setCitaConfirmada(null);
        setFormData({
            nombreDuenio: '',
            rutDuenio: '',
            telefono: '',
            esExtranjero: false,
            email: '',
            nombreMascota: '',
            especie: 'Perro',
            servicioId: '',
            fecha: '',
            hora: '',
            motivo: ''
        });
    };

    const clase = (campo, base = 'form-control') => `${base} ${errores[campo] ? 'is-invalid' : ''}`;
    const duracionActual = formData.servicioId ? obtenerDuracionServicio(formData.servicioId) : 30;

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <h1 className="text-center mb-2">Agendar Cita Médica</h1>
                    <p className="text-center text-muted mb-4">Reserva la atención para tu mascota en Veterinaria San Marcos (Rancagua)</p>

                    {citaConfirmada ? (
                        <div className="alert alert-success text-center p-4">
                            <h2 className="h3 text-success mt-0">¡Cita Solicitada con Éxito!</h2>
                            <p>Tu solicitud ha sido registrada y está a la espera de confirmación.</p>

                            <div className="bg-white rounded p-3 my-4 text-start">
                                <p><strong>Código de Reserva:</strong> {citaConfirmada.id}</p>
                                <p><strong>Dueño:</strong> {citaConfirmada.nombreDuenio} (RUT: {citaConfirmada.rutDuenio})</p>
                                <p><strong>Teléfono:</strong> {citaConfirmada.telefono}</p>
                                <p><strong>Mascota:</strong> {citaConfirmada.nombreMascota} ({citaConfirmada.especie})</p>
                                <p><strong>Servicio:</strong> {citaConfirmada.servicioNombre}</p>
                                <p><strong>Fecha y Hora:</strong> {citaConfirmada.fecha} a las {citaConfirmada.hora} hrs</p>
                                <p><strong>Duración Estimada:</strong> {citaConfirmada.duracion} min</p>
                                <p className="mb-0"><strong>Valor Estimado:</strong> ${citaConfirmada.precio.toLocaleString('es-CL')}</p>
                            </div>

                            <button type="button" onClick={handleNuevaCita} className="btn btn-success">
                                Agendar otra cita
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="custom-card p-3 p-md-4">
                            <h3 className="h5 border-bottom pb-2 mb-3">1. Datos del Dueño</h3>
                            <div className="row g-3 mb-4">
                                <div className="col-12 col-md-6">
                                    <label htmlFor="nombreDuenio" className="form-label fw-bold">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        id="nombreDuenio"
                                        name="nombreDuenio"
                                        value={formData.nombreDuenio}
                                        onChange={handleChange}
                                        placeholder="Ej. Juan Pérez"
                                        className={clase('nombreDuenio')}
                                    />
                                    {errores.nombreDuenio && <div className="invalid-feedback">{errores.nombreDuenio}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label htmlFor="rutDuenio" className="form-label fw-bold">RUT *</label>
                                    <input
                                        type="text"
                                        id="rutDuenio"
                                        name="rutDuenio"
                                        maxLength={10}
                                        value={formData.rutDuenio}
                                        onChange={handleChange}
                                        placeholder="12345678-K"
                                        className={clase('rutDuenio')}
                                    />
                                    {errores.rutDuenio && <div className="invalid-feedback">{errores.rutDuenio}</div>}
                                </div>

                                <div className="col-12 col-md-6">
                                    <label htmlFor="telefono" className="form-label fw-bold">Teléfono *</label>
                                    {!formData.esExtranjero ? (
                                        <div className="input-group">
                                            <span className="input-group-text bg-light fw-bold">+56 9</span>
                                            <input
                                                type="tel"
                                                id="telefono"
                                                name="telefono"
                                                maxLength={8}
                                                value={formData.telefono}
                                                onChange={handleChange}
                                                placeholder="12345678"
                                                className={clase('telefono')}
                                            />
                                        </div>
                                    ) : (
                                        <input
                                            type="tel"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="+5511999999999"
                                            className={clase('telefono')}
                                        />
                                    )}
                                    {errores.telefono && <div className="invalid-feedback d-block">{errores.telefono}</div>}

                                    <div className="form-check mt-2">
                                        <input
                                            type="checkbox"
                                            id="esExtranjero"
                                            name="esExtranjero"
                                            className="form-check-input"
                                            checked={formData.esExtranjero}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="esExtranjero" className="form-check-label small text-muted">
                                            No poseo número chileno
                                        </label>
                                    </div>
                                </div>

                                <div className="col-12 col-md-6">
                                    <label htmlFor="email" className="form-label fw-bold">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ejemplo@correo.cl"
                                        className={clase('email')}
                                    />
                                    {errores.email && <div className="invalid-feedback">{errores.email}</div>}
                                </div>
                            </div>

                            <h3 className="h5 border-bottom pb-2 mb-3">2. Datos de la Mascota</h3>
                            <div className="row g-3 mb-4">
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
                            </div>

                            <h3 className="h5 border-bottom pb-2 mb-3">3. Selección de Hora</h3>
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
                                        {bloquesHorario.map((bloque) => {
                                            const ocupado = esHoraOcupadaOExcedeCierre(bloque);
                                            return (
                                                <option key={bloque} value={bloque} disabled={ocupado}>
                                                    {bloque} hrs {ocupado ? '(No disponible)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {errores.hora && <div className="invalid-feedback">{errores.hora}</div>}

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

                            <button type="submit" className="btn btn-primary w-100 fw-bold py-2">
                                Confirmar y Agendar Cita
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}