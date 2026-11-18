package cl.veterinaria.sanmarcos.controller;

import cl.veterinaria.sanmarcos.model.Mascota;
import cl.veterinaria.sanmarcos.service.MascotaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
@CrossOrigin(origins = "http://localhost:5173")
public class MascotaController {

    private final MascotaService service;

    public MascotaController(MascotaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Mascota>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    // GET /api/mascotas/mias: las mascotas del usuario que inició sesión
    @GetMapping("/mias")
    public ResponseEntity<List<Mascota>> mias(Authentication authentication) {
        return ResponseEntity.ok(service.listarPorEmailDueno(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mascota> buscar(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(service.buscar(id, authentication));
    }

    @PostMapping
    public ResponseEntity<Mascota> crear(@Valid @RequestBody Mascota mascota, Authentication authentication) {
        Mascota creada = service.crear(mascota, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mascota> actualizar(@PathVariable Long id,
            @Valid @RequestBody Mascota cambios, Authentication authentication) {
        return ResponseEntity.ok(service.actualizar(id, cambios, authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}