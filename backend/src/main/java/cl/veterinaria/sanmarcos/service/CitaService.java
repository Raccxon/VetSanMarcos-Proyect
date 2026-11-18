package cl.veterinaria.sanmarcos.service;

import cl.veterinaria.sanmarcos.dto.Ocupacion;
import cl.veterinaria.sanmarcos.model.Cita;
import cl.veterinaria.sanmarcos.model.Mascota;
import cl.veterinaria.sanmarcos.model.Servicio;
import cl.veterinaria.sanmarcos.repository.CitaRepository;
import cl.veterinaria.sanmarcos.repository.MascotaRepository;
import cl.veterinaria.sanmarcos.repository.ServicioRepository;
import cl.veterinaria.sanmarcos.security.Permisos;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository repository;
    private final MascotaRepository mascotaRepository;
    private final ServicioRepository servicioRepository;

    public CitaService(CitaRepository repository,
            MascotaRepository mascotaRepository,
            ServicioRepository servicioRepository) {
        this.repository = repository;
        this.mascotaRepository = mascotaRepository;
        this.servicioRepository = servicioRepository;
    }

    public List<Cita> listar() {
        return repository.findAll();
    }

    public List<Cita> listarPorDueno(Long duenoId) {
        return repository.findByMascotaDuenoId(duenoId);
    }

    public List<Cita> listarPorEmailDueno(String email) {
        return repository.findByMascotaDuenoEmail(email);
    }

    // Busca una cita sin revisar permisos: solo para uso interno de esta clase
    private Cita buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cita no encontrada"));
    }

    // Un cliente solo puede ver las citas de sus mascotas; el personal puede ver cualquiera
    public Cita buscar(Long id, Authentication autenticacion) {
        Cita cita = buscar(id);
        verificarAcceso(cita.getMascota(), autenticacion);
        return cita;
    }

    public Cita crear(Cita cita, Authentication autenticacion) {
        cita.setId(null);
        cita.setMascota(buscarMascota(cita.getMascota()));
        // Un cliente solo puede agendar para sus propias mascotas
        verificarAcceso(cita.getMascota(), autenticacion);
        cita.setServicio(buscarServicio(cita.getServicio()));

        // Toda cita nueva parte como Pendiente. Solo el personal puede crearla con otro estado
        if (cita.getEstado() == null || !Permisos.esPersonal(autenticacion)) {
            cita.setEstado("Pendiente");
        }

        if (!"Cancelada".equals(cita.getEstado())) {
            validarAgenda(cita.getFecha(), cita.getHora(), cita.getServicio(), null);
        }
        return repository.save(cita);
    }

    public Cita actualizar(Long id, Cita cambios, Authentication autenticacion) {
        Cita actual = buscar(id);
        verificarAcceso(actual.getMascota(), autenticacion);

        // Tampoco se puede mover la cita a una mascota que no es suya
        Mascota nuevaMascota = buscarMascota(cambios.getMascota());
        verificarAcceso(nuevaMascota, autenticacion);

        Servicio nuevoServicio = buscarServicio(cambios.getServicio());
        String estadoActual = actual.getEstado();
        String estadoFinal = cambios.getEstado() != null ? cambios.getEstado() : estadoActual;

        if (cambios.getEstado() != null) {
            verificarCambioDeEstado(estadoActual, cambios.getEstado(), autenticacion);
        }

        // Las reglas de horario se exigen solo cuando el horario cambia o cuando una cita cancelada
        // vuelve a ocupar su hora. Así se puede cancelar o marcar como atendida una cita de ayer
        boolean cambioElHorario = !cambios.getFecha().equals(actual.getFecha())
                || !cambios.getHora().equals(actual.getHora())
                || !nuevoServicio.getId().equals(actual.getServicio().getId());
        boolean reactivada = "Cancelada".equals(estadoActual) && !"Cancelada".equals(estadoFinal);

        if (!"Cancelada".equals(estadoFinal) && (cambioElHorario || reactivada)) {
            validarAgenda(cambios.getFecha(), cambios.getHora(), nuevoServicio, id);
        }

        actual.setMascota(nuevaMascota);
        actual.setServicio(nuevoServicio);
        actual.setFecha(cambios.getFecha());
        actual.setHora(cambios.getHora());
        actual.setMotivo(cambios.getMotivo());
        actual.setEstado(estadoFinal);
        return repository.save(actual);
    }

    // Horas ya tomadas de un día (sin datos de nadie): el frontend las usa para mostrar los bloques libres
    public List<Ocupacion> ocupadas(LocalDate fecha) {
        return repository.findByFechaAndEstadoNot(fecha, "Cancelada").stream()
                .map(c -> new Ocupacion(c.getHora(), c.getServicio().getDuracion()))
                .toList();
    }

    // Horario válido (fecha, hora y cierre) y sin cruzarse con otra cita no cancelada del mismo día
    private void validarAgenda(LocalDate fecha, String hora, Servicio servicio, Long idIgnorado) {
        int duracion = servicio.getDuracion();
        ReglasAgenda.validarHorario(fecha, hora, duracion, LocalDate.now(ReglasAgenda.ZONA));

        boolean ocupado = repository.findByFechaAndEstadoNot(fecha, "Cancelada").stream()
                .filter(otra -> !otra.getId().equals(idIgnorado))
                .anyMatch(otra -> ReglasAgenda.seSolapan(
                        hora, duracion, otra.getHora(), otra.getServicio().getDuracion()));

        if (ocupado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese horario ya está ocupado");
        }
    }

    // Solo admin y recepción llegan aquí (lo exige SecurityConfig)
    public void eliminar(Long id) {
        Cita actual = buscar(id);
        repository.delete(actual);
    }

    // 403 si quien consulta no es el dueño de la mascota ni personal de la veterinaria
    private void verificarAcceso(Mascota mascota, Authentication autenticacion) {
        String emailDueno = mascota.getDueno() != null ? mascota.getDueno().getEmail() : null;

        if (!Permisos.puedeAcceder(autenticacion, emailDueno)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para acceder a esta cita");
        }
    }

    // Un cliente puede cancelar o reagendar su cita, pero no confirmarla ni marcarla atendida
    private void verificarCambioDeEstado(String estadoActual, String estadoNuevo, Authentication autenticacion) {
        boolean permitidoAlCliente = estadoNuevo.equals(estadoActual)
                || estadoNuevo.equals("Cancelada")
                || estadoNuevo.equals("Reagendada");

        if (!Permisos.esPersonal(autenticacion) && !permitidoAlCliente) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo el personal puede cambiar la cita a ese estado");
        }
    }

    private Mascota buscarMascota(Mascota mascota) {
        if (mascota == null || mascota.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar el id de la mascota");
        }
        return mascotaRepository.findById(mascota.getId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La mascota indicada no existe"));
    }

    private Servicio buscarServicio(Servicio servicio) {
        if (servicio == null || servicio.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar el id del servicio");
        }
        return servicioRepository.findById(servicio.getId()).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El servicio indicado no existe"));
    }
}