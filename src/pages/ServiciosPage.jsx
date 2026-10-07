import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getServicios } from '../services/apiServices'
import ServicioCard from '../components/ui/ServicioCard'
import { filtrarServicios } from '../utils/filtrarServicios'

export default function ServiciosPage() {
  const [lista, setLista] = useState([])
  const [filtro, setFiltro] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getServicios()
      .then((data) => setLista(data))
      .catch(() => setError('No fue posible cargar los servicios.'))
      .finally(() => setCargando(false))
  }, [])

  const serviciosFiltrados = filtrarServicios(lista, filtro, categoria)

  const categorias = [...new Set(lista.map((servicio) => servicio.categoria))]

  return (
    <div className="container py-4">

      <div className="text-center mb-4">
        <h1 className="fw-bold text-success">
          Catálogo de Servicios Médicos
        </h1>

        <p className="text-muted">
          Conoce nuestras atenciones veterinarias disponibles y sus tarifas.
        </p>
      </div>

      <div className="custom-card p-3 mb-4">
        <div className="row g-3">

          <div className="col-12 col-md-8">
            <label
              htmlFor="buscar-servicio"
              className="form-label fw-semibold"
            >
              Buscar servicio
            </label>

            <input
              id="buscar-servicio"
              type="search"
              className="form-control"
              placeholder="Buscar por nombre o especie..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-4">
            <label
              htmlFor="categoria-servicio"
              className="form-label fw-semibold"
            >
              Categoría
            </label>

            <select
              id="categoria-servicio"
              className="form-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Todas">
                Todas las categorías
              </option>

              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {cargando && (
        <div className="alert alert-info text-center" role="status">
          Cargando servicios...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!cargando && !error && serviciosFiltrados.length === 0 && (
        <div className="alert alert-warning text-center" role="alert">
          No se encontraron servicios para la búsqueda seleccionada.
        </div>
      )}

      <div className="row g-4">

        {serviciosFiltrados.map((servicio) => (
          <div
            key={servicio.id}
            className="col-12 col-md-6 col-lg-4"
          >
            <ServicioCard servicio={servicio} />
          </div>
        ))}

      </div>

      <div className="text-center mt-4">
        <Link
          to="/agendar"
          className="btn btn-success fw-bold"
        >
          Agendar una cita
        </Link>
      </div>

    </div>
  )
}