import { useEffect, useState } from 'react'
import { listarVacunas, crearVacuna, actualizarVacuna, eliminarVacuna } from '../../services/vacunaService'
import { calcularEstadoVacuna } from '../../utils/vacunas'
import { CLASE_ESTADO_VACUNA } from '../../constants/estadosVacunas'
import { obtenerFechaHoy } from '../../utils/fechas'

const FORM_VACIO = { nombre: '', fechaAplicacion: '', fechaVencimiento: '' }

// De la más reciente a la más antigua, igual que el backend
const ordenar = (lista) =>
    [...lista].sort((a, b) =>
        b.fechaAplicacion.localeCompare(a.fechaAplicacion) || b.id - a.id
    )

// Vacunas de una mascota. Con soloLectura (el dueño mirando la ficha) no se muestra el formulario
export default function VacunasMascota({ mascotaId, soloLectura = false }) {
    const [vacunas, setVacunas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [errorCarga, setErrorCarga] = useState('')
    const [errorAccion, setErrorAccion] = useState('')

    const [formulario, setFormulario] = useState(FORM_VACIO)
    // id de la vacuna que se está editando (null = se está registrando una nueva)
    const [editando, setEditando] = useState(null)
    const [errorFormulario, setErrorFormulario] = useState('')
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true

        listarVacunas(mascotaId)
            .then((lista) => {
                if (activo) setVacunas(ordenar(lista))
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
        if (!formulario.nombre.trim()) return 'El nombre de la vacuna es obligatorio'
        if (!formulario.fechaAplicacion) return 'La fecha de aplicación es obligatoria'
        if (formulario.fechaAplicacion > obtenerFechaHoy()) return 'La fecha de aplicación no puede ser futura'
        if (formulario.fechaVencimiento && formulario.fechaVencimiento < formulario.fechaAplicacion) {
            return 'El vencimiento no puede ser anterior a la fecha de aplicación'
        }
        return ''
    }

    const handleEditar = (vacuna) => {
        setEditando(vacuna.id)
        setErrorFormulario('')
        setErrorAccion('')
        setFormulario({
            nombre: vacuna.nombre,
            fechaAplicacion: vacuna.fechaAplicacion,
            fechaVencimiento: vacuna.fechaVencimiento ?? ''
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
            nombre: formulario.nombre.trim(),
            fechaAplicacion: formulario.fechaAplicacion,
            fechaVencimiento: formulario.fechaVencimiento || null
        }

        setGuardando(true)
        try {
            if (editando) {
                const actualizada = await actualizarVacuna(editando, datos)
                setVacunas((prev) => ordenar(prev.map((v) => (v.id === actualizada.id ? actualizada : v))))
            } else {
                const creada = await crearVacuna(mascotaId, datos)
                setVacunas((prev) => ordenar([...prev, creada]))
            }
            limpiar()
        } catch (err) {
            // Ej.: el backend rechaza las fechas (400) o la sesión no tiene permiso (403)
            setErrorFormulario(err.message)
        } finally {
            setGuardando(false)
        }
    }

    const handleEliminar = async (vacuna) => {
        if (!window.confirm(`¿Eliminar la vacuna "${vacuna.nombre}"?`)) return

        setErrorAccion('')
        try {
            await eliminarVacuna(vacuna.id)
            setVacunas((prev) => prev.filter((v) => v.id !== vacuna.id))
            if (editando === vacuna.id) limpiar()
        } catch (err) {
            setErrorAccion(err.message)
        }
    }

    return (
        <section className="card shadow-sm mb-4">
            <div className="card-body">
                <h3 className="h5 mb-3">Vacunas</h3>

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
                    <p className="text-muted">Cargando vacunas...</p>
                ) : vacunas.length === 0 ? (
                    !errorCarga && <p className="text-muted">Sin vacunas registradas.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm align-middle">
                            <thead>
                                <tr>
                                    <th>Vacuna</th>
                                    <th>Aplicación</th>
                                    <th>Vencimiento</th>
                                    <th>Estado</th>
                                    {!soloLectura && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {vacunas.map((v) => {
                                    const estado = calcularEstadoVacuna(v.fechaVencimiento)
                                    return (
                                        <tr key={v.id}>
                                            <td>{v.nombre}</td>
                                            <td>{v.fechaAplicacion}</td>
                                            <td>{v.fechaVencimiento ?? '—'}</td>
                                            <td className={CLASE_ESTADO_VACUNA[estado]}>{estado}</td>
                                            {!soloLectura && (
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            aria-label={`Editar vacuna ${v.nombre}`}
                                                            onClick={() => handleEditar(v)}
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            aria-label={`Eliminar vacuna ${v.nombre}`}
                                                            onClick={() => handleEliminar(v)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!soloLectura && (
                    <form onSubmit={handleSubmit} noValidate className="border-top pt-3">
                        <h4 className="h6 mb-2">{editando ? 'Editar vacuna' : 'Registrar vacuna'}</h4>

                        <div className="row g-2 mb-2">
                            <div className="col-12 col-md-4">
                                <label htmlFor="vacuna-nombre" className="form-label">Vacuna</label>
                                <input
                                    id="vacuna-nombre"
                                    name="nombre"
                                    className="form-control"
                                    value={formulario.nombre}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-6 col-md-4">
                                <label htmlFor="vacuna-aplicacion" className="form-label">Fecha de aplicación</label>
                                <input
                                    id="vacuna-aplicacion"
                                    name="fechaAplicacion"
                                    type="date"
                                    max={obtenerFechaHoy()}
                                    className="form-control"
                                    value={formulario.fechaAplicacion}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-6 col-md-4">
                                <label htmlFor="vacuna-vencimiento" className="form-label">Fecha de vencimiento (opcional)</label>
                                <input
                                    id="vacuna-vencimiento"
                                    name="fechaVencimiento"
                                    type="date"
                                    className="form-control"
                                    value={formulario.fechaVencimiento}
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
                                {editando ? 'Guardar vacuna' : 'Registrar vacuna'}
                            </button>
                            {editando && (
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={limpiar}>
                                    Cancelar edición de vacuna
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </section>
    )
}