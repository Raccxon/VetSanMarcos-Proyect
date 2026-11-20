// "digitos" es el largo del número sin el prefijo. "inicio" es con qué dígito debe empezar (si aplica).
export const PAISES = [
    { codigo: 'CL', nombre: 'Chile', prefijo: '+56', digitos: 9, inicio: '9', ejemplo: '912345678' },
    { codigo: 'AR', nombre: 'Argentina', prefijo: '+54', digitos: 10, ejemplo: '1123456789' },
    { codigo: 'BO', nombre: 'Bolivia', prefijo: '+591', digitos: 8, ejemplo: '71234567' },
    { codigo: 'BR', nombre: 'Brasil', prefijo: '+55', digitos: 11, ejemplo: '11912345678' },
    { codigo: 'CO', nombre: 'Colombia', prefijo: '+57', digitos: 10, inicio: '3', ejemplo: '3123456789' },
    { codigo: 'EC', nombre: 'Ecuador', prefijo: '+593', digitos: 9, ejemplo: '991234567' },
    { codigo: 'US', nombre: 'EE.UU. / Canadá', prefijo: '+1', digitos: 10, ejemplo: '2025550123' },
    { codigo: 'MX', nombre: 'México', prefijo: '+52', digitos: 10, ejemplo: '5512345678' },
    { codigo: 'PY', nombre: 'Paraguay', prefijo: '+595', digitos: 9, ejemplo: '981123456' },
    { codigo: 'PE', nombre: 'Perú', prefijo: '+51', digitos: 9, inicio: '9', ejemplo: '912345678' },
    { codigo: 'UY', nombre: 'Uruguay', prefijo: '+598', digitos: 8, ejemplo: '94123456' },
    { codigo: 'VE', nombre: 'Venezuela', prefijo: '+58', digitos: 10, ejemplo: '4121234567' },
]

export const PAIS_POR_DEFECTO = 'CL'