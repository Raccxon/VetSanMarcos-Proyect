// Calcula el estado de la vacuna en base a su fecha de vencimiento
// formato "AAAA-MM-DD"
// "hoy" es recibido como parametro para probar la funcion con fechas fijas

export function calcularEstadoVacuna(fechaVencimiento, hoy = new Date(), diasAviso = 30) {
    if (!fechaVencimiento) return 'Sin fecha'

    const vence = new Date(`${fechaVencimiento}T00:00:00`)
    if (Number.isNaN(vence.getTime())) return 'Sin fecha'

    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const dias = Math.round((vence - inicioHoy) / (1000 * 60 * 60 * 24))

    if (dias < 0) return 'Vencida'
    if (dias <= diasAviso) return 'Próxima a vencer'
    return 'Vigente'
}