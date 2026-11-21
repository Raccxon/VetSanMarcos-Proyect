package cl.veterinaria.sanmarcos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// Datos que envía el personal para registrar o editar una vacuna.
// La mascota no va aquí: viene en la URL (/api/mascotas/{id}/vacunas).
public record VacunaRequest(
        @NotBlank(message = "El nombre de la vacuna es obligatorio") @Size(max = 100, message = "El nombre no puede superar 100 caracteres") String nombre,
        @NotNull(message = "La fecha de aplicación es obligatoria") LocalDate fechaAplicacion,
        LocalDate fechaVencimiento) {
}