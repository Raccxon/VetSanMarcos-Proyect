import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgendarPage from './AgendarPage'
import { getServicios } from '../services/apiServices'
import { listarMisMascotas, crearMascota } from '../services/mascotaService'
import { crearCita, horasOcupadas } from '../services/citasService'

// Se reemplazan los servicios: el test no necesita el backend encendido
vi.mock('../services/apiServices', () => ({ getServicios: vi.fn() }))
vi.mock('../services/mascotaService', () => ({ listarMisMascotas: vi.fn(), crearMascota: vi.fn() }))
vi.mock('../services/citasService', () => ({ crearCita: vi.fn(), horasOcupadas: vi.fn() }))

// Lo que devolvería el backend
const SERVICIOS = [
    { id: 1, nombre: 'Consulta general', precio: 15000, duracion: 30 },
    { id: 5, nombre: 'Esterilización hembra canina', precio: 60000, duracion: 90 },
]
const MASCOTAS = [
    { id: 3, nombre: 'Luna', especie: 'Perro' },
    { id: 6, nombre: 'Michi', especie: 'Gato' },
]
const CITA_CREADA = {
    id: 12,
    mascota: MASCOTAS[0],
    servicio: SERVICIOS[0],
    fecha: '2030-01-15', hora: '10:00', motivo: null, estado: 'Pendiente',
}

const FECHA = '2030-01-15'     // martes
const DOMINGO = '2030-01-20'

// Espera a que termine de cargar el catálogo y las mascotas
const renderPagina = async () => {
    render(
        <MemoryRouter>
            <AgendarPage />
        </MemoryRouter>
    )
    await screen.findByRole('option', { name: /Consulta general/ })
}

const poner = (etiqueta, value) =>
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } })

const horario = () => screen.getByLabelText(/Horario Disponible/)

const enviar = () =>
    fireEvent.click(screen.getByRole('button', { name: /confirmar y agendar cita/i }))

// Elige una mascota existente, un servicio, la fecha y la hora
const elegirTodo = async ({ servicio = '1', hora = '10:00' } = {}) => {
    poner('Mascota *', '3')
    poner('Servicio Requerido *', servicio)
    poner('Fecha *', FECHA)
    await waitFor(() => expect(horasOcupadas).toHaveBeenCalledWith(FECHA))
    poner(/Horario Disponible/, hora)
}

beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn()   // jsdom no lo implementa
    localStorage.clear()
    localStorage.setItem('userSession',
        JSON.stringify({ id: 4, email: 'ana@correo.cl', rol: 'cliente', nombre: 'Ana Pérez' }))
    getServicios.mockResolvedValue(SERVICIOS)
    listarMisMascotas.mockResolvedValue(MASCOTAS)
    horasOcupadas.mockResolvedValue([])
    crearCita.mockResolvedValue(CITA_CREADA)
    crearMascota.mockResolvedValue({ id: 9, nombre: 'Rex', especie: 'Perro' })
})

describe('AgendarPage: datos desde el backend', () => {
    it('carga el catálogo y las mascotas del cliente', async () => {
        await renderPagina()

        expect(screen.getByRole('option', { name: /Esterilización hembra canina/ })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Luna (Perro)' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Michi (Gato)' })).toBeInTheDocument()
        expect(getServicios).toHaveBeenCalledTimes(1)
        expect(listarMisMascotas).toHaveBeenCalledTimes(1)
    })

    it('ya no pide los datos del dueño: salen de la sesión', async () => {
        await renderPagina()

        expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
        expect(screen.queryByLabelText(/RUT/)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/Correo Electrónico/)).not.toBeInTheDocument()
    })

    it('si falla la carga muestra el error del servidor', async () => {
        getServicios.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
        render(<MemoryRouter><AgendarPage /></MemoryRouter>)

        expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar')
    })

    it('si el cliente no tiene mascotas, abre directo el registro de una nueva', async () => {
        listarMisMascotas.mockResolvedValue([])
        await renderPagina()

        expect(screen.getByLabelText('Nombre Mascota *')).toBeInTheDocument()
    })

    it('si el cliente tiene una sola mascota, queda elegida', async () => {
        listarMisMascotas.mockResolvedValue([MASCOTAS[0]])
        await renderPagina()

        expect(screen.getByLabelText('Mascota *')).toHaveValue('3')
    })
})

