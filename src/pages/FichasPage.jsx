import { useState } from 'react'
import { cargarFichas, guardarFichas, registrarFicha, editarFicha } from '../utils/fichas'

const FORMULARIO_VACIO = {
    rutDuenio: '',
    nombreDuenio: '',
    emailDuenio: '',
    nombreMascota: '',
    especie: 'Perro',
    raza: '',
    edad: '',
    chip: '',
}

const ESPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otra']

export default function FichasPage() {
    const [fichas, setFichas] = useState(cargarFichas)
    const [formData, setFormData] = useState(FORMULARIO_VACIO)
    // RUT de la ficha que se está editando (null = se está registrando una nueva)
    const [editando, setEditando] = useState(null)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const limpiar = () => {
        setFormData(FORMULARIO_VACIO)
        setEditando(null)
        setError('')
    }

    const handleEditar = (ficha) => {
        setEditando(ficha.rutDuenio)
        setMensaje('')
        setError('')
        setFormData({
            rutDuenio: ficha.rutDuenio,
            nombreDuenio: ficha.nombreDuenio,
            emailDuenio: ficha.emailDuenio ?? '',
            nombreMascota: ficha.mascota.nombre,
            especie: ficha.mascota.especie,
            raza: ficha.mascota.raza ?? '',
            edad: ficha.mascota.edad ?? '',
            chip: ficha.mascota.chip ?? '',
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setMensaje('')

        const resultado = editando
            ? editarFicha(fichas, editando, formData)
            : registrarFicha(fichas, formData)

        if (resultado.error) {
            setError(resultado.error)
            return
        }

        guardarFichas(resultado.fichas)
        setFichas(resultado.fichas)
        setMensaje(editando ? 'Ficha actualizada correctamente.' : 'Ficha registrada correctamente.')
        limpiar()
    }

    return (
        <div className="container py-4">
            <h1 className="h3 fw-bold text-success mb-4">Gestión de Fichas</h1>

            <div className="row g-4">
                <div className="col-12 col-lg-5">
                    <form onSubmit={handleSubmit} noValidate className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="h5 mb-3">
                                {editando ? 'Editar ficha' : 'Registrar ficha nueva'}
                            </h2>

                            <div className="mb-2">
                                <label htmlFor="rutDuenio" className="form-label">RUT del dueño</label>
                                <input
                                    id="rutDuenio"
                                    name="rutDuenio"
                                    className="form-control"
                                    placeholder="12345678-9"
                                    value={formData.rutDuenio}
                                    onChange={handleChange}
                                    disabled={editando !== null}
                                />
                            </div>

                            <div className="mb-2">
                                <label htmlFor="nombreDuenio" className="form-label">Nombre del dueño</label>
                                <input
                                    id="nombreDuenio"
                                    name="nombreDuenio"
                                    className="form-control"
                                    value={formData.nombreDuenio}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-2">
                                <label htmlFor="emailDuenio" className="form-label">Correo del dueño</label>
                                <input
                                    id="emailDuenio"
                                    name="emailDuenio"
                                    type="email"
                                    autoComplete="email"
                                    className="form-control"
                                    value={formData.emailDuenio}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-2">
                                <label htmlFor="nombreMascota" className="form-label">Nombre de la mascota</label>
                                <input
                                    id="nombreMascota"
                                    name="nombreMascota"
                                    className="form-control"
                                    value={formData.nombreMascota}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="row g-2 mb-2">
                                <div className="col-6">
                                    <label htmlFor="especie" className="form-label">Especie</label>
                                    <select
                                        id="especie"
                                        name="especie"
                                        className="form-select"
                                        value={formData.especie}
                                        onChange={handleChange}
                                    >
                                        {ESPECIES.map((e) => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label htmlFor="raza" className="form-label">Raza</label>
                                    <input
                                        id="raza"
                                        name="raza"
                                        className="form-control"
                                        value={formData.raza}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="row g-2 mb-3">
                                <div className="col-6">
                                    <label htmlFor="edad" className="form-label">Edad</label>
                                    <input
                                        id="edad"
                                        name="edad"
                                        className="form-control"
                                        placeholder="3 años"
                                        value={formData.edad}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-6">
                                    <label htmlFor="chip" className="form-label">N° de microchip</label>
                                    <input
                                        id="chip"
                                        name="chip"
                                        className="form-control"
                                        value={formData.chip}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2" role="alert">
                                    {error}
                                </div>
                            )}

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success">
                                    {editando ? 'Guardar cambios' : 'Registrar ficha'}
                                </button>
                                {editando && (
                                    <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>
                                        Cancelar edición
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="col-12 col-lg-7">
                    {mensaje && (
                        <div className="alert alert-success py-2" role="status">
                            {mensaje}
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-success">
                                <tr>
                                    <th>RUT</th>
                                    <th>Dueño</th>
                                    <th>Mascota</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fichas.map((f) => (
                                    <tr key={f.rutDuenio}>
                                        <td>{f.rutDuenio}</td>
                                        <td>{f.nombreDuenio}</td>
                                        <td>
                                            {f.mascota.nombre} ({f.mascota.especie})
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                aria-label={`Editar ficha de ${f.mascota.nombre}`}
                                                onClick={() => handleEditar(f)}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}