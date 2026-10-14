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
export const rutValido = (rut) => {
    return /^[0-9]+-[0-9kK]{1}$/.test(rut);
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

export const fechaNoPasada = (fechaStr) => {
    const hoy = new Date().toISOString().split('T')[0];
    return fechaStr >= hoy;
};