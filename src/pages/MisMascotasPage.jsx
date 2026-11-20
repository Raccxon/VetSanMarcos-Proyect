import { useEffect, useState } from 'react'
import { obtenerSesion } from '../utils/sesion'
import {
    listarMisMascotas,
    crearMascota,
    actualizarMascota,
} from '../services/mascotaService'

const ESPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otro']
const FORM_VACIO = { nombre: '', especie: 'Perro', raza: '', edad: '' }

export default function MisMascotasPage() {
    const [mascotas, setMascotas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [errorGeneral, setErrorGeneral] = useState('')
    const [form, setForm] = useState(FORM_VACIO)
    const [editandoId, setEditandoId] = useState(null)
    const [errores, setErrores] = useState({})
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true

        listarMisMascotas()
            .then((datos) => {
                if (activo) setMascotas(datos)
            })
            .catch((err) => {
                if (activo) setErrorGeneral(err.message)
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => {
            activo = false
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errores[name]) {
            setErrores((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const validar = () => {
        const nuevos = {}
        const edad = Number(form.edad)

        if (!form.nombre.trim()) {
            nuevos.nombre = 'El nombre es obligatorio'
        }

        if (!form.raza.trim()) {
            nuevos.raza = 'La raza es obligatoria'
        }

        if (form.edad === '') {
            nuevos.edad = 'La edad es obligatoria'
        } else if (!Number.isInteger(edad) || edad < 0 || edad > 40) {
            nuevos.edad = 'La edad debe ser un número entero entre 0 y 40'
        }

        setErrores(nuevos)
        return Object.keys(nuevos).length === 0
    }

    const limpiarFormulario = () => {
        setForm(FORM_VACIO)
        setEditandoId(null)
        setErrores({})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validar()) return

        const datos = {
            nombre: form.nombre.trim(),
            especie: form.especie,
            raza: form.raza.trim(),
            edad: Number(form.edad),
            dueno: { id: obtenerSesion()?.id },
        }

        setGuardando(true)
        setErrorGeneral('')

        try {
            if (editandoId !== null) {
                const actualizada = await actualizarMascota(editandoId, datos)
                setMascotas((prev) => prev.map((m) => (m.id === editandoId ? actualizada : m)))
            } else {
                const creada = await crearMascota(datos)
                setMascotas((prev) => [...prev, creada])
            }
            limpiarFormulario()
        } catch (err) {
            setErrorGeneral(err.message)
        } finally {
            setGuardando(false)
        }
    }

    const handleEditar = (mascota) => {
        setEditandoId(mascota.id)
        setForm({
            nombre: mascota.nombre,
            especie: mascota.especie,
            raza: mascota.raza,
            edad: String(mascota.edad),
        })
        setErrores({})
        setErrorGeneral('')
    }

    return (
        <div className="container py-5">
            <h1 className="h2 text-success mb-4">Mis Mascotas</h1>

            {errorGeneral && (
                <div className="alert alert-danger" role="alert">
                    {errorGeneral}
                </div>
            )}

            <div className="row g-4">
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="h5 mb-3">
                                {editandoId !== null ? 'Editar mascota' : 'Agregar mascota'}
                            </h2>

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre</label>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                                        value={form.nombre}
                                        onChange={handleChange}
                                    />
                                    {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="especie" className="form-label">Especie</label>
                                    <select
                                        id="especie"
                                        name="especie"
                                        className="form-select"
                                        value={form.especie}
                                        onChange={handleChange}
                                    >
                                        {ESPECIES.map((e) => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="raza" className="form-label">Raza</label>
                                    <input
                                        id="raza"
                                        name="raza"
                                        type="text"
                                        className={`form-control ${errores.raza ? 'is-invalid' : ''}`}
                                        value={form.raza}
                                        onChange={handleChange}
                                    />
                                    {errores.raza && <div className="invalid-feedback">{errores.raza}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="edad" className="form-label">Edad (años)</label>
                                    <input
                                        id="edad"
                                        name="edad"
                                        type="number"
                                        min="0"
                                        max="40"
                                        className={`form-control ${errores.edad ? 'is-invalid' : ''}`}
                                        value={form.edad}
                                        onChange={handleChange}
                                    />
                                    {errores.edad && <div className="invalid-feedback">{errores.edad}</div>}
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-success" disabled={guardando}>
                                        {guardando
                                            ? 'Guardando...'
                                            : editandoId !== null
                                                ? 'Guardar cambios'
                                                : 'Agregar mascota'}
                                    </button>

                                    {editandoId !== null && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={limpiarFormulario}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-8">
                    {cargando ? (
                        <p>Cargando mascotas...</p>
                    ) : mascotas.length === 0 ? (
                        <div className="alert alert-info" role="alert">
                            Aún no tienes mascotas registradas. Agrega la primera con el formulario.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Especie</th>
                                        <th>Raza</th>
                                        <th>Edad</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mascotas.map((m) => (
                                        <tr key={m.id}>
                                            <td>{m.nombre}</td>
                                            <td>{m.especie}</td>
                                            <td>{m.raza}</td>
                                            <td>{m.edad} {m.edad === 1 ? 'año' : 'años'}</td>
                                            <td className="text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => handleEditar(m)}
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}