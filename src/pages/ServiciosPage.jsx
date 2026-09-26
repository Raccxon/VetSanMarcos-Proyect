import { useState } from "react";
import { servicios } from "../data/servicios";
import ServicioCard from "../components/ui/ServicioCard";

function ServiciosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const serviciosFiltrados = servicios.filter((item) => {
    const coincideTexto =
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.especie.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = categoria === "Todas" || item.categoria === categoria;
    return coincideTexto && coincideCat;
  });

  return (
    <div className="servicios-page">
      <h1>Catálogo de Servicios Médicos</h1>

      {/* Filtros de búsqueda */}
      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="select-categoria"
        >
          <option value="Todas">Todas las categorías</option>
          <option value="Consultas">Consultas</option>
          <option value="Vacunación">Vacunación</option>
          <option value="Cirugía">Cirugía</option>
          <option value="Desparasitación">Desparasitación</option>
          <option value="Exámenes">Exámenes</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      {/* Grilla de servicios */}
      <div className="servicios-grid">
        {serviciosFiltrados.length > 0 ? (
          serviciosFiltrados.map((servicio) => (
            <ServicioCard key={servicio.id || servicio.nombre} servicio={servicio} />
          ))
        ) : (
          <p>No se encontraron servicios.</p>
        )}
      </div>
    </div>
  );
}

export default ServiciosPage;