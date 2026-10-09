import { useState } from 'react'
import { servicios } from '../data/servicios'
import { useCitas } from '../context/CitasContext.jsx'

export default function AgendarPage() {
    const { agregarCita } = useCitas()
    // Estado para el formulario controlado
    const [formData, setFormData] = useState({
        nombreDuenio: '',
        rutDuenio: '',
        telefono: '',
        email: '',
        nombreMascota: '',
        especie: 'Perro',
        servicioId: '',
        fecha: '',
        hora: '',
        motivo: ''
    })

    // Estado para manejo de errores de validación
    const [errores, setErrores] = useState({})

    // Estado para la confirmación de la cita agendada
    const [citaConfirmada, setCitaConfirmada] = useState(null)

    // Manejador de cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
        // Limpiar el error del campo que se está editando
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: '' }))
        }
    }

    // Validaciones del formulario
    const validarFormulario = () => {
        const nuevosErrores = {}
        if (!formData.nombreDuenio.trim()) nuevosErrores.nombreDuenio = 'El nombre del dueño es obligatorio'
        if (!formData.rutDuenio.trim()) nuevosErrores.rutDuenio = 'El RUT es obligatorio'
        if (!formData.telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio'
        if (!formData.email.trim()) {
            nuevosErrores.email = 'El correo electrónico es obligatorio'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            nuevosErrores.email = 'Ingrese un correo electrónico válido'
        }
        if (!formData.nombreMascota.trim()) nuevosErrores.nombreMascota = 'El nombre de la mascota es obligatorio'
        if (!formData.servicioId) nuevosErrores.servicioId = 'Debe seleccionar un servicio'
        if (!formData.fecha) nuevosErrores.fecha = 'Debe seleccionar una fecha'
        if (!formData.hora) nuevosErrores.hora = 'Debe seleccionar un horario'

        setErrores(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    // Envio del formulario
    const handleSubmit = (e) => {
        e.preventDefault()

        if (!validarFormulario()) return

        // Buscar servicio seleccionado para mostrar en el resumen
        const servicioSeleccionado = servicios.find((s) => s.id === formData.servicioId)

        const nuevaCita = {
            id: `CIT-${Date.now().toString().slice(-4)}`,
            ...formData,
            servicioNombre: servicioSeleccionado ? servicioSeleccionado.nombre : '',
            precio: servicioSeleccionado ? servicioSeleccionado.precio : 0,
            estado: 'Pendiente'
        }

        // Mostrar modal / tarjeta de confirmación
        agregarCita(nuevaCita)
        setCitaConfirmada(nuevaCita)
    }

    // Reiniciar formulario para agendar otra hora
    const handleNuevaCita = () => {
        setCitaConfirmada(null)
        setFormData({
            nombreDuenio: '',
            rutDuenio: '',
            telefono: '',
            email: '',
            nombreMascota: '',
            especie: 'Perro',
            servicioId: '',
            fecha: '',
            hora: '',
            motivo: ''
        })
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Agendar Cita Médica</h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                Reserva la atención para tu mascota en Veterinaria San Marcos (Rancagua)
            </p>

            {/* TARJETA DE CONFIRMACIÓN */}
            {citaConfirmada ? (
                <div style={{
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #4caf50',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#2e7d32', marginTop: 0 }}>¡Cita Solicitada con Éxito!</h2>
                    <p>Tu solicitud ha sido registrada y está a la espera de confirmación.</p>

                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        padding: '16px',
                        margin: '20px 0',
                        textAlign: 'left',
                        display: 'inline-block',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <p><strong>Código de Reserva:</strong> {citaConfirmada.id}</p>
                        <p><strong>Dueño:</strong> {citaConfirmada.nombreDuenio} (RUT: {citaConfirmada.rutDuenio})</p>
                        <p><strong>Mascota:</strong> {citaConfirmada.nombreMascota} ({citaConfirmada.especie})</p>
                        <p><strong>Servicio:</strong> {citaConfirmada.servicioNombre}</p>
                        <p><strong>Fecha y Hora:</strong> {citaConfirmada.fecha} a las {citaConfirmada.hora} hrs</p>
                        <p><strong>Valor Estimado:</strong> ${citaConfirmada.precio.toLocaleString('es-CL')}</p>
                    </div>

                    <button
                        onClick={handleNuevaCita}
                        style={{
                            backgroundColor: '#2e7d32',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Agendar otra cita
                    </button>
                </div>
            ) : (
                /* FORMULARIO CONTROLADO */
                <form
                    onSubmit={handleSubmit}
                    className="custom-card p-3 p-md-4"
                >

                    {/* SECCIÓN DUEÑO */}
                    <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '8px' }}>1. Datos del Dueño</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="nombreDuenio"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                id="nombreDuenio"
                                name="nombreDuenio"
                                value={formData.nombreDuenio}
                                onChange={handleChange}
                                placeholder="Ej. Juan Pérez"
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                            {errores.nombreDuenio && <span style={{ color: 'red', fontSize: '12px' }}>{errores.nombreDuenio}</span>}
                        </div>

                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="rutDuenio"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                RUT *
                            </label>
                            <input
                                type="text"
                                id="rutDuenio"
                                name="rutDuenio"
                                value={formData.rutDuenio}
                                onChange={handleChange}
                                placeholder="12.345.678-9"
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                            {errores.rutDuenio && <span style={{ color: 'red', fontSize: '12px' }}>{errores.rutDuenio}</span>}
                        </div>

                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="telefono"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="+56 9 1234 5678"
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                            {errores.telefono && <span style={{ color: 'red', fontSize: '12px' }}>{errores.telefono}</span>}
                        </div>

                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="email"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                Correo Electrónico *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ejemplo@correo.cl"
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                            {errores.email && <span style={{ color: 'red', fontSize: '12px' }}>{errores.email}</span>}
                        </div>
                    </div>

                    {/* SECCIÓN MASCOTA */}
                    <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '8px' }}>2. Datos de la Mascota</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="nombreMascota"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                Nombre Mascota *
                            </label>
                            <input
                                type="text"
                                id="nombreMascota"
                                name="nombreMascota"
                                value={formData.nombreMascota}
                                onChange={handleChange}
                                placeholder="Ej. Cachupín"
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                            {errores.nombreMascota && <span style={{ color: 'red', fontSize: '12px' }}>{errores.nombreMascota}</span>}
                        </div>

                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="especie"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                Especie *
                            </label>
                            <select
                                name="especie"
                                id="especie"
                                value={formData.especie}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            >
                                <option value="Perro">Perro</option>
                                <option value="Gato">Gato</option>
                                <option value="Conejo">Conejo</option>
                                <option value="Ave">Ave</option>
                            </select>
                        </div>
                    </div>

                    {/* SECCIÓN SERVICIO Y FECHA */}
                    <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '8px' }}>3. Selección de Hora</h3>
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="servicioId"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                Servicio Requerido *
                            </label>
                            <select
                                name="servicioId"
                                id="servicioId"
                                value={formData.servicioId}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            >
                                <option value="">-- Seleccione un servicio --</option>
                                {servicios.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nombre} (${s.precio.toLocaleString('es-CL')})
                                    </option>
                                ))}
                            </select>
                            {errores.servicioId && <span style={{ color: 'red', fontSize: '12px' }}>{errores.servicioId}</span>}
                        </div>

                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="fecha"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                Fecha *
                            </label>
                            <input
                                type="date"
                                id="fecha"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                            {errores.fecha && <span style={{ color: 'red', fontSize: '12px' }}>{errores.fecha}</span>}
                        </div>

                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="hora"
                                style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                            >
                                Horario Disponibles *
                            </label>
                            <select
                                name="hora"
                                id="hora"
                                value={formData.hora}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            >
                                <option value="">-- Seleccione un bloque --</option>
                                <option value="09:00">09:00 hrs</option>
                                <option value="10:00">10:00 hrs</option>
                                <option value="11:00">11:00 hrs</option>
                                <option value="12:00">12:00 hrs</option>
                                <option value="15:00">15:00 hrs</option>
                                <option value="16:00">16:00 hrs</option>
                                <option value="17:00">17:00 hrs</option>
                            </select>
                            {errores.hora && <span style={{ color: 'red', fontSize: '12px' }}>{errores.hora}</span>}
                        </div>
                    </div>

                    <div className="col-12 col-md-6" style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="motivo"
                            style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}
                        >
                            Motivo de la consulta / Observaciones
                        </label>
                        <textarea
                            id="motivo"
                            name="motivo"
                            rows="3"
                            value={formData.motivo}
                            onChange={handleChange}
                            placeholder="Describa brevemente el síntoma o motivo..."
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Confirmar y Agendar Cita
                    </button>
                </form>
            )}
        </div>
    )
}