package cl.veterinaria.sanmarcos.controller;

import cl.veterinaria.sanmarcos.dto.VacunaRequest;
import cl.veterinaria.sanmarcos.model.Vacuna;
import cl.veterinaria.sanmarcos.service.VacunaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class VacunaController {

    private final VacunaService service;

    public VacunaController(VacunaService service) {
        this.service = service;
    }

    // GET /api/mascotas/{mascotaId}/vacunas: el dueño o el personal de la veterinaria
    @GetMapping("/mascotas/{mascotaId}/vacunas")
    public ResponseEntity<List<Vacuna>> listar(@PathVariable Long mascotaId, Authentication authentication) {
        return ResponseEntity.ok(service.listarPorMascota(mascotaId, authentication));
    }

    // POST /api/mascotas/{mascotaId}/vacunas: solo admin y recepción
    @PostMapping("/mascotas/{mascotaId}/vacunas")
    public ResponseEntity<Vacuna> crear(@PathVariable Long mascotaId,
            @Valid @RequestBody VacunaRequest datos, Authentication authentication) {
        Vacuna creada = service.crear(mascotaId, datos, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/vacunas/{id}")
    public ResponseEntity<Vacuna> actualizar(@PathVariable Long id, @Valid @RequestBody VacunaRequest datos,
            Authentication authentication) {
        return ResponseEntity.ok(service.actualizar(id, datos, authentication));
    }

    @DeleteMapping("/vacunas/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication authentication) {
        service.eliminar(id, authentication);
        return ResponseEntity.noContent().build();
    }
}