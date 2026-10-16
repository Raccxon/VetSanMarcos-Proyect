import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getServicios } from '../services/apiServices'
import ServicioCard from '../components/ui/ServicioCard'
import { filtrarServicios } from '../utils/filtrarServicios'
import { NOMBRES_CATEGORIAS } from '../constants/categorias'

export default function ServiciosPage() {
  const [lista, setLista] = useState([])
  const [filtro, setFiltro] = useState('')
  const [params, setParams] = useSearchParams()
  // La categoría viene de la URL (?categoria=Vacunación) para llegar desde el Inicio
  const categoria = NOMBRES_CATEGORIAS.includes(params.get('categoria')) ? params.get('categoria') : 'Todas'
  const setCategoria = (c) => setParams(c === 'Todas' ? {} : { categoria: c })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getServicios()
      .then((data) => setLista(data))
      .catch(() => setError('No fue posible cargar los servicios.'))
      .finally(() => setCargando(false))
  }, [])

  const serviciosFiltrados = filtrarServicios(lista, filtro, categoria)

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h1 className="fw-bold text-success">Catálogo de Servicios Médicos</h1>
        <p className="text-muted">Conoce nuestras atenciones veterinarias disponibles y sus tarifas.</p>
      </div>

      <div className="custom-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-2" role="radiogroup" aria-label="Categoría">
              {['Todas', ...NOMBRES_CATEGORIAS].map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={categoria === item}
                  className={`btn btn-sm ${categoria === item ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setCategoria(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12">
            <label htmlFor="buscar-servicio" className="form-label fw-semibold">Buscar servicio</label>
            <input
              id="buscar-servicio"
              type="search"
              className="form-control"
              placeholder="Buscar por nombre o especie..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>
      </div>

      {cargando && <div className="alert alert-info text-center" role="status">Cargando servicios...</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!cargando && !error && serviciosFiltrados.length === 0 && (
        <div className="alert alert-warning text-center" role="alert">
          No se encontraron servicios para la búsqueda seleccionada.
        </div>
      )}

      <div className="row g-4">
        {serviciosFiltrados.map((servicio) => (
          <div key={servicio.id} className="col-12 col-md-6 col-lg-4">
            <ServicioCard servicio={servicio} />
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <Link to="/agendar" className="btn btn-success fw-bold">Agendar una cita</Link>
      </div>
    </div>
  )
}