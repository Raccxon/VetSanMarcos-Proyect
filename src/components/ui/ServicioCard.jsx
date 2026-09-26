function ServicioCard({ servicio }) {
  return (
    <div>
      <span>{servicio.categoria}</span>
      <h3>{servicio.nombre}</h3>
      <p>
        <strong>Especie:</strong> {servicio.especie}
      </p>
      <p>
        <strong>Duración:</strong> {servicio.duracion}
      </p>
      <p>${servicio.precio.toLocaleString("es-CL")}</p>
      {servicio.observaciones && (
        <p>
          <small>{servicio.observaciones}</small>
        </p>
      )}
    </div>
  );
}

export default ServicioCard;