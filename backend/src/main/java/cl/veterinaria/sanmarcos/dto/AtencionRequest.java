package cl.veterinaria.sanmarcos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

// Datos que envía el personal para registrar o editar una atención clínica.
// La mascota no va aquí: viene en la URL (/api/mascotas/{id}/atenciones).
public record AtencionRequest(
        @NotNull(message = "La fecha es obligatoria") LocalDate fecha,
        @NotBlank(message = "El motivo es obligatorio") @Size(max = 200, message = "El motivo no puede superar 200 caracteres") String motivo,
        @Size(max = 1000, message = "El diagnóstico no puede superar 1000 caracteres") String diagnostico,
        @Size(max = 1000, message = "El tratamiento no puede superar 1000 caracteres") String tratamiento) {
}