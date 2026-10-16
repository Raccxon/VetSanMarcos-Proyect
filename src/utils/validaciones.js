// Formatea RUT automáticamente (ej: 12345678-K)
export const formatearRut = (valor) => {
    const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length <= 1) return limpio;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    return `${cuerpo}-${dv}`;
};

// Formatea número chileno (solo 8 dígitos numéricos)
export const formatearTelefonoChileno = (valor) => {
    return valor.replace(/[^0-9]/g, '').slice(0, 8);
};

// Validaciones de RUT y Teléfonos
// RUT con formato 12345678-9 (acepta puntos y K). Solo revisa el formato.
export const rutValido = (rut) => {
    if (!rut) return false;
    return /^\d{7,8}-[\dkK]$/.test(rut.replace(/\./g, '').trim());
};

// Celular chileno: 912345678, +56912345678, +56 9 1234 5678
export const telefonoValido = (telefono) => {
    if (!telefono) return false;
    return /^(\+?56)?9\d{8}$/.test(telefono.replace(/[\s-]/g, ''));
};

export const telefonoChilenoValido = (numero) => {
    return /^[0-9]{8}$/.test(numero);
};

// Permite formatos internacionales flexibles (Ej: +5511999999999, +14155552671)
export const telefonoExtranjeroValido = (telefono) => {
    if (!telefono) return false;
    // Solo verifica que tenga al menos 7 dígitos y caracteres válidos (+, números y espacios)
    const soloNumeros = telefono.replace(/\D/g, '');
    return soloNumeros.length >= 7 && soloNumeros.length <= 15;
};

// true si la fecha (AAAA-MM-DD) es hoy o futura
// "hoy" se recibe como parámetro para poder probarlo con fechas fijas
export const fechaNoPasada = (fecha, hoy = new Date()) => {
    if (!fecha) return false;
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return fecha >= `${anio}-${mes}-${dia}`;
};