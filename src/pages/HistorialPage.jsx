import { useEffect, useState } from 'react'
import { listarMascotas, listarMisMascotas } from '../services/mascotaService'
import { listarCitas, listarMisCitas } from '../services/citasService'
import { obtenerSesion } from '../utils/sesion'
import { ROLES } from '../constants/roles'
import { NOMBRES_CATEGORIAS } from '../constants/categorias'
import { CLASE_BADGE_ESTADO } from '../constants/estadosCitas'
import VacunasMascota from '../components/fichas/VacunasMascota'
import AtencionesMascota from '../components/fichas/AtencionesMascota'

// Para comparar RUT sin importar puntos, espacios ni mayúsculas
const limpiarRut = (rut = '') => rut.replace(/\./g, '').trim().toLowerCase()

export default function HistorialPage() {
    const sesion = obtenerSesion()
    // Recepción/admin buscan por RUT; el cliente solo ve lo suyo (el backend ya se lo limita)
    const esStaff = sesion?.rol === ROLES.RECEPCION || sesion?.rol === ROLES.ADMIN

    const [mascotas, setMascotas] = useState([])
    const [citas, setCitas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [errorCarga, setErrorCarga] = useState('')

    const [rutInput, setRutInput] = useState('')
    const [rutBuscado, setRutBuscado] = useState(null)
    const [errorBusqueda, setErrorBusqueda] = useState('')
    const [categoria, setCategoria] = useState('Todas')

    // Al abrir la pantalla se piden al backend las mascotas y citas que la sesión puede ver
    useEffect(() => {
        let activo = true

        Promise.all([
            esStaff ? listarMascotas() : listarMisMascotas(),
            esStaff ? listarCitas() : listarMisCitas()
        ])
            .then(([listaMascotas, listaCitas]) => {
                if (!activo) return
                setMascotas(listaMascotas)
                setCitas(listaCitas)
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
    }, [esStaff])

    const hayBusqueda = !esStaff || rutBuscado !== null

    const delRut = (mascota) => limpiarRut(mascota.dueno?.rut ?? '') === limpiarRut(rutBuscado ?? '')
    const mascotasPersona = !hayBusqueda
        ? []
        : esStaff ? mascotas.filter((m) => delRut(m)) : mascotas
    const citasPersona = !hayBusqueda
        ? []
        : esStaff ? citas.filter((c) => delRut(c.mascota)) : citas

    const citasMostradas = citasPersona
        .filter((c) => categoria === 'Todas' || c.servicio?.categoria === categoria)
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora))

    const sinResultados = hayBusqueda && !cargando && !errorCarga &&
        mascotasPersona.length === 0 && citasPersona.length === 0
    const verVacunas = categoria === 'Todas' || categoria === 'Vacunación'
    const verAtenciones = categoria === 'Todas' || categoria === 'Consultas y Urgencias'

    const handleBuscar = (e) => {
        e.preventDefault()
        if (!rutInput.trim()) {
            setErrorBusqueda('Ingresa el RUT del dueño')
            return
        }
        setErrorBusqueda('')
        setRutBuscado(rutInput.trim())
    }

    return (
        <div className="container py-4">
            <h1 className="text-center mb-2">{esStaff ? 'Historial y Control' : 'Mi Historial'}</h1>
            <p className="text-center text-muted mb-4">
                {esStaff
                    ? 'Busca por RUT del dueño y filtra por categoría de servicio.'
                    : 'Tus mascotas, vacunas, atenciones y reservas.'}
            </p>

            <form onSubmit={handleBuscar} className="row g-2 justify-content-center mb-4">
                {esStaff && (
                    <>
                        <div className="col-12 col-md-5">
                            <input
                                type="text"
                                id="rut-busqueda"
                                aria-label="RUT del dueño"
                                className="form-control"
                                placeholder="RUT del dueño (ej. 12345678-9)"
                                value={rutInput}
                                onChange={(e) => setRutInput(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-md-2">
                            <button type="submit" className="btn btn-primary w-100">Buscar</button>
                        </div>
                    </>
                )}
                <div className="col-12 col-md-3">
                    <select
                        id="filtro-categoria"
                        aria-label="Categoría"
                        className="form-select"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                    >
                        <option value="Todas">Todas las categorías</option>
                        {NOMBRES_CATEGORIAS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </form>

            {errorBusqueda && (
                <div className="alert alert-warning text-center" role="alert">
                    {errorBusqueda}
                </div>
            )}

            {errorCarga && (
                <div className="alert alert-danger text-center" role="alert">
                    {errorCarga}
                </div>
            )}

            {cargando && <p className="text-center text-muted">Cargando historial...</p>}

            {sinResultados && (
                <div className="alert alert-danger text-center" role="alert">
                    {esStaff
                        ? 'No se encontraron registros asociados al RUT ingresado.'
                        : 'Aún no tienes registros.'}
                </div>
            )}

            {mascotasPersona.map((m) => (
                <div key={m.id} className="mb-4">
                    <div className="card shadow-sm mb-3">
                        <div className="card-body">
                            <h2 className="h4 mb-3">Ficha del Paciente: {m.nombre}</h2>
                            <div className="row g-3">
                                <div className="col-12 col-md-6"><strong>Dueño:</strong> {m.dueno?.nombre}</div>
                                <div className="col-12 col-md-6"><strong>RUT:</strong> {m.dueno?.rut ?? 'Sin RUT'}</div>
                                <div className="col-12 col-md-6"><strong>Especie:</strong> {m.especie}</div>
                                <div className="col-12 col-md-6"><strong>Raza:</strong> {m.raza}</div>
                                <div className="col-12 col-md-6"><strong>Edad:</strong> {m.edad}</div>
                                <div className="col-12 col-md-6"><strong>N° Microchip:</strong> {m.chip ?? '—'}</div>
                            </div>
                        </div>
                    </div>

                    {verVacunas && <VacunasMascota mascotaId={m.id} soloLectura />}
                    {verAtenciones && <AtencionesMascota mascotaId={m.id} soloLectura />}
                </div>
            ))}

            {citasPersona.length > 0 && (
                <>
                    <h3 className="h5 border-bottom border-primary border-2 pb-2 mb-3">
                        Reservas ({citasMostradas.length})
                    </h3>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-primary">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Mascota</th>
                                    <th>Categoría</th>
                                    <th>Servicio</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {citasMostradas.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.fecha} · {c.hora}</td>
                                        <td>{c.mascota.nombre}</td>
                                        <td>{c.servicio.categoria || '—'}</td>
                                        <td>{c.servicio.nombre}</td>
                                        <td>
                                            <span className={`badge ${CLASE_BADGE_ESTADO[c.estado] ?? 'bg-secondary'}`}>{c.estado}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}