describe('AgendarPage: validaciones del formulario', () => {
    it('muestra errores al enviar el formulario vacío', async () => {
        await renderPagina()

        enviar()

        expect(screen.getByText('Debe seleccionar una mascota')).toBeInTheDocument()
        expect(screen.getByText('Debe seleccionar un servicio')).toBeInTheDocument()
        expect(screen.getByText('Debe seleccionar una fecha')).toBeInTheDocument()
        expect(screen.getByText('Debe seleccionar un horario')).toBeInTheDocument()
        expect(crearCita).not.toHaveBeenCalled()
    })

    it('rechaza una fecha anterior a hoy', async () => {
        await renderPagina()

        poner('Mascota *', '3')
        poner('Servicio Requerido *', '1')
        poner('Fecha *', '2020-01-01')
        poner(/Horario Disponible/, '10:00')
        enviar()

        expect(screen.getByText('La fecha no puede ser anterior a hoy')).toBeInTheDocument()
        expect(crearCita).not.toHaveBeenCalled()
    })

    it('rechaza los domingos y no deja elegir horario', async () => {
        await renderPagina()

        poner('Fecha *', DOMINGO)
        expect(horario()).toBeDisabled()

        poner('Mascota *', '3')
        poner('Servicio Requerido *', '1')
        enviar()

        expect(screen.getByText(/cerrada los días domingos/)).toBeInTheDocument()
        expect(crearCita).not.toHaveBeenCalled()
        expect(horasOcupadas).not.toHaveBeenCalled()
    })

    it('al registrar una mascota nueva exige nombre, raza y una edad válida', async () => {
        await renderPagina()

        poner('Mascota *', 'nueva')
        poner('Edad (años) *', '50')
        enviar()

        expect(screen.getByText('El nombre de la mascota es obligatorio')).toBeInTheDocument()
        expect(screen.getByText('La raza es obligatoria')).toBeInTheDocument()
        expect(screen.getByText('La edad debe ser un número entero entre 0 y 40')).toBeInTheDocument()
        expect(crearMascota).not.toHaveBeenCalled()
    })
})

describe('AgendarPage: horas ocupadas', () => {
    it('pide al backend las horas ocupadas de la fecha elegida y bloquea esas horas', async () => {
        horasOcupadas.mockResolvedValue([{ hora: '10:00', duracion: 30 }])
        await renderPagina()

        poner('Servicio Requerido *', '1')
        poner('Fecha *', FECHA)

        expect(await screen.findByRole('option', { name: /10:00 hrs \(No disponible\)/ })).toBeDisabled()
        expect(screen.getByRole('option', { name: '10:30 hrs' })).not.toBeDisabled()
        expect(horasOcupadas).toHaveBeenCalledWith(FECHA)
    })

    it('un servicio de 90 minutos bloquea las horas que se cruzan y las que pasan del cierre', async () => {
        horasOcupadas.mockResolvedValue([{ hora: '10:00', duracion: 30 }])
        await renderPagina()

        poner('Servicio Requerido *', '5')
        poner('Fecha *', FECHA)

        // 09:00 + 90 min pisa la cita de las 10:00; 17:00 + 90 min pasa de las 17:30
        expect(await screen.findByRole('option', { name: /09:00 hrs \(No disponible\)/ })).toBeDisabled()
        expect(screen.getByRole('option', { name: /17:00 hrs \(No disponible\)/ })).toBeDisabled()
        expect(screen.getByRole('option', { name: '16:00 hrs' })).not.toBeDisabled()
    })

    it('si no se pueden cargar las horas ocupadas, avisa pero deja elegir', async () => {
        horasOcupadas.mockRejectedValue(new Error('No se pudo conectar con el servidor'))
        await renderPagina()

        poner('Fecha *', FECHA)

        expect(await screen.findByText(/No se pudieron cargar los horarios ocupados/)).toBeInTheDocument()
        expect(screen.getByRole('option', { name: '10:00 hrs' })).not.toBeDisabled()
    })
})

