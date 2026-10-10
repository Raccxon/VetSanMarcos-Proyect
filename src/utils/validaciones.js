// Validaciones del formulario de Agendar (funciones puras, fáciles de probar)

// RUT con formato 12345678-9 (acepta puntos y K). Solo revisa el formato.
export function rutValido(rut) {
    if (!rut) return false
    return /^\d{7,8}-[\dkK]$/.test(rut.replace(/\./g, '').trim())
}

// Celular chileno: 912345678, +56912345678, +56 9 1234 5678
export function telefonoValido(telefono) {
    if (!telefono) return false
    return /^(\+?56)?9\d{8}$/.test(telefono.replace(/[\s-]/g, ''))
}

// true si la fecha (AAAA-MM-DD) es hoy o futura
// "hoy" se recibe como parámetro para poder probarlo con fechas fijas
export function fechaNoPasada(fecha, hoy = new Date()) {
    if (!fecha) return false
    const anio = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    return fecha >= `${anio}-${mes}-${dia}`
}