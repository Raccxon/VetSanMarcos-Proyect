package cl.veterinaria.sanmarcos.service;

import cl.veterinaria.sanmarcos.dto.VacunaRequest;
import cl.veterinaria.sanmarcos.model.Mascota;
import cl.veterinaria.sanmarcos.model.Vacuna;
import cl.veterinaria.sanmarcos.repository.VacunaRepository;
import cl.veterinaria.sanmarcos.security.Permisos;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class VacunaService {

    private final VacunaRepository repository;
    private final MascotaService mascotaService;

    public VacunaService(VacunaRepository repository, MascotaService mascotaService) {
        this.repository = repository;
        this.mascotaService = mascotaService;
    }

    // Un cliente solo ve las vacunas de sus mascotas (403 si es de otro); el personal ve todas.
    // buscar() también responde 404 si la mascota no existe.
    public List<Vacuna> listarPorMascota(Long mascotaId, Authentication autenticacion) {
        mascotaService.buscar(mascotaId, autenticacion);
        return repository.findByMascotaIdOrderByFechaAplicacionDescIdDesc(mascotaId);
    }

    // Registrar, editar y borrar es solo del personal: lo exige SecurityConfig y se vuelve a comprobar aquí
    public Vacuna crear(Long mascotaId, VacunaRequest datos, Authentication autenticacion) {
        exigirPersonal(autenticacion);
        Mascota mascota = mascotaService.buscar(mascotaId, autenticacion);
        validarFechas(datos);

        Vacuna vacuna = new Vacuna();
        vacuna.setMascota(mascota);
        copiar(vacuna, datos);
        return repository.save(vacuna);
    }

    public Vacuna actualizar(Long id, VacunaRequest datos, Authentication autenticacion) {
        exigirPersonal(autenticacion);
        Vacuna vacuna = buscar(id);
        validarFechas(datos);

        // La mascota no se cambia: una vacuna pertenece siempre a la mascota donde se registró
        copiar(vacuna, datos);
        return repository.save(vacuna);
    }

    public void eliminar(Long id, Authentication autenticacion) {
        exigirPersonal(autenticacion);
        repository.delete(buscar(id));
    }

    private void exigirPersonal(Authentication autenticacion) {
        if (!Permisos.esPersonal(autenticacion)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el personal puede modificar la ficha clínica");
        }
    }

    private Vacuna buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vacuna no encontrada"));
    }

    private void copiar(Vacuna vacuna, VacunaRequest datos) {
        vacuna.setNombre(datos.nombre().trim());
        vacuna.setFechaAplicacion(datos.fechaAplicacion());
        vacuna.setFechaVencimiento(datos.fechaVencimiento());
    }

    private void validarFechas(VacunaRequest datos) {
        if (datos.fechaAplicacion().isAfter(LocalDate.now(ReglasAgenda.ZONA))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de aplicación no puede ser futura");
        }
        if (datos.fechaVencimiento() != null && datos.fechaVencimiento().isBefore(datos.fechaAplicacion())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El vencimiento no puede ser anterior a la fecha de aplicación");
        }
    }
}