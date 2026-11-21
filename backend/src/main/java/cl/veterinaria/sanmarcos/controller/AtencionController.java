package cl.veterinaria.sanmarcos.controller;

import cl.veterinaria.sanmarcos.dto.AtencionRequest;
import cl.veterinaria.sanmarcos.model.Atencion;
import cl.veterinaria.sanmarcos.service.AtencionService;
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
public class AtencionController {

    private final AtencionService service;

    public AtencionController(AtencionService service) {
        this.service = service;
    }

    // GET /api/mascotas/{mascotaId}/atenciones: el dueño o el personal de la veterinaria
    @GetMapping("/mascotas/{mascotaId}/atenciones")
    public ResponseEntity<List<Atencion>> listar(@PathVariable Long mascotaId, Authentication authentication) {
        return ResponseEntity.ok(service.listarPorMascota(mascotaId, authentication));
    }

    // POST /api/mascotas/{mascotaId}/atenciones: solo admin y recepción
    @PostMapping("/mascotas/{mascotaId}/atenciones")
    public ResponseEntity<Atencion> crear(@PathVariable Long mascotaId,
            @Valid @RequestBody AtencionRequest datos, Authentication authentication) {
        Atencion creada = service.crear(mascotaId, datos, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/atenciones/{id}")
    public ResponseEntity<Atencion> actualizar(@PathVariable Long id, @Valid @RequestBody AtencionRequest datos,
            Authentication authentication) {
        return ResponseEntity.ok(service.actualizar(id, datos, authentication));
    }

    @DeleteMapping("/atenciones/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication authentication) {
        service.eliminar(id, authentication);
        return ResponseEntity.noContent().build();
    }
}