describe('AgendarPage: agendar la cita', () => {
    it('crea la cita con los ids elegidos y muestra la confirmación del backend', async () => {
        await renderPagina()

        await elegirTodo()
        poner(/Motivo/, 'Control anual')
        enviar()

        expect(await screen.findByRole('heading', { name: '¡Cita Solicitada con Éxito!' })).toBeInTheDocument()
        expect(crearCita).toHaveBeenCalledWith({
            mascota: { id: 3 },
            servicio: { id: 1 },
            fecha: FECHA,
            hora: '10:00',
            motivo: 'Control anual',
        })
        expect(crearMascota).not.toHaveBeenCalled()
        expect(screen.getByText('12')).toBeInTheDocument()
        expect(screen.getByText(/Luna \(Perro\)/)).toBeInTheDocument()
        expect(screen.getByText('Consulta general')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Ver mis citas' })).toHaveAttribute('href', '/mis-citas')
    })

    it('sin motivo, lo envía vacío (null)', async () => {
        await renderPagina()

        await elegirTodo()
        enviar()

        await screen.findByRole('heading', { name: '¡Cita Solicitada con Éxito!' })
        expect(crearCita.mock.calls[0][0].motivo).toBeNull()
    })

    it('con una mascota nueva la registra a nombre de la sesión y luego agenda con su id', async () => {
        await renderPagina()

        poner('Mascota *', 'nueva')
        poner('Nombre Mascota *', 'Rex')
        poner('Raza *', 'Mestizo')
        poner('Edad (años) *', '2')
        poner('Servicio Requerido *', '1')
        poner('Fecha *', FECHA)
        await waitFor(() => expect(horasOcupadas).toHaveBeenCalled())
        poner(/Horario Disponible/, '11:00')
        enviar()

        await screen.findByRole('heading', { name: '¡Cita Solicitada con Éxito!' })
        expect(crearMascota).toHaveBeenCalledWith({
            nombre: 'Rex', especie: 'Perro', raza: 'Mestizo', edad: 2, dueno: { id: 4 },
        })
        expect(crearCita.mock.calls[0][0].mascota).toEqual({ id: 9 })
    })

    it('si la cita falla después de crear la mascota, el reintento no la crea de nuevo', async () => {
        crearCita.mockRejectedValueOnce(Object.assign(new Error('Ese horario ya está ocupado'), { status: 409 }))
        await renderPagina()

        poner('Mascota *', 'nueva')
        poner('Nombre Mascota *', 'Rex')
        poner('Raza *', 'Mestizo')
        poner('Edad (años) *', '2')
        poner('Servicio Requerido *', '1')
        poner('Fecha *', FECHA)
        await waitFor(() => expect(horasOcupadas).toHaveBeenCalled())
        poner(/Horario Disponible/, '11:00')
        enviar()

        expect(await screen.findByRole('alert')).toHaveTextContent('Ese horario ya está ocupado')

        // el cliente elige otra hora y reintenta
        poner(/Horario Disponible/, '11:30')
        enviar()

        await screen.findByRole('heading', { name: '¡Cita Solicitada con Éxito!' })
        expect(crearMascota).toHaveBeenCalledTimes(1)
        expect(crearCita).toHaveBeenCalledTimes(2)
        expect(crearCita.mock.calls[1][0].mascota).toEqual({ id: 9 })
    })

    it('si el horario ya fue tomado (409) muestra el mensaje, limpia la hora y vuelve a pedir las ocupadas', async () => {
        crearCita.mockRejectedValue(Object.assign(new Error('Ese horario ya está ocupado'), { status: 409 }))
        await renderPagina()

        await elegirTodo()
        enviar()

        expect(await screen.findByRole('alert')).toHaveTextContent('Ese horario ya está ocupado')
        expect(horario()).toHaveValue('')
        await waitFor(() => expect(horasOcupadas).toHaveBeenCalledTimes(2))
        expect(screen.queryByRole('heading', { name: '¡Cita Solicitada con Éxito!' })).not.toBeInTheDocument()
    })

    it('"Agendar otra cita" vuelve al formulario vacío', async () => {
        await renderPagina()

        await elegirTodo()
        enviar()
        await screen.findByRole('heading', { name: '¡Cita Solicitada con Éxito!' })

        fireEvent.click(screen.getByRole('button', { name: 'Agendar otra cita' }))

        expect(screen.getByLabelText('Servicio Requerido *')).toHaveValue('')
        expect(screen.getByLabelText('Fecha *')).toHaveValue('')
    })
})