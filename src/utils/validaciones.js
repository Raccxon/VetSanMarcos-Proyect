// Formatea RUT automáticamente (ej: 12345678-K)
export const formatearRut = (valor) => {
    const limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
    if (limpio.length <= 1) return limpio;
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    return `${cuerpo}-${dv}`;
};

// Deja el celular como lo espera el backend: 9 dígitos, sin espacios, guiones ni +56
export const normalizarTelefono = (telefono) => {
    return telefono.replace(/[\s-]/g, '').replace(/^\+?56/, '');
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

// RUT con puntos mientras se escribe: 12.345.678-5 (máximo 8 dígitos + verificador)
export const formatearRutConPuntos = (valor) => {
    const limpio = valor
        .replace(/[^0-9kK]/g, '')
        .toUpperCase()
        .replace(/K(?=.)/g, '')
        .slice(0, 9);
    if (limpio.length <= 1) return limpio;
    const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpo}-${limpio.slice(-1)}`;
};

// RUT de 7 u 8 dígitos con dígito verificador correcto (acepta puntos y guion)
export const rutConDvValido = (rut) => {
    const limpio = (rut ?? '').replace(/[.\-\s]/g, '').toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    return dv === esperado;
};

// Teléfono según el país elegido: solo dígitos, largo exacto y dígito inicial si el país lo exige
export const telefonoPaisValido = (pais, numero) => {
    if (!pais || !/^\d+$/.test(numero)) return false;
    if (numero.length !== pais.digitos) return false;
    return !pais.inicio || numero.startsWith(pais.inicio);
};

// Requisitos de la contraseña, para mostrarlos como guía mientras se escribe
export const requisitosPassword = (password) => [
    { texto: 'Mínimo 8 caracteres', cumple: password.length >= 8 },
    { texto: 'Una letra mayúscula', cumple: /[A-Z]/.test(password) },
    { texto: 'Una letra minúscula', cumple: /[a-z]/.test(password) },
    { texto: 'Un número', cumple: /\d/.test(password) },
];

export const passwordValida = (password) =>
    requisitosPassword(password).every((r) => r.cumple);