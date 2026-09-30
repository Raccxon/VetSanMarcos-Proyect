import { useState, useEffect } from 'react'
import { getServicios } from '../services/apiServices'

export default function ServiciosPage() {
  const [lista, setLista] = useState([])
  const [filtro, setFiltro] = useState('')
  const [categoria, setCategoria] = useState('Todas')

  useEffect(() => {
    getServicios().then(data => setLista(data))
  }, [])

  const filtrados = lista.filter(s => {
    const coincideNombre = s.nombre.toLowerCase().includes(filtro.toLowerCase())
    const coincideCat = categoria === 'Todas' || s.categoria === categoria
    return coincideNombre && coincideCat
  })

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h1 className="fw-bold text-success">Catálogo de Servicios Médicos</h1>
        <p className="text-muted">Conoce nuestras atenciones veterinarias disponibles y sus tarifas.</p>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="custom-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar servicio por nombre..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="Todas">Todas las categorías</option>
              <option value="Consultas">Consultas</option>
              <option value="Vacunación">Vacunación</option>
              <option value="Cirugías">Cirugías</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Servicios */}
      <div className="row g-4">
        {filtrados.map((s) => (
          <div key={s.id} className="col-md-6 col-lg-4">
            <div className="custom-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <span className="badge bg-success-subtle text-success border border-success mb-2">{s.categoria}</span>
                <h4 className="fw-bold text-dark">{s.nombre}</h4>
                <p className="text-muted small mb-2">Especie: {s.especie} | Duración: {s.duracion}</p>
                <p className="text-secondary">{s.descripcion}</p>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <span className="card-service-price">${s.precio.toLocaleString()}</span>
                <a href="/agendar" className="btn btn-outline-success btn-sm fw-bold">Agendar</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}