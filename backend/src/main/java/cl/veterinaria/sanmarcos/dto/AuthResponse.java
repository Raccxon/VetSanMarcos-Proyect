package cl.veterinaria.sanmarcos.dto;

public record AuthResponse(String token, Long id, String nombre, String email, String rol) {
}