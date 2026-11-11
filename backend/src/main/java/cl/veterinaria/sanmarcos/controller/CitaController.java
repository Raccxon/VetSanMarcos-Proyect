package cl.veterinaria.sanmarcos.controller;

import cl.veterinaria.sanmarcos.model.Cita;
import cl.veterinaria.sanmarcos.service.CitaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService service;

    public CitaController(CitaService service) {
        this.service = service;
    }

    // GET /api/citas o GET /api/citas?duenoId=1
    @GetMapping
    public ResponseEntity<List<Cita>> listar(@RequestParam(required = false) Long duenoId) {
        if (duenoId != null) {
            return ResponseEntity.ok(service.listarPorDueno(duenoId));
        }
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscar(id));
    }

    @PostMapping
    public ResponseEntity<Cita> crear(@Valid @RequestBody Cita cita) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(cita));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cita> actualizar(@PathVariable Long id, @Valid @RequestBody Cita cambios) {
        return ResponseEntity.ok(service.actualizar(id, cambios));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}