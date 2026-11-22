import { useEffect, useState } from 'react'
import {
    listarAtenciones,
    crearAtencion,
    actualizarAtencion,
    eliminarAtencion
} from '../../services/atencionService'
import { obtenerFechaHoy } from '../../utils/fechas'

const FORM_VACIO = { fecha: '', motivo: '', diagnostico: '', tratamiento: '' }

// De la más reciente a la más antigua, igual que el backend
const ordenar = (lista) =>
    [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)

// Historial clínico de una mascota. Con soloLectura (el dueño mirando la ficha) no se muestra el formulario
export default function AtencionesMascota({ mascotaId, soloLectura = false }) {
    const [atenciones, setAtenciones] = useState([])
    const [cargando, setCargando] = useState(true)
    const [errorCarga, setErrorCarga] = useState('')
    const [errorAccion, setErrorAccion] = useState('')

    const [formulario, setFormulario] = useState(FORM_VACIO)
    // id de la atención que se está editando (null = se está registrando una nueva)
    const [editando, setEditando] = useState(null)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true

        listarAtenciones(mascotaId)
            .then((lista) => {
                if (activo) setAtenciones(ordenar(lista))
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
    }, [mascotaId])

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value })
    }

    const limpiar = () => {
        setFormulario(FORM_VACIO)
        setEditando(null)
        setErrorFormulario('')
    }

    const validar = () => {
        if (!formulario.fecha) return 'La fecha de la atención es obligatoria'
        if (formulario.fecha > obtenerFechaHoy()) return 'La fecha de la atención no puede ser futura'
        if (!formulario.motivo.trim()) return 'El motivo es obligatorio'
        return ''
    }

    const handleEditar = (atencion) => {
        setEditando(atencion.id)
        setErrorFormulario('')
        setErrorAccion('')
        setFormulario({
            fecha: atencion.fecha,
            motivo: atencion.motivo,
            diagnostico: atencion.diagnostico ?? '',
            tratamiento: atencion.tratamiento ?? ''
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorAccion('')

        const error = validar()
        if (error) {
            setErrorFormulario(error)
            return
        }

        const datos = {
            fecha: formulario.fecha,
            motivo: formulario.motivo.trim(),
            diagnostico: formulario.diagnostico.trim() || null,
            tratamiento: formulario.tratamiento.trim() || null
        }

        setGuardando(true)
        try {
            if (editando) {
                const actualizada = await actualizarAtencion(editando, datos)
                setAtenciones((prev) => ordenar(prev.map((a) => (a.id === actualizada.id ? actualizada : a))))
            } else {
                const creada = await crearAtencion(mascotaId, datos)
                setAtenciones((prev) => ordenar([...prev, creada]))
            }
            limpiar()
        } catch (err) {
            // Ej.: el backend rechaza la fecha (400) o la sesión no tiene permiso (403)
            setErrorFormulario(err.message)
        } finally {
            setGuardando(false)
        }
    }

    const handleEliminar = async (atencion) => {
        if (!window.confirm(`¿Eliminar la atención del ${atencion.fecha}?`)) return

        setErrorAccion('')
        try {
            await eliminarAtencion(atencion.id)
            setAtenciones((prev) => prev.filter((a) => a.id !== atencion.id))
            if (editando === atencion.id) limpiar()
        } catch (err) {
            setErrorAccion(err.message)
        }
    }

    return (
        <section className="card shadow-sm mb-4">
            <div className="card-body">
                <h3 className="h5 mb-3">Historial de atenciones</h3>

                {errorCarga && (
                    <div className="alert alert-danger py-2" role="alert">
                        {errorCarga}
                    </div>
                )}
                {errorAccion && (
                    <div className="alert alert-danger py-2" role="alert">
                        {errorAccion}
                    </div>
                )}

                {cargando ? (
                    <p className="text-muted">Cargando atenciones...</p>
                ) : atenciones.length === 0 ? (
                    !errorCarga && <p className="text-muted">Sin atenciones registradas.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm align-middle">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Motivo</th>
                                    <th>Diagnóstico</th>
                                    <th>Tratamiento</th>
                                    {!soloLectura && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {atenciones.map((a) => (
                                    <tr key={a.id}>
                                        <td>{a.fecha}</td>
                                        <td>{a.motivo}</td>
                                        <td>{a.diagnostico ?? '—'}</td>
                                        <td>{a.tratamiento ?? '—'}</td>
                                        {!soloLectura && (
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        aria-label={`Editar atención del ${a.fecha}`}
                                                        onClick={() => handleEditar(a)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        aria-label={`Eliminar atención del ${a.fecha}`}
                                                        onClick={() => handleEliminar(a)}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!soloLectura && (
                    <form onSubmit={handleSubmit} noValidate className="border-top pt-3">
                        <h4 className="h6 mb-2">{editando ? 'Editar atención' : 'Registrar atención'}</h4>

                        <div className="row g-2 mb-2">
                            <div className="col-12 col-md-4">
                                <label htmlFor="atencion-fecha" className="form-label">Fecha de la atención</label>
                                <input
                                    id="atencion-fecha"
                                    name="fecha"
                                    type="date"
                                    max={obtenerFechaHoy()}
                                    className="form-control"
                                    value={formulario.fecha}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12 col-md-8">
                                <label htmlFor="atencion-motivo" className="form-label">Motivo</label>
                                <input
                                    id="atencion-motivo"
                                    name="motivo"
                                    className="form-control"
                                    value={formulario.motivo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label htmlFor="atencion-diagnostico" className="form-label">Diagnóstico</label>
                                <textarea
                                    id="atencion-diagnostico"
                                    name="diagnostico"
                                    rows="2"
                                    className="form-control"
                                    value={formulario.diagnostico}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label htmlFor="atencion-tratamiento" className="form-label">Tratamiento</label>
                                <textarea
                                    id="atencion-tratamiento"
                                    name="tratamiento"
                                    rows="2"
                                    className="form-control"
                                    value={formulario.tratamiento}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {errorFormulario && (
                            <div className="alert alert-danger py-2" role="alert">
                                {errorFormulario}
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-success btn-sm" disabled={guardando}>
                                {editando ? 'Guardar atención' : 'Registrar atención'}
                            </button>
                            {editando && (
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={limpiar}>
                                    Cancelar edición de atención
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </section>
    )
}