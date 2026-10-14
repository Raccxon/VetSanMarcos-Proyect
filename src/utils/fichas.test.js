import { beforeEach, describe, expect, it } from 'vitest'
import {
    cargarFichas,
    guardarFichas,
    registrarFicha,
    editarFicha,
    validarDatosFicha,
} from './fichas'

const datosValidos = {
    rutDuenio: '11222333-4',
    nombreDuenio: 'María Soto',
    emailDuenio: 'Maria@Correo.cl',
    nombreMascota: 'Luna',
    especie: 'Gato',
    raza: 'Siamés',
    edad: '2 años',
    chip: '',
}

const fichaExistente = {
    rutDuenio: '12345678-9',
    emailDuenio: 'jperez@gmail.com',
    nombreDuenio: 'Juan Pérez',
    mascota: { nombre: 'Firulais', especie: 'Perro', raza: 'Kutxi', edad: '3 años', chip: '1' },
    vacunas: [{ id: 'V1' }],
    atenciones: [],
}

beforeEach(() => {
    localStorage.clear()
})

describe('fichas', () => {
    it('sin datos guardados parte de las fichas iniciales', () => {
        const fichas = cargarFichas()
        expect(fichas.some((f) => f.rutDuenio === '12345678-9')).toBe(true)
    })

    it('recupera las fichas guardadas', () => {
        guardarFichas([fichaExistente])
        expect(cargarFichas()).toEqual([fichaExistente])
    })

    it('si lo guardado está dañado usa las fichas iniciales', () => {
        localStorage.setItem('fichas', '{no es json')
        expect(cargarFichas().length).toBeGreaterThan(0)
    })

    it('rechaza un RUT con formato inválido', () => {
        expect(validarDatosFicha({ ...datosValidos, rutDuenio: '123' })).toMatch(/RUT/)
    })

    it('rechaza un correo inválido', () => {
        expect(validarDatosFicha({ ...datosValidos, emailDuenio: 'sin-arroba' })).toMatch(/correo/)
    })

    it('registra una ficha nueva sin vacunas ni atenciones y con el correo en minúsculas', () => {
        const { fichas, error } = registrarFicha([fichaExistente], datosValidos)

        expect(error).toBe('')
        expect(fichas).toHaveLength(2)
        expect(fichas[1]).toMatchObject({
            rutDuenio: '11222333-4',
            emailDuenio: 'maria@correo.cl',
            vacunas: [],
            atenciones: [],
        })
        expect(fichas[1].mascota.nombre).toBe('Luna')
    })

    it('no registra dos fichas con el mismo RUT', () => {
        const { fichas, error } = registrarFicha([fichaExistente], {
            ...datosValidos,
            rutDuenio: '12.345.678-9',
        })

        expect(error).toMatch(/Ya existe/)
        expect(fichas).toHaveLength(1)
    })

    it('edita solo la ficha indicada y conserva sus vacunas', () => {
        const otra = { ...fichaExistente, rutDuenio: '9999999-9' }
        const { fichas, error } = editarFicha([fichaExistente, otra], '12345678-9', {
            ...datosValidos,
            nombreMascota: 'Firu',
        })

        expect(error).toBe('')
        expect(fichas[0].mascota.nombre).toBe('Firu')
        expect(fichas[0].rutDuenio).toBe('12345678-9')
        expect(fichas[0].vacunas).toEqual([{ id: 'V1' }])
        expect(fichas[1]).toEqual(otra)
    })

    it('no edita si los datos son inválidos', () => {
        const { fichas, error } = editarFicha([fichaExistente], '12345678-9', {
            ...datosValidos,
            nombreMascota: '',
        })

        expect(error).toMatch(/mascota/)
        expect(fichas).toEqual([fichaExistente])
    })
})