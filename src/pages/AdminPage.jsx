import { useState } from 'react';
import { useCitas } from '../context/CitasContext.jsx';
import { obtenerFechaHoy } from '../utils/fechas';

export default function AdminPage({ vista, onCambiarVista }) {
  // Si el Navbar controla la vista se usa la prop; si no, el estado local
  const [vistaLocal, setVistaLocal] = useState('dashboard');
  const pestaniaActiva = vista ?? vistaLocal;
  const setPestaniaActiva = onCambiarVista ?? setVistaLocal;
  const { citas, actualizarEstadoCita } = useCitas();

  // Filtros de búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('todas');
  const [fechaEspecifica, setFechaEspecifica] = useState('');

  // Servicios parametrizables en estado local
  const [serviciosStock, setServiciosStock] = useState([
    { id: 1, nombre: 'Consulta General', categoria: 'Consultas y Urgencias', stock: 15, duracion: 30, precio: 20000 },
    { id: 2, nombre: 'Vacunación Séxtuple', categoria: 'Vacunación', stock: 25, duracion: 15, precio: 18000 },
    { id: 3, nombre: 'Cirugía Menor', categoria: 'Procedimientos', stock: 5, duracion: 60, precio: 75000 },
    { id: 4, nombre: 'Examen de Sangre', categoria: 'Procedimientos', stock: 10, duracion: 45, precio: 25000 }
  ]);

  // Formulario para nuevo servicio
  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: '',
    categoria: 'Atención Médica',
    duracion: 30,
    stock: 10,
    precio: 20000
  });

  const [categorias] = useState([
    'Consultas y Urgencias',
    'Procedimientos',
    'Vacunación',
    'Peluquería y Estética'
  ]);

  // Obtener lista dinámica de clientes a partir de las citas agendadas
  const clientesDinamicos = Array.from(
    new Map(
      citas.map((c) => [
        c.rutDuenio,
        {
          rut: c.rutDuenio,
          nombre: c.nombreDuenio,
          telefono: c.telefono,
          mascota: c.nombreMascota,
          especie: c.especie
        }
      ])
    ).values()
  );

  const handleStockChange = (id, nuevoStock) => {
    setServiciosStock((prev) =>
      prev.map((s) => (s.id === id ? { ...s, stock: Math.max(0, Number(nuevoStock)) } : s))
    );
  };

  const handleEliminarServicio = (id, nombre) => {
    if (window.confirm(`¿Está seguro que desea eliminar el servicio "${nombre}"?`)) {
      setServiciosStock((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleCrearServicio = (e) => {
    e.preventDefault();
    if (!nuevoServicio.nombre.trim()) return;

    setServiciosStock((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...nuevoServicio,
        duracion: Number(nuevoServicio.duracion),
        stock: Number(nuevoServicio.stock),
        precio: Number(nuevoServicio.precio)
      }
    ]);

    setNuevoServicio({
      nombre: '',
      categoria: 'Atención Médica',
      duracion: 30,
      stock: 10,
      precio: 20000
    });
  };

  // Filtrado flexible de citas
  const citasFiltradas = citas.filter((c) => {
    const texto = busqueda.toLowerCase();
    const coincideTexto =
      c.nombreDuenio.toLowerCase().includes(texto) ||
      c.rutDuenio.toLowerCase().includes(texto) ||
      c.nombreMascota.toLowerCase().includes(texto);

    const hoy = obtenerFechaHoy();
    const fechaCita = c.fecha;

    let coincideFecha = true;

    if (filtroFecha === 'hoy') {
      coincideFecha = fechaCita === hoy;
    } else if (filtroFecha === 'ayer') {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      coincideFecha = fechaCita === ayer.toISOString().split('T')[0];
    } else if (filtroFecha === '30dias') {
      const hace30 = new Date();
      hace30.setDate(hace30.getDate() - 30);
      coincideFecha = fechaCita >= hace30.toISOString().split('T')[0];
    } else if (filtroFecha === 'especifica' && fechaEspecifica) {
      coincideFecha = fechaCita === fechaEspecifica;
    }

    return coincideTexto && coincideFecha;
  });

  const obtenerBadgeFecha = (fechaStr) => {
    const hoy = obtenerFechaHoy();
    if (fechaStr < hoy) return <span className="badge bg-secondary">Historial</span>;
    if (fechaStr === hoy) return <span className="badge bg-success">Hoy</span>;
    return <span className="badge bg-primary">Programada</span>;
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Panel de Control Administrativo</h2>
        <span className="badge bg-primary fs-6">Modo Administrador</span>
      </div>

      <ul className={`nav nav-tabs mb-4 ${vista ? 'd-none' : ''}`}>
        <li className="nav-item">
          <button className={`nav-link ${pestaniaActiva === 'dashboard' ? 'active fw-bold' : ''}`} onClick={() => setPestaniaActiva('dashboard')}>
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${pestaniaActiva === 'stock' ? 'active fw-bold' : ''}`} onClick={() => setPestaniaActiva('stock')}>
            Stock y Servicios
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${pestaniaActiva === 'citas' ? 'active fw-bold' : ''}`} onClick={() => setPestaniaActiva('citas')}>
            Citas y Agenda ({citasFiltradas.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${pestaniaActiva === 'clientes' ? 'active fw-bold' : ''}`} onClick={() => setPestaniaActiva('clientes')}>
            Clientes y Mascotas
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${pestaniaActiva === 'estadisticas' ? 'active fw-bold' : ''}`} onClick={() => setPestaniaActiva('estadisticas')}>
            Estadísticas
          </button>
        </li>
      </ul>

      {pestaniaActiva === 'dashboard' && (
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card text-white bg-primary p-3">
              <h4 className="text-white">Citas Totales</h4>
              <p className="display-6 m-0">{citas.length}</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card text-white bg-success p-3">
              <h4 className="text-white">Servicios Activos</h4>
              <p className="display-6 m-0">{serviciosStock.length}</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card text-dark bg-warning p-3">
              <h4 className="text-dark">Clientes Registrados</h4>
              <p className="display-6 m-0">{clientesDinamicos.length}</p>
            </div>
          </div>
        </div>
      )}

      {pestaniaActiva === 'stock' && (
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="card p-3">
              <h4>Catálogo de Servicios y Stock</h4>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Servicio</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Duración</th>
                      <th>Cupos</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviciosStock.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.nombre}</strong></td>
                        <td>{s.categoria}</td>
                        <td>${s.precio.toLocaleString('es-CL')}</td>
                        <td><span className="badge bg-secondary">{s.duracion} min</span></td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ width: '80px' }}
                            value={s.stock}
                            onChange={(e) => handleStockChange(s.id, e.target.value)}
                          />
                        </td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => handleEliminarServicio(s.id, s.nombre)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card p-3">
              <h4>Agregar Nuevo Servicio</h4>
              <form onSubmit={handleCrearServicio}>
                <div className="mb-2">
                  <label className="form-label fw-bold">Nombre del Servicio</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nuevoServicio.nombre}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold">Categoría</label>
                  <select
                    className="form-select"
                    value={nuevoServicio.categoria}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, categoria: e.target.value })}
                  >
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold">Precio ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nuevoServicio.precio}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-bold">Duración (Minutos)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nuevoServicio.duracion}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, duracion: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Stock Inicial</label>
                  <input
                    type="number"
                    className="form-control"
                    value={nuevoServicio.stock}
                    onChange={(e) => setNuevoServicio({ ...nuevoServicio, stock: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">Guardar Servicio</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {pestaniaActiva === 'citas' && (
        <div className="card p-3">
          <h4>Agenda General de Citas</h4>

          {/* FILTROS DE BÚSQUEDA Y FECHA */}
          <div className="row g-2 mb-3 bg-light p-3 rounded">
            <div className="col-12 col-md-4">
              <label className="form-label fw-bold">Buscar Mascota, Dueño o RUT</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej. Firulais / 12345678-9"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-bold">Filtro de Fecha</label>
              <select
                className="form-select"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              >
                <option value="todas">Todas las fechas</option>
                <option value="hoy">Para Hoy</option>
                <option value="ayer">Ayer</option>
                <option value="30dias">Últimos 30 días</option>
                <option value="especifica">Fecha Específica...</option>
              </select>
            </div>
            {filtroFecha === 'especifica' && (
              <div className="col-12 col-md-4">
                <label className="form-label fw-bold">Seleccione la Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaEspecifica}
                  onChange={(e) => setFechaEspecifica(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dueño / RUT</th>
                  <th>Teléfono</th>
                  <th>Mascota</th>
                  <th>Servicio</th>
                  <th>Fecha/Hora</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No se encontraron citas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  citasFiltradas.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.id}</strong></td>
                      <td>{c.nombreDuenio} <br /><small className="text-muted">{c.rutDuenio}</small></td>
                      <td><small>{c.telefono}</small></td>
                      <td>{c.nombreMascota} ({c.especie})</td>
                      <td>{c.servicioNombre} ({c.duracion || 30} min)</td>
                      <td>{c.fecha} - {c.hora} hrs</td>
                      <td>{obtenerBadgeFecha(c.fecha)}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={c.estado}
                          onChange={(e) => actualizarEstadoCita(c.id, e.target.value)}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmada">Confirmada</option>
                          <option value="Atendida">Atendida</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pestaniaActiva === 'clientes' && (
        <div className="card p-3">
          <h4>Directorio Dinámico de Clientes y Mascotas</h4>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>RUT</th>
                  <th>Dueño</th>
                  <th>Teléfono</th>
                  <th>Mascota Registrada</th>
                  <th>Especie</th>
                </tr>
              </thead>
              <tbody>
                {clientesDinamicos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">Aún no hay clientes registrados mediante agendamientos.</td>
                  </tr>
                ) : (
                  clientesDinamicos.map((cli) => (
                    <tr key={cli.rut}>
                      <td><strong>{cli.rut}</strong></td>
                      <td>{cli.nombre}</td>
                      <td>{cli.telefono}</td>
                      <td>{cli.mascota}</td>
                      <td>{cli.especie}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pestaniaActiva === 'estadisticas' && (
        <div className="card p-3 text-center">
          <h4>Reportes Operativos</h4>
          <div className="row g-3 mt-2">
            <div className="col-12 col-md-4">
              <div className="border p-3 rounded">
                <h5>Citas Agendadas</h5>
                <p className="fs-4 text-primary">{citas.length}</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border p-3 rounded">
                <h5>Atenciones Confirmadas</h5>
                <p className="fs-4 text-success">{citas.filter((c) => c.estado === 'Confirmada').length}</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="border p-3 rounded">
                <h5>Cancelaciones</h5>
                <p className="fs-4 text-danger">{citas.filter((c) => c.estado === 'Cancelada').length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}