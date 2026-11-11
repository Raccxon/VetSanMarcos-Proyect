package cl.veterinaria.sanmarcos.service;

import cl.veterinaria.sanmarcos.model.Cita;
import cl.veterinaria.sanmarcos.model.Mascota;
import cl.veterinaria.sanmarcos.model.Servicio;
import cl.veterinaria.sanmarcos.repository.CitaRepository;
import cl.veterinaria.sanmarcos.repository.MascotaRepository;
import cl.veterinaria.sanmarcos.repository.ServicioRepository;
import org.springframework.http.HttpStatus;
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

    public Cita buscar(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Cita no encontrada"));
    }

    public Cita crear(Cita cita) {
        cita.setId(null);
        cita.setMascota(buscarMascota(cita.getMascota()));
        cita.setServicio(buscarServicio(cita.getServicio()));
        // Toda cita nueva parte como Pendiente
        if (cita.getEstado() == null) {
            cita.setEstado("Pendiente");
        }
        return repository.save(cita);
    }

    public Cita actualizar(Long id, Cita cambios) {
        Cita actual = buscar(id);
        actual.setMascota(buscarMascota(cambios.getMascota()));
        actual.setServicio(buscarServicio(cambios.getServicio()));
        actual.setFecha(cambios.getFecha());
        actual.setHora(cambios.getHora());
        actual.setMotivo(cambios.getMotivo());
        if (cambios.getEstado() != null) {
            actual.setEstado(cambios.getEstado());
        }
        return repository.save(actual);
    }

    public void eliminar(Long id) {
        Cita actual = buscar(id);
        repository.delete(actual);
    }

    private Mascota buscarMascota(Mascota mascota) {
        if (mascota == null || mascota.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar el id de la mascota");
        }
        return mascotaRepository.findById(mascota.getId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "La mascota indicada no existe"));
    }

    private Servicio buscarServicio(Servicio servicio) {
        if (servicio == null || servicio.getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar el id del servicio");
        }
        return servicioRepository.findById(servicio.getId()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "El servicio indicado no existe"));
    }
}