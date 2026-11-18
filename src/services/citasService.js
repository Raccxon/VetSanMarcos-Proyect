import { solicitar } from './api'

// Las citas de quien tiene la sesión abierta (GET /api/citas/mias)
export const listarMisCitas = () => solicitar('/api/citas/mias')

// Todas las citas: solo admin y recepción (el backend responde 403 a un cliente)
export const listarCitas = () => solicitar('/api/citas')

export const crearCita = (datos) =>
    solicitar('/api/citas', { metodo: 'POST', cuerpo: datos })

export const actualizarCita = (id, datos) =>
    solicitar(`/api/citas/${id}`, { metodo: 'PUT', cuerpo: datos })

// Solo admin y recepción
export const eliminarCita = (id) =>
    solicitar(`/api/citas/${id}`, { metodo: 'DELETE' })

// Horas ya tomadas de un día (AAAA-MM-DD): [{ hora: '10:00', duracion: 30 }]
export const horasOcupadas = (fecha) =>
    solicitar(`/api/citas/ocupadas?fecha=${encodeURIComponent(fecha)}`)

// El PUT del backend pide la cita completa. Arma ese cuerpo desde una cita que llegó del
// backend (con mascota y servicio anidados) y cambia solo lo que se indique.
// Ej.: cuerpoCita(cita, { estado: 'Cancelada' })
export const cuerpoCita = (cita, cambios = {}) => ({
    mascota: { id: cita.mascota.id },
    servicio: { id: cita.servicio.id },
    fecha: cita.fecha,
    hora: cita.hora,
    motivo: cita.motivo,
    estado: cita.estado,
    ...cambios,
})