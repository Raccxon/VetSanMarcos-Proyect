import { useState } from "react";
import { historialMascotas } from "../data/citas";

export default function HistorialPage() {
  const [rutBusqueda, setRutBusqueda] = useState("");
  const [mascotaEncontrada, setMascotaEncontrada] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  const handleBuscar = (e) => {
    e.preventDefault();
    setErrorBusqueda("");

    const resultado = historialMascotas.find(
      (item) =>
        item.rutDuenio.toLowerCase().trim() ===
        rutBusqueda.toLowerCase().trim()
    );

    if (resultado) {
      setMascotaEncontrada(resultado);
    } else {
      setMascotaEncontrada(null);
      setErrorBusqueda(
        "No se encontraron registros asociados al RUT ingresado. Prueba con: 12345678-9"
      );
    }
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-2">
        Historial Médico y Carnet de Vacunas
      </h1>

      <p className="text-center text-muted mb-4">
        Consulta el registro clínico y las fechas de vacunación de tus mascotas.
      </p>

      <form
        onSubmit={handleBuscar}
        className="row g-2 justify-content-center mb-4"
      >
        <div className="col-12 col-md-6">
          <input
            type="text"
            id="rut-busqueda"
            className="form-control"
            placeholder="Ingrese RUT del dueño (ej. 12345678-9)"
            value={rutBusqueda}
            onChange={(e) => setRutBusqueda(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-2">
          <button type="submit" className="btn btn-primary w-100">
            Buscar Ficha
          </button>
        </div>
      </form>

      {errorBusqueda && (
        <div className="alert alert-danger text-center" role="alert">
          {errorBusqueda}
        </div>
      )}

      {mascotaEncontrada && (
        <div>
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="h4 mb-4">
                Ficha del Paciente: {mascotaEncontrada.mascota.nombre}
              </h2>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <strong>Dueño:</strong>{" "}
                  {mascotaEncontrada.nombreDuenio}
                </div>

                <div className="col-12 col-md-6">
                  <strong>Especie:</strong>{" "}
                  {mascotaEncontrada.mascota.especie}
                </div>

                <div className="col-12 col-md-6">
                  <strong>Raza:</strong>{" "}
                  {mascotaEncontrada.mascota.raza}
                </div>

                <div className="col-12 col-md-6">
                  <strong>Edad:</strong>{" "}
                  {mascotaEncontrada.mascota.edad}
                </div>

                <div className="col-12 col-md-6">
                  <strong>N° Microchip:</strong>{" "}
                  {mascotaEncontrada.mascota.chip}
                </div>
              </div>
            </div>
          </div>

          <h3 className="h5 border-bottom border-primary border-2 pb-2 mb-3">
            Carnet de Vacunación
          </h3>

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
                {mascotaEncontrada.vacunas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.vacuna}</td>
                    <td>{v.fechaAplicacion}</td>
                    <td>{v.fechaVencimiento}</td>
                    <td>
                      <span
                        className={
                          v.estado === "Vigente"
                            ? "fw-bold text-success"
                            : "fw-bold text-warning"
                        }
                      >
                        {v.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="h5 border-bottom border-primary border-2 pb-2 mb-3">
            Historial de Consultas Médicas
          </h3>

          {mascotaEncontrada.atenciones.map((at) => (
            <div key={at.id} className="card shadow-sm mb-3">
              <div className="card-body">
                <p className="fw-bold mb-2">
                  {at.fecha} - {at.motivo}
                </p>

                <p className="text-muted mb-2">
                  <strong>Atendido por:</strong> {at.veterinario}
                </p>

                <p className="mb-0">
                  <strong>Diagnóstico/Observaciones:</strong>{" "}
                  {at.diagnostico}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}