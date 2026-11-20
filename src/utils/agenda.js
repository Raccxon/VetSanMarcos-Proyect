
// Horas de inicio permitidas: mañana de 09:00 a 12:00 y tarde de 15:00 a 17:00
export const BLOQUES_HORARIO = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '15:00', '15:30', '16:00', '16:30', '17:00'
]

// La atención termina a las 17:30 (1050 minutos desde las 00:00)
export const HORA_CIERRE_MINUTOS = 17 * 60 + 30

// "10:30" -> 630
export const horaAMinutos = (hora) => {
    const [h, m] = hora.split(':').map(Number)
    return h * 60 + m
}

// fecha en formato AAAA-MM-DD
export const esDomingo = (fecha) => {
    if (!fecha) return false
    return new Date(fecha + 'T00:00:00').getDay() === 0
}

// true si los dos tramos se pisan (que uno termine justo cuando empieza el otro no cuenta)
export const seSolapan = (horaA, duracionA, horaB, duracionB) => {
    const inicioA = horaAMinutos(horaA)
    const inicioB = horaAMinutos(horaB)
    return inicioA < inicioB + duracionB && inicioA + duracionA > inicioB
}

// true si empezar a esa hora, con esa duración, pasa del cierre o se cruza con una hora ocupada.
// "ocupadas" es lo que entrega GET /api/citas/ocupadas: [{ hora: '10:00', duracion: 30 }]
export const bloqueNoDisponible = (hora, duracion, ocupadas) => {
    if (horaAMinutos(hora) + duracion > HORA_CIERRE_MINUTOS) return true
    return ocupadas.some((o) => seSolapan(hora, duracion, o.hora, o.duracion))
}