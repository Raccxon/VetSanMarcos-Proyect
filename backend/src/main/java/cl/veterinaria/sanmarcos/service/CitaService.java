package cl.veterinaria.sanmarcos.service;

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
        return repository.save(cita);
    }

    public Cita actualizar(Long id, Cita cambios, Authentication autenticacion) {
        Cita actual = buscar(id);
        verificarAcceso(actual.getMascota(), autenticacion);

        // Tampoco se puede mover la cita a una mascota que no es suya
        Mascota nuevaMascota = buscarMascota(cambios.getMascota());
        verificarAcceso(nuevaMascota, autenticacion);

        actual.setMascota(nuevaMascota);
        actual.setServicio(buscarServicio(cambios.getServicio()));
        actual.setFecha(cambios.getFecha());
        actual.setHora(cambios.getHora());
        actual.setMotivo(cambios.getMotivo());

        if (cambios.getEstado() != null) {
            verificarCambioDeEstado(actual.getEstado(), cambios.getEstado(), autenticacion);
            actual.setEstado(cambios.getEstado());
        }
        return repository.save(actual);
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