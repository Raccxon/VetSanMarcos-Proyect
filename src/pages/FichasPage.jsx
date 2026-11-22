import { useEffect, useState } from 'react'
import { listarMascotas, actualizarMascota } from '../services/mascotaService'
import VacunasMascota from '../components/fichas/VacunasMascota'
import AtencionesMascota from '../components/fichas/AtencionesMascota'

const ESPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otra']

// Datos básicos de la mascota (con su microchip). El dueño no se cambia desde aquí.
function DatosMascota({ mascota, onGuardada }) {
    const [formulario, setFormulario] = useState({
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza ?? '',
        edad: String(mascota.edad ?? ''),
        chip: mascota.chip ?? ''
    })
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [guardando, setGuardando] = useState(false)

    // Si la mascota tiene una especie fuera de la lista, se agrega para no perderla
    const especies = ESPECIES.includes(mascota.especie) ? ESPECIES : [mascota.especie, ...ESPECIES]
    const dueno = mascota.dueno

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value })
        setMensaje('')
    }

    const validar = () => {
        if (!formulario.nombre.trim()) return 'El nombre de la mascota es obligatorio'
        if (!formulario.raza.trim()) return 'La raza es obligatoria'

        const edad = Number(formulario.edad)
        if (formulario.edad === '' || !Number.isInteger(edad) || edad < 0 || edad > 40) {
            return 'La edad debe ser un número entero entre 0 y 40'
        }
        if (formulario.chip.trim().length > 30) return 'El chip no puede superar 30 caracteres'
        return ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMensaje('')

        const problema = validar()
        if (problema) {
            setError(problema)
            return
        }

        setGuardando(true)
        setError('')
        try {
            const actualizada = await actualizarMascota(mascota.id, {
                nombre: formulario.nombre.trim(),
                especie: formulario.especie,
                raza: formulario.raza.trim(),
                edad: Number(formulario.edad),
                // Un chip en blanco lo borra; si el campo no se envía, el backend conserva el anterior
                chip: formulario.chip.trim(),
                dueno: { id: dueno.id }
            })
            onGuardada(actualizada)
            setMensaje('Datos de la mascota actualizados.')
        } catch (err) {
            setError(err.message)
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="card shadow-sm mb-4">
            <div className="card-body">
                <h3 className="h5 mb-1">Datos de la mascota</h3>
                <p className="text-muted small mb-3">
                    Dueño: <strong>{dueno?.nombre}</strong> · RUT {dueno?.rut ?? 'sin RUT'} · Tel. {dueno?.telefono ?? '—'}
                </p>

                <div className="row g-2 mb-2">
                    <div className="col-12 col-md-6">
                        <label htmlFor="mascota-nombre" className="form-label">Nombre</label>
                        <input
                            id="mascota-nombre"
                            name="nombre"
                            className="form-control"
                            value={formulario.nombre}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-12 col-md-6">
                        <label htmlFor="mascota-especie" className="form-label">Especie</label>
                        <select
                            id="mascota-especie"
                            name="especie"
                            className="form-select"
                            value={formulario.especie}
                            onChange={handleChange}
                        >
                            {especies.map((e) => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-4">
                        <label htmlFor="mascota-raza" className="form-label">Raza</label>
                        <input
                            id="mascota-raza"
                            name="raza"
                            className="form-control"
                            value={formulario.raza}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-6 col-md-3">
                        <label htmlFor="mascota-edad" className="form-label">Edad (años)</label>
                        <input
                            id="mascota-edad"
                            name="edad"
                            type="number"
                            min="0"
                            max="40"
                            className="form-control"
                            value={formulario.edad}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-6 col-md-5">
                        <label htmlFor="mascota-chip" className="form-label">N° de microchip</label>
                        <input
                            id="mascota-chip"
                            name="chip"
                            className="form-control"
                            value={formulario.chip}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger py-2" role="alert">
                        {error}
                    </div>
                )}
                {mensaje && (
                    <div className="alert alert-success py-2" role="status">
                        {mensaje}
                    </div>
                )}

                <button type="submit" className="btn btn-success btn-sm" disabled={guardando}>
                    Guardar datos
                </button>
            </div>
        </form>
    )
}

export default function FichasPage() {
    const [mascotas, setMascotas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [errorCarga, setErrorCarga] = useState('')
    const [busqueda, setBusqueda] = useState('')
    // id de la mascota cuya ficha se está viendo (null = ninguna)
    const [seleccionada, setSeleccionada] = useState(null)

    // Al abrir la pantalla se piden al backend todas las mascotas (solo admin y recepción pueden)
    useEffect(() => {
        let activo = true

        listarMascotas()
            .then((lista) => {
                if (activo) setMascotas(lista)
            })
            .catch((err) => {
                if (activo) setErrorCarga(err.message)
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => {
            activo = false
        }
    }, [])

    const texto = busqueda.trim().toLowerCase()
    const visibles = mascotas.filter((m) =>
        m.nombre.toLowerCase().includes(texto) ||
        (m.dueno?.nombre ?? '').toLowerCase().includes(texto) ||
        (m.dueno?.rut ?? '').toLowerCase().includes(texto)
    )

    const mascota = mascotas.find((m) => m.id === seleccionada)

    const reemplazar = (actualizada) =>
        setMascotas((prev) => prev.map((m) => (m.id === actualizada.id ? actualizada : m)))

    return (
        <div className="container py-4">
            <h1 className="h3 fw-bold text-success mb-4">Gestión de Fichas</h1>

            {errorCarga && (
                <div className="alert alert-danger" role="alert">
                    {errorCarga}
                </div>
            )}

            <div className="row g-4">
                <div className="col-12 col-lg-5">
                    <label htmlFor="buscar-ficha" className="form-label">Buscar por mascota, dueño o RUT</label>
                    <input
                        id="buscar-ficha"
                        className="form-control mb-3"
                        placeholder="Ej. Firulais / 12345678-9"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />

                    {cargando ? (
                        <p className="text-muted">Cargando mascotas...</p>
                    ) : visibles.length === 0 ? (
                        !errorCarga && (
                            <div className="alert alert-info" role="status">
                                No se encontraron mascotas.
                            </div>
                        )
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-success">
                                    <tr>
                                        <th>RUT</th>
                                        <th>Dueño</th>
                                        <th>Mascota</th>
                                        <th>Ficha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibles.map((m) => (
                                        <tr key={m.id} className={m.id === seleccionada ? 'table-active' : ''}>
                                            <td>{m.dueno?.rut ?? 'Sin RUT'}</td>
                                            <td>{m.dueno?.nombre}</td>
                                            <td>
                                                {m.nombre} ({m.especie})
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    aria-label={`Ver ficha de ${m.nombre}`}
                                                    onClick={() => setSeleccionada(m.id)}
                                                >
                                                    Ver ficha
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="col-12 col-lg-7">
                    {mascota ? (
                        <>
                            <h2 className="h4 mb-3">Ficha de {mascota.nombre}</h2>
                            {/* key: al cambiar de mascota cada bloque parte de cero con sus propios datos */}
                            <DatosMascota key={`datos-${mascota.id}`} mascota={mascota} onGuardada={reemplazar} />
                            <VacunasMascota key={`vacunas-${mascota.id}`} mascotaId={mascota.id} />
                            <AtencionesMascota key={`atenciones-${mascota.id}`} mascotaId={mascota.id} />
                        </>
                    ) : (
                        <div className="alert alert-secondary" role="status">
                            Selecciona una mascota para ver su ficha.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}