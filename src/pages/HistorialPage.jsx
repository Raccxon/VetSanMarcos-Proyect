import { useState } from "react";
import { cargarFichas } from "../utils/fichas";
import { calcularEstadoVacuna } from "../utils/vacunas";
import { obtenerSesion } from "../utils/sesion";
import { filtrarCitasPorEmail } from "../utils/citas";
import {
  fichasVisibles,
  fichasDeRut,
  citasDeRut,
  filtrarPorCategoria,
  categoriaDeCita,
} from "../utils/historial";
import { useCitas } from "../context/CitasContext";
import { ROLES } from "../constants/roles";
import { NOMBRES_CATEGORIAS } from "../constants/categorias";
import { CLASE_BADGE_ESTADO } from "../constants/estadosCitas";

const COLOR_VACUNA = {
  Vigente: "fw-bold text-success",
  Vencida: "fw-bold text-danger",
};

export default function HistorialPage() {
  const { citas } = useCitas();
  const sesion = obtenerSesion();
  // Recepción/admin buscan por RUT; el cliente solo ve lo suyo (por su correo)
  const esStaff = sesion?.rol === ROLES.RECEPCION || sesion?.rol === ROLES.ADMIN;

  const [rutInput, setRutInput] = useState("");
  const [rutBuscado, setRutBuscado] = useState(null);
  const [categoria, setCategoria] = useState("Todas");

  const fichas = esStaff
    ? rutBuscado ? fichasDeRut(cargarFichas(), rutBuscado) : []
    : fichasVisibles(cargarFichas(), sesion);

  const citasPersona = esStaff
    ? rutBuscado ? citasDeRut(citas, rutBuscado) : []
    : filtrarCitasPorEmail(citas, sesion?.email);

  const citasMostradas = [...filtrarPorCategoria(citasPersona, categoria)].sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
  );

  const hayBusqueda = !esStaff || rutBuscado !== null;
  const sinResultados = hayBusqueda && fichas.length === 0 && citasPersona.length === 0;
  const verVacunas = categoria === "Todas" || categoria === "Vacunación";
  const verAtenciones = categoria === "Todas" || categoria === "Consultas y Urgencias";

  const handleBuscar = (e) => {
    e.preventDefault();
    setRutBuscado(rutInput.trim());
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-2">{esStaff ? "Historial y Control" : "Mi Historial"}</h1>
      <p className="text-center text-muted mb-4">
        {esStaff
          ? "Busca por RUT del dueño y filtra por categoría de servicio."
          : "Tus fichas, vacunas y reservas."}
      </p>

      <form onSubmit={handleBuscar} className="row g-2 justify-content-center mb-4">
        {esStaff && (
          <>
            <div className="col-12 col-md-5">
              <input
                type="text"
                id="rut-busqueda"
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

      {sinResultados && (
        <div className="alert alert-danger text-center" role="alert">
          {esStaff
            ? "No se encontraron registros asociados al RUT ingresado."
            : "Aún no tienes registros."}
        </div>
      )}

      {fichas.map((f) => (
        <div key={f.rutDuenio} className="mb-4">
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h2 className="h4 mb-3">Ficha del Paciente: {f.mascota.nombre}</h2>
              <div className="row g-3">
                <div className="col-12 col-md-6"><strong>Dueño:</strong> {f.nombreDuenio}</div>
                <div className="col-12 col-md-6"><strong>RUT:</strong> {f.rutDuenio}</div>
                <div className="col-12 col-md-6"><strong>Especie:</strong> {f.mascota.especie}</div>
                <div className="col-12 col-md-6"><strong>Raza:</strong> {f.mascota.raza}</div>
                <div className="col-12 col-md-6"><strong>Edad:</strong> {f.mascota.edad}</div>
                <div className="col-12 col-md-6"><strong>N° Microchip:</strong> {f.mascota.chip}</div>
              </div>
            </div>
          </div>

          {verVacunas && (
            <>
              <h3 className="h5 border-bottom border-primary border-2 pb-2 mb-3">Carnet de Vacunación</h3>
              <div className="table-responsive mb-4">
                <table className="table table-hover align-middle">
                  <thead className="table-primary">
                    <tr>
                      <th>Vacuna</th>
                      <th>F. Aplicación</th>
                      <th>F. Vencimiento</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.vacunas.map((v) => {
                      const estado = calcularEstadoVacuna(v.fechaVencimiento);
                      return (
                        <tr key={v.id}>
                          <td>{v.vacuna}</td>
                          <td>{v.fechaAplicacion}</td>
                          <td>{v.fechaVencimiento}</td>
                          <td>
                            <span className={COLOR_VACUNA[estado] ?? "fw-bold text-warning"}>{estado}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {verAtenciones && (
            <>
              <h3 className="h5 border-bottom border-primary border-2 pb-2 mb-3">Historial de Consultas Médicas</h3>
              {f.atenciones.map((at) => (
                <div key={at.id} className="card shadow-sm mb-3">
                  <div className="card-body">
                    <p className="fw-bold mb-2">{at.fecha} - {at.motivo}</p>
                    <p className="text-muted mb-2"><strong>Atendido por:</strong> {at.veterinario}</p>
                    <p className="mb-0"><strong>Diagnóstico/Observaciones:</strong> {at.diagnostico}</p>
                  </div>
                </div>
              ))}
            </>
          )}
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
                    <td>{c.nombreMascota}</td>
                    <td>{categoriaDeCita(c) || "—"}</td>
                    <td>{c.servicioNombre}</td>
                    <td>
                      <span className={`badge ${CLASE_BADGE_ESTADO[c.estado] ?? "bg-secondary"}`}>{c.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}