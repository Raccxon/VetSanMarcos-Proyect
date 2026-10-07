import { Link } from 'react-router-dom'

function ServicioCard({ servicio }) {
  return (
    <article className="custom-card p-4 h-100 d-flex flex-column justify-content-between">

      <div>

        <span className="badge bg-success-subtle text-success border border-success mb-2">
          {servicio.categoria}
        </span>

        <h2 className="h4 fw-bold text-dark">
          {servicio.nombre}
        </h2>

        <p className="text-muted small mb-2">
          <strong>Especie:</strong> {servicio.especie}
          <br />
          <strong>Duración:</strong> {servicio.duracion}
        </p>

        {servicio.observaciones && (
          <p className="text-secondary mb-0">
            {servicio.observaciones}
          </p>
        )}

      </div>

      <div className="d-flex justify-content-between align-items-center gap-3 mt-3 pt-3 border-top">

        <span className="card-service-price">
          ${servicio.precio.toLocaleString('es-CL')}
        </span>

        <Link
          to="/agendar"
          className="btn btn-outline-success btn-sm fw-bold"
        >
          Agendar
        </Link>

      </div>

    </article>
  )
}

export default ServicioCard