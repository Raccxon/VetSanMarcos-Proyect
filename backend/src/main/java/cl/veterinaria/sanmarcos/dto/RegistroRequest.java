package cl.veterinaria.sanmarcos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotBlank(message = "El correo es obligatorio") @Email(message = "El correo no tiene un formato válido") String email,
        @NotBlank(message = "La contraseña es obligatoria") @Size(min = 4, message = "La contraseña debe tener al menos 4 caracteres") String password,
        @NotBlank(message = "El RUT es obligatorio") @Pattern(regexp = "^\\d{7,8}-[\\dkK]$", message = "El RUT debe tener formato 12345678-9") String rut,
        @NotBlank(message = "El teléfono es obligatorio") @Pattern(regexp = "^9\\d{8}$", message = "El teléfono debe ser un celular de 9 dígitos que empiece con 9") String telefono) {
}