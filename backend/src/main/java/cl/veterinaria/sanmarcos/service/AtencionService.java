package cl.veterinaria.sanmarcos.service;

import cl.veterinaria.sanmarcos.dto.AtencionRequest;
import cl.veterinaria.sanmarcos.model.Atencion;
import cl.veterinaria.sanmarcos.model.Mascota;
import cl.veterinaria.sanmarcos.repository.AtencionRepository;
import cl.veterinaria.sanmarcos.security.Permisos;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class AtencionService {

    private final AtencionRepository repository;
    private final MascotaService mascotaService;

    public AtencionService(AtencionRepository repository, MascotaService mascotaService) {
        this.repository = repository;
        this.mascotaService = mascotaService;
    }

    // Un cliente solo ve el historial de sus mascotas (403 si es de otro); el personal ve todos.
    // buscar() también responde 404 si la mascota no existe.
    public List<Atencion> listarPorMascota(Long mascotaId, Authentication autenticacion) {
        mascotaService.buscar(mascotaId, autenticacion);
        return repository.findByMascotaIdOrderByFechaDescIdDesc(mascotaId);
    }

    // Registrar, editar y borrar es solo del personal: lo exige SecurityConfig y se vuelve a comprobar aquí
    public Atencion crear(Long mascotaId, AtencionRequest datos, Authentication autenticacion) {
        exigirPersonal(autenticacion);
        Mascota mascota = mascotaService.buscar(mascotaId, autenticacion);
        validarFecha(datos);

        Atencion atencion = new Atencion();
        atencion.setMascota(mascota);
        copiar(atencion, datos);
        return repository.save(atencion);
    }

    public Atencion actualizar(Long id, AtencionRequest datos, Authentication autenticacion) {
        exigirPersonal(autenticacion);
        Atencion atencion = buscar(id);
        validarFecha(datos);

        // La mascota no se cambia: una atención pertenece siempre a la mascota donde se registró
        copiar(atencion, datos);
        return repository.save(atencion);
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

    private Atencion buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Atención no encontrada"));
    }

    private void copiar(Atencion atencion, AtencionRequest datos) {
        atencion.setFecha(datos.fecha());
        atencion.setMotivo(datos.motivo().trim());
        atencion.setDiagnostico(vacioANulo(datos.diagnostico()));
        atencion.setTratamiento(vacioANulo(datos.tratamiento()));
    }

    // Un texto en blanco se guarda como "sin dato"
    private String vacioANulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private void validarFecha(AtencionRequest datos) {
        if (datos.fecha().isAfter(LocalDate.now(ReglasAgenda.ZONA))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de la atención no puede ser futura");
        }
    }
}