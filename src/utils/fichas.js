import { historialMascotas } from "../data/citas";
import { rutValido } from "./validaciones";

const CLAVE_STORAGE = 'fichas'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Normaliza el RUT para compararlo (sin puntos, espacios ni may)
const normalizarRut = (rut) => rut.replace(/\./g, '').trim().toLowerCase()

export function cargarFichas() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_STORAGE))
        return Array.isArray(guardadas) ? guardadas : historialMascotas
    } catch {
        return historialMascotas
    }
}

export function guardarFichas(fichas) {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(fichas))
}

// Revision datos de la ficha. Devuelve el texto error o '' si esta bien
export function validarDatosFicha(datos) {
    if (!rutValido(datos.rutDuenio)) return 'El RUT debe tener formato 12345678-9'
    if (!datos.nombreDuenio?.trim()) return 'Debes ingresar el nombre del dueño'
    if (!EMAIL_VALIDO.test(datos.emailDuenio?.trim() ?? '')) return 'El correo del dueño no es valido'
    if (!datos.nombreMascota?.trim()) return 'Debes ingresar el nombre de la mascota'
    if (!datos.especie?.trim()) return 'Debes indicar la especie'
    return ''
}

// Armamos la ficha en base a los datos del formulario
function construirFicha(datos, base = {}) {
    return {
        vacunas: [],
        atenciones: [],
        ...base,
        rutDuenio: datos.rutDuenio.replace(/\./g, '').trim(),
        nombreDuenio: datos.nombreDuenio.trim(),
        emailDuenio: datos.emailDuenio.trim().toLowerCase(),
        mascota: {
            nombre: datos.nombreMascota.trim(),
            especie: datos.especie.trim(),
            raza: datos.raza?.trim() ?? '',
            edad: datos.edad?.trim() ?? '',
            chip: datos.chip?.trim() ?? '',
        },
    }
}

export function registrarFicha(fichas, datos) {
    const error = validarDatosFicha(datos)
    if (error) return { fichas, error }

    const rut = normalizarRut(datos.rutDuenio)
    if (fichas.some((f) => normalizarRut(f.rutDuenio) === rut)) {
        return { fichas, error: 'Ya existe una ficha con ese RUT'}
    }
    
    return { fichas: [...fichas, construirFicha(datos)], error: ''}
}

export function editarFicha(fichas, rutOriginal, datos) {
    const error = validarDatosFicha(datos)
    if(error) return { fichas, error }

    const rut = normalizarRut(rutOriginal)
    const nuevas = fichas.map((f) =>
        normalizarRut(f.rutDuenio) === rut
            ? construirFicha({...datos, rutDuenio: f.rutDuenio}, f)
            : f
    )
    return {fichas: nuevas, error: ''}
}