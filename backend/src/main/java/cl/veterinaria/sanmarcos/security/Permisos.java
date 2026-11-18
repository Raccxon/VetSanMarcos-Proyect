package cl.veterinaria.sanmarcos.security;

import org.springframework.security.core.Authentication;

// Reglas de "quién puede ver o modificar qué", compartidas por todos los servicios
public final class Permisos {

    private Permisos() {
    }

    // Admin y recepción atienden a todos los clientes: pueden ver y modificar datos de cualquiera
    public static boolean esPersonal(Authentication autenticacion) {
        return autenticacion.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_RECEPCION"));
    }

    // true si el usuario de la sesión es el dueño indicado o es personal de la veterinaria
    public static boolean puedeAcceder(Authentication autenticacion, String emailDueno) {
        return esPersonal(autenticacion)
                || (emailDueno != null && emailDueno.equalsIgnoreCase(autenticacion.getName()));
    }